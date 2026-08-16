import os, textwrap

FILES = {}

# ─── 1. Migration: add columns to pegawai table ─────────────────
FILES['backend/database/migrations/2024_01_01_000016_add_emaster_columns_to_pegawai_table.php'] = '''<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pegawai', function (Blueprint $table) {
            $table->string('nip_lama', 30)->nullable()->after('nip');
            $table->string('status_hukum', 50)->nullable()->after('status_aktif');
            $table->date('tmt_pangkat')->nullable()->after('status_hukum');
            $table->date('tmt_jabatan')->nullable()->after('tmt_pangkat');
            $table->date('tmt_pensiun')->nullable()->after('tmt_jabatan');
            $table->string('jenis_jabatan_emaster', 50)->nullable()->after('tmt_pensiun');
            $table->string('nama_jabatan_emaster', 200)->nullable()->after('jenis_jabatan_emaster');
            $table->string('mapel', 200)->nullable()->after('nama_jabatan_emaster');
            $table->string('sumber_gaji', 100)->nullable()->after('mapel');
            $table->string('wilayah_pembayaran', 100)->nullable()->after('sumber_gaji');
            $table->string('tunjangan_sertifikasi', 20)->nullable()->after('wilayah_pembayaran');
            $table->string('pendidikan_jenjang', 20)->nullable()->after('tunjangan_sertifikasi');
            $table->string('pendidikan_institusi', 200)->nullable()->after('pendidikan_jenjang');
            $table->string('pendidikan_prodi', 200)->nullable()->after('pendidikan_institusi');
            $table->string('pendidikan_thn_lulus', 10)->nullable()->after('pendidikan_prodi');
            $table->timestamp('emaster_synced_at')->nullable()->after('pendidikan_thn_lulus');
        });
    }

    public function down(): void
    {
        Schema::table('pegawai', function (Blueprint $table) {
            $table->dropColumn([
                'nip_lama', 'status_hukum', 'tmt_pangkat', 'tmt_jabatan', 'tmt_pensiun',
                'jenis_jabatan_emaster', 'nama_jabatan_emaster', 'mapel',
                'sumber_gaji', 'wilayah_pembayaran', 'tunjangan_sertifikasi',
                'pendidikan_jenjang', 'pendidikan_institusi', 'pendidikan_prodi',
                'pendidikan_thn_lulus', 'emaster_synced_at',
            ]);
        });
    }
};
'''

# ─── 2. EmasterSyncService ─────────────────────────────────────
FILES['backend/app/Services/EmasterSyncService.php'] = '''<?php

namespace App\\Services;

use Illuminate\\Support\\Facades\\Http;
use Illuminate\\Support\\Facades\\DB;
use Illuminate\\Support\\Str;
use App\\Models\\Pegawai;
use App\\Models\\Agama;
use App\\Models\\Jabatan;
use App\\Models\\Pangkat;
use App\\Models\\Golongan;
use App\\Models\\JenisPegawai;
use App\\Models\\StatusKepegawaian;
use App\\Models\\UnitKerja;
use Carbon\\Carbon;

class EmasterSyncService
{
    private string $baseUrl = 'https://master.bkd.jatimprov.go.id';
    private string $username;
    private string $password;
    private string $totpSecret;
    private string $skpdId = '105401011';

    public function __construct()
    {
        $this->username = config('services.emaster.username', env('EMASTER_USERNAME'));
        $this->password = config('services.emaster.password', env('EMASTER_PASSWORD'));
        $this->totpSecret = config('services.emaster.totp_secret', env('EMASTER_TOTP_SECRET'));
    }

    /**
     * Full sync: login, fetch data, parse, upsert.
     */
    public function sync(): array
    {
        // Step 1: Login + MFA
        $cookies = $this->login();

        // Step 2: Fetch Excel PNS (all employees)
        $html = $this->fetchExcelPns($cookies);

        // Step 3: Parse HTML table
        $rows = $this->parseHtmlTable($html);

        // Step 4: Upsert each row
        $results = ['created' => 0, 'updated' => 0, 'skipped' => 0, 'errors' => []];

        foreach ($rows as $idx => $row) {
            try {
                $result = $this->upsertPegawai($row);
                $results[$result]++;
            } catch (\\Exception $e) {
                $results['errors'][] = "Row {$idx}: " . $e->getMessage();
                $results['skipped']++;
            }
        }

        $results['total_fetched'] = count($rows);
        return $results;
    }

    /**
     * Login to eMaster with username/password + TOTP.
     */
    private function login(): string
    {
        $response = Http::asForm()->post("{$this->baseUrl}/cek_login.php", [
            'username' => $this->username,
            'password' => $this->password,
        ]);

        if (!$response->ok()) {
            throw new \\RuntimeException("Login request failed: HTTP {$response->status()}");
        }

        // Get cookies from login response
        $cookies = $this->extractCookies($response);

        // Generate TOTP
        $totp = $this->generateTOTP($this->totpSecret);

        // Submit MFA
        $mfaResponse = Http::withHeaders([
            'Cookie' => $cookies,
            'Referer' => $this->baseUrl . '/fasilitator/index_mfa.php',
        ])->asForm()->post("{$this->baseUrl}/cek_login_mfa.php", [
            'secret_code' => '',
            'username' => $this->username,
            'one_code' => $totp,
        ]);

        if (!$mfaResponse->ok()) {
            throw new \\RuntimeException("MFA submission failed: HTTP {$mfaResponse->status()}");
        }

        if (str_contains($mfaResponse->body(), 'Login Gagal')) {
            throw new \\RuntimeException("MFA login failed: invalid TOTP or credentials");
        }

        // Merge cookies from MFA response
        $mfaCookies = $this->extractCookies($mfaResponse);
        $cookies = $this->mergeCookies($cookies, $mfaCookies);

        return $cookies;
    }

    /**
     * Fetch excel_pns.php (returns ALL employees: PNS + PPPK + PPPK Paruh Waktu).
     */
    private function fetchExcelPns(string $cookies): string
    {
        $response = Http::withHeaders([
            'Cookie' => $cookies,
            'Referer' => $this->baseUrl . '/media.php?module=home',
        ])->get("{$this->baseUrl}/cetak/excel_pns.php", [
            'id_skpd' => $this->skpdId,
        ]);

        if (!$response->ok()) {
            throw new \\RuntimeException("Failed to fetch excel_pns: HTTP {$response->status()}");
        }

        return $response->body();
    }

    /**
     * Parse HTML table from Excel export.
     */
    private function parseHtmlTable(string $html): array
    {
        // Find table
        if (!preg_match('/<table[^>]*>(.*?)<\\/table>/is', $html, $tableMatch)) {
            throw new \\RuntimeException("No table found in Excel HTML");
        }

        $tableHtml = $tableMatch[1];

        // Extract headers
        preg_match_all('/<th[^>]*>(.*?)<\\/th>/is', $tableHtml, $thMatches);
        $headers = array_map(fn($h) => trim(strip_tags($h)), $thMatches[1]);

        // Extract rows
        preg_match_all('/<tr[^>]*>(.*?)<\\/tr>/is', $tableHtml, $trMatches);
        $rows = [];

        foreach ($trMatches[1] as $trHtml) {
            // Skip header rows
            if (str_contains($trHtml, '<th')) continue;

            preg_match_all('/<td[^>]*>(.*?)<\\/td>/is', $trHtml, $tdMatches);
            $cells = array_map(fn($c) => trim(html_entity_decode(strip_tags($c), ENT_QUOTES, 'UTF-8')), $tdMatches[1]);

            if (count($cells) < 5) continue;

            // Map cells to headers
            $row = [];
            $cellCount = count($cells);
            for ($i = 0; $i < min(count($headers), $cellCount); $i++) {
                $row[$headers[$i]] = $cells[$i];
            }

            // The Excel HTML sometimes merges cells across rows.
            // The NAMA field contains: "NAME GELAR YYYYMMDD YYYYMM G NNN"
            // We need to parse this properly.
            if (!empty($row['NAMA'])) {
                $rows[] = $row;
            }
        }

        return $rows;
    }

    /**
     * Upsert a pegawai record from eMaster row data.
     */
    private function upsertPegawai(array $row): string
    {
        // Parse NIK (clean spaces)
        $nik = preg_replace('/\\s+/', '', $row['NIK'] ?? '');
        if (empty($nik) || strlen($nik) < 6) {
            // Try to use NIP LAMA or extract from NAMA as fallback
            $nipLama = preg_replace('/\\s+/', '', $row['NIP LAMA'] ?? '');
            if (empty($nipLama)) {
                throw new \\RuntimeException("No NIK or NIP LAMA found");
            }
            $nik = $nipLama;
        }

        // Parse name and gelar from NAMA field
        [$nama, $gelarDepan, $gelarBelakang, $nipFromName] = $this->parseNama($row['NAMA'] ?? '');

        // Determine NIP
        $nip = trim($row['NIP BARU'] ?? '');
        if (empty($nip) && !empty($nipFromName)) {
            $nip = $nipFromName;
        }
        if (empty($nip)) {
            $nip = null;
        }

        // Parse tanggal lahir
        $tanggalLahir = $this->parseDate($row['TGL LAHIR'] ?? '');
        $tempatLahir = trim($row['TEMPAT LAHIR'] ?? '');

        // Map agama
        $agamaId = $this->findAgamaId($row['AGAMA'] ?? '');

        // Map status kepegawaian
        $statusKepegawaianId = $this->findStatusKepegawaianId($row['STATUS PNS/CPNS'] ?? '');

        // Map jenis pegawai
        $jenisJabatan = trim($row['JENIS JABATAN'] ?? '');
        $jenisPegawaiId = $this->findJenisPegawaiId($jenisJabatan);

        // Map jabatan
        $jabatanPtk = trim($row['JABATAN PTK'] ?? '');
        $jabatanId = $this->findJabatanId($jabatanPtk, $jenisJabatan);

        // Map pangkat + golongan
        $golRuang = trim($row['GOL. RUANG'] ?? '');
        [$pangkatId, $golonganId] = $this->parseGolRuang($golRuang);

        // Parse other fields
        $nipLama = preg_replace('/\\s+/', '', $row['NIP LAMA'] ?? '') ?: null;
        $nuptk = preg_replace('/\\s+/', '', $row['NUPTK'] ?? '') ?: null;
        $jenisKelamin = strtoupper(trim($row['JK'] ?? '')) === 'P' ? 'P' : 'L';
        $alamat = trim($row['ALAMAT KTP'] ?? '') ?: null;
        $statusHukum = trim($row['STATUS HUKUM PEGAWAI'] ?? '') ?: null;
        $statusAktif = strtolower($statusHukum ?? '') === 'aktif';

        // Parse TMT dates
        $tmtPangkat = $this->parseDate($row['TMT PANGKAT'] ?? '');
        $tmtJabatan = $this->parseDate($row['TMT JABATAN'] ?? '');
        $tmtPensiun = $this->parseDate($row['TMT PENSIUN'] ?? '');

        // Other eMaster fields
        $namaJabatanEmaster = trim($row['NAMA JABATAN'] ?? '') ?: null;
        $mapel = trim($row['MAPEL'] ?? '') ?: null;
        $sumberGaji = trim($row['SUMBER GAJI'] ?? '') ?: null;
        $wilayahPembayaran = trim($row['WILAYAH PEMBAYARAN'] ?? '') ?: null;
        $tunjanganSertifikasi = trim($row['TUNJANGAN SERTIFIKASI'] ?? '') ?: null;

        // Pendidikan
        $pendJenjang = trim($row['JENJANG'] ?? '') ?: null;
        $pendInstitusi = trim($row['NAMA SEKOLAH'] ?? '') ?: null;
        $pendProdi = trim($row['PRODI'] ?? '') ?: null;
        $pendThnLulus = trim($row['THN LULUS'] ?? '') ?: null;

        // Unit kerja (all SMAN 1 Prambon)
        $unitKerjaId = UnitKerja::where('nama', 'like', '%SMAN 1 PRAMBON%')->first()?->id;

        // Generate email if not exists
        $email = $this->generateEmail($nama, $gelarDepan, $gelarBelakang);

        // Find or create by NIK
        $pegawai = Pegawai::where('nik', $nik)->first();
        $isNew = !$pegawai;

        if (!$pegawai) {
            $pegawai = new Pegawai();
            $pegawai->id = Str::uuid();
            $pegawai->nik = $nik;
        }

        // Update fields
        $pegawai->nip = $nip;
        $pegawai->nip_lama = $nipLama;
        $pegawai->nuptk = $nuptk;
        $pegawai->nama = $nama;
        $pegawai->gelar_depan = $gelarDepan;
        $pegawai->gelar_belakang = $gelarBelakang;
        $pegawai->tempat_lahir = $tempatLahir ?: 'Unknown';
        $pegawai->tanggal_lahir = $tanggalLahir ?: now();
        $pegawai->jenis_kelamin = $jenisKelamin;
        $pegawai->agama_id = $agamaId;
        $pegawai->jenis_pegawai_id = $jenisPegawaiId;
        $pegawai->status_kepegawaian_id = $statusKepegawaianId;
        $pegawai->jabatan_id = $jabatanId;
        $pegawai->pangkat_id = $pangkatId;
        $pegawai->golongan_id = $golonganId;
        $pegawai->unit_kerja_id = $unitKerjaId;
        $pegawai->alamat = $alamat;
        $pegawai->email = $email;
        $pegawai->status_aktif = $statusAktif;

        // eMaster fields
        $pegawai->status_hukum = $statusHukum;
        $pegawai->tmt_pangkat = $tmtPangkat;
        $pegawai->tmt_jabatan = $tmtJabatan;
        $pegawai->tmt_pensiun = $tmtPensiun;
        $pegawai->jenis_jabatan_emaster = $jenisJabatan ?: null;
        $pegawai->nama_jabatan_emaster = $namaJabatanEmaster;
        $pegawai->mapel = $mapel;
        $pegawai->sumber_gaji = $sumberGaji;
        $pegawai->wilayah_pembayaran = $wilayahPembayaran;
        $pegawai->tunjangan_sertifikasi = $tunjanganSertifikasi;
        $pegawai->pendidikan_jenjang = $pendJenjang;
        $pegawai->pendidikan_institusi = $pendInstitusi;
        $pegawai->pendidikan_prodi = $pendProdi;
        $pegawai->pendidikan_thn_lulus = $pendThnLulus;
        $pegawai->emaster_synced_at = now();

        $pegawai->save();

        // Create riwayat records (only for new records to avoid duplicates)
        if ($isNew) {
            $this->createRiwayat($pegawai, $row, $pangkatId, $golonganId, $jabatanId);
        }

        return $isNew ? 'created' : 'updated';
    }

    /**
     * Parse NAMA field: "ACHMAD SYAIFUL, S.Pd 19931022 202421 1 0"
     * Returns: [nama, gelar_depan, gelar_belakang, nip_from_name]
     */
    private function parseNama(string $raw): array
    {
        $raw = trim($raw);

        // Extract NIP-like pattern at end: YYYYMMDD YYYYMM G NNN
        $nip = null;
        if (preg_match('/(\\d{8})\\s+(\\d{6})\\s+(\\d)\\s+(\\d{3})\\s*$/', $raw, $m)) {
            $nip = $m[1] . $m[2] . $m[3] . $m[4];
            // Remove NIP from name
            $raw = preg_replace('/\\s+\\d{8}\\s+\\d{6}\\s+\\d\\s+\\d{3}\\s*$/', '', $raw);
        }

        // Split by comma to extract gelar
        $parts = array_map('trim', explode(',', $raw));
        $nama = $parts[0];
        $gelarDepan = null;
        $gelarBelakang = null;

        if (count($parts) > 1) {
            // First part could be gelar depan (e.g., "Drs." or "H.")
            // Check if first part is a known gelar depan
            $firstPart = $parts[0];
            if (preg_match('/^(Drs\\.|Dra\\.|H\\.|Hj\\.|Ir\\.|Dr\\.|Prof\\.)\\s+/i', $firstPart)) {
                preg_match('/^((?:Drs\\.|Dra\\.|H\\.|Hj\\.|Ir\\.|Dr\\.|Prof\\.)\\s*)/i', $firstPart, $gd);
                $gelarDepan = trim($gd[1]);
                $nama = trim(substr($firstPart, strlen($gelarDepan)));
            } else {
                $nama = $firstPart;
            }

            // Remaining parts are gelar belakang
            $gelarParts = array_slice($parts, 1);
            $gelarBelakang = trim(implode(', ', array_filter($gelarParts, fn($p) => !empty($p)))) ?: null;
        }

        // Clean up nama
        $nama = preg_replace('/\\s+/', ' ', trim($nama));

        return [$nama, $gelarDepan, $gelarBelakang, $nip];
    }

    /**
     * Parse date from DD-MM-YYYY to YYYY-MM-DD.
     */
    private function parseDate(string $date): ?string
    {
        $date = trim($date);
        if (empty($date) || $date === '--' || $date === '-') {
            return null;
        }

        // Try DD-MM-YYYY
        if (preg_match('/^(\\d{1,2})-(\\d{1,2})-(\\d{4})$/', $date, $m)) {
            return $m[3] . '-' . str_pad($m[2], 2, '0', STR_PAD_LEFT) . '-' . str_pad($m[1], 2, '0', STR_PAD_LEFT);
        }

        // Try YYYY-MM-DD already
        if (preg_match('/^(\\d{4})-(\\d{2})-(\\d{2})$/', $date)) {
            return $date;
        }

        return null;
    }

    /**
     * Parse GOL. RUANG: "IV/c - Pembina Utama Muda"
     * Returns: [pangkat_id, golongan_id]
     */
    private function parseGolRuang(string $golRuang): array
    {
        if (empty($golRuang) || $golRuang === '-') {
            return [null, null];
        }

        // Extract kode (e.g., "IV/c")
        if (preg_match('/^([IV]+\\/[a-d])/', $golRuang, $m)) {
            $kode = $m[1];
            $pangkat = Pangkat::where('kode', $kode)->first();
            $golongan = Golongan::where('kode', $kode)->first();
            return [$pangkat?->id, $golongan?->id];
        }

        return [null, null];
    }

    /**
     * Find agama ID by name.
     */
    private function findAgamaId(string $nama): ?string
    {
        $nama = trim($nama);
        if (empty($nama)) return null;

        $agama = Agama::where('nama', $nama)->first();
        if (!$agama) {
            // Try case-insensitive
            $agama = Agama::whereRaw('LOWER(nama) = ?', [strtolower($nama)])->first();
        }
        return $agama?->id;
    }

    /**
     * Find status kepegawaian ID.
     */
    private function findStatusKepegawaianId(string $status): ?string
    {
        $status = trim($status);
        if (empty($status)) return null;

        // Direct match
        $sk = StatusKepegawaian::where('nama', $status)->first();
        if ($sk) return $sk->id;

        // Try partial match
        $sk = StatusKepegawaian::where('nama', 'like', "%{$status}%")->first();
        return $sk?->id;
    }

    /**
     * Find jenis pegawai ID from jenis jabatan.
     */
    private function findJenisPegawaiId(string $jenisJabatan): ?string
    {
        $jenisJabatan = strtolower(trim($jenisJabatan));
        if (str_contains($jenisJabatan, 'fungsional')) {
            return JenisPegawai::where('nama', 'Guru')->first()?->id;
        }
        if (str_contains($jenisJabatan, 'pelaksana')) {
            return JenisPegawai::where('nama', 'Staf')->first()?->id;
        }
        return JenisPegawai::where('nama', 'Guru')->first()?->id;
    }

    /**
     * Find or create jabatan ID from JABATAN PTK field.
     */
    private function findJabatanId(string $jabatanPtk, string $jenisJabatan): ?string
    {
        $jabatanPtk = trim($jabatanPtk);
        if (empty($jabatanPtk)) return null;

        // Map common eMaster jabatan to SIMPEG jabatan
        $mappings = [
            'Kepala Sekolah SLTA Sederajat' => 'KS',
            'Kepala Sekolah' => 'KS',
            'Wakil Kepala Kurikulum/Akademi' => 'WKS1',
            'Wakil Kepala Kesiswaan' => 'WKS2',
            'Wakil Kepala Sarana Prasarana' => 'WKS3',
            'Wakil Kepala Humas' => 'WKS4',
            'Guru' => 'GMP',
            'Tenaga Administrasi' => 'STU',
            'Pengadministrasi Perkantoran' => 'STU',
            'Operator Layanan Operasional' => 'STU',
            'Penata Layanan Operasional' => 'STU',
        ];

        foreach ($mappings as $emasterName => $simpegKode) {
            if (stripos($jabatanPtk, $emasterName) !== false) {
                return Jabatan::where('kode', $simpegKode)->first()?->id;
            }
        }

        // If jabatan contains "Guru" and jenis is fungsional
        if (stripos($jabatanPtk, 'Guru') !== false || stripos($jabatanPtk, 'BK') !== false) {
            // Check if it's BK
            if (stripos($jabatanPtk, 'Bimbingan') !== false || stripos($jabatanPtk, 'BK') !== false) {
                return Jabatan::where('kode', 'GBK')->first()?->id;
            }
            return Jabatan::where('kode', 'GMP')->first()?->id;
        }

        // If pelaksana/staf
        if (stripos($jenisJabatan, 'Pelaksana') !== false) {
            return Jabatan::where('kode', 'STU')->first()?->id;
        }

        return null;
    }

    /**
     * Generate email from name.
     */
    private function generateEmail(string $nama, ?string $gelarDepan, ?string $gelarBelakang): string
    {
        // Remove gelar from nama
        $cleanNama = $nama;
        // Remove common gelar
        $cleanNama = preg_replace('/\\b(S\\.Pd|S\\.Kom|S\\.Si|S\\.Sos|M\\.Pd|M\\.Si|M\\.MA|S\\.Pd\\.|Gr|Drs\\.|Dra\\.)\\b\\.?/', '', $cleanNama);
        $cleanNama = preg_replace('/\\s+/', ' ', trim($cleanNama));

        // Convert to email format: firstname.lastname@sman1prambon.sch.id
        $emailName = strtolower($cleanNama);
        $emailName = preg_replace('/[^a-z\\s]/', '', $emailName);
        $emailName = preg_replace('/\\s+/', '.', $emailName);
        $emailName = trim($emailName, '.');

        if (empty($emailName)) {
            $emailName = 'pegawai.' . substr(md5($nama . time()), 0, 6);
        }

        $email = $emailName . '@sman1prambon.sch.id';

        // Ensure uniqueness
        $base = $email;
        $counter = 1;
        while (Pegawai::where('email', $email)->where('nik', '!=', request()->input('nik', ''))->exists()) {
            $email = $base . '.' . $counter;
            $counter++;
        }

        return $email;
    }

    /**
     * Create riwayat records for new pegawai.
     */
    private function createRiwayat(Pegawai $pegawai, array $row, ?string $pangkatId, ?string $golonganId, ?string $jabatanId): void
    {
        // Riwayat Pangkat
        if ($pangkatId && $golonganId) {
            $tmt = $this->parseDate($row['TMT PANGKAT'] ?? '');
            if ($tmt) {
                DB::table('riwayat_pangkat')->insert([
                    'id' => Str::uuid(),
                    'pegawai_id' => $pegawai->id,
                    'pangkat_id' => $pangkatId,
                    'golongan_id' => $golonganId,
                    'tmt' => $tmt,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Riwayat Jabatan
        if ($jabatanId) {
            $tmt = $this->parseDate($row['TMT JABATAN'] ?? '');
            if ($tmt) {
                DB::table('riwayat_jabatan')->insert([
                    'id' => Str::uuid(),
                    'pegawai_id' => $pegawai->id,
                    'jabatan_id' => $jabatanId,
                    'tmt' => $tmt,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Riwayat Pendidikan
        $jenjang = trim($row['JENJANG'] ?? '');
        $institusi = trim($row['NAMA SEKOLAH'] ?? '');
        $prodi = trim($row['PRODI'] ?? '');
        $thnLulus = trim($row['THN LULUS'] ?? '');

        if ($jenjang && $jenjang !== '-' && $institusi && $institusi !== '-' && $thnLulus && $thnLulus !== '-') {
            $year = (int) $thnLulus;
            if ($year > 1900 && $year < 2100) {
                DB::table('riwayat_pendidikan')->insert([
                    'id' => Str::uuid(),
                    'pegawai_id' => $pegawai->id,
                    'jenjang' => $jenjang,
                    'institusi' => $institusi,
                    'jurusan' => ($prodi && $prodi !== '-') ? $prodi : null,
                    'tahun_lulus' => $year,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    /**
     * Generate TOTP from Base32 secret key.
     */
    private function generateTOTP(string $secret): string
    {
        $key = $this->base32Decode($secret);
        $counter = floor(time() / 30);
        $binary = pack('N*', 0) . pack('N*', $counter);
        $hash = hash_hmac('sha1', $binary, $key, true);
        $offset = ord($hash[strlen($hash) - 1]) & 0x0F;
        $code = (
            ((ord($hash[$offset]) & 0x7F) << 24) |
            ((ord($hash[$offset + 1]) & 0xFF) << 16) |
            ((ord($hash[$offset + 2]) & 0xFF) << 8) |
            (ord($hash[$offset + 3]) & 0xFF)
        ) % 1000000;
        return str_pad($code, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Base32 decode.
     */
    private function base32Decode(string $b32): string
    {
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $b32 = strtoupper(rtrim($b32, '='));
        $bits = '';
        for ($i = 0; $i < strlen($b32); $i++) {
            $pos = strpos($alphabet, $b32[$i]);
            if ($pos === false) continue;
            $bits .= str_pad(decbin($pos), 5, '0', STR_PAD_LEFT);
        }
        $bytes = '';
        for ($i = 0; $i + 8 <= strlen($bits); $i += 8) {
            $bytes .= chr(bindec(substr($bits, $i, 8)));
        }
        return $bytes;
    }

    /**
     * Extract cookies from HTTP response.
     */
    private function extractCookies($response): string
    {
        $cookies = [];
        $setCookies = $response->headers('Set-Cookie') ?? [];
        if (!is_array($setCookies)) {
            $setCookies = [$setCookies];
        }
        foreach ($setCookies as $sc) {
            if (preg_match('/([^=]+)=([^;]+)/', $sc, $m)) {
                $cookies[trim($m[1])] = trim($m[2]);
            }
        }
        $parts = [];
        foreach ($cookies as $k => $v) {
            $parts[] = "{$k}={$v}";
        }
        return implode('; ', $parts);
    }

    /**
     * Merge cookie strings.
     */
    private function mergeCookies(string ...$cookieStrings): string
    {
        $cookies = [];
        foreach ($cookieStrings as $cs) {
            $pairs = explode('; ', $cs);
            foreach ($pairs as $pair) {
                if (str_contains($pair, '=')) {
                    [$k, $v] = explode('=', $pair, 2);
                    $cookies[trim($k)] = trim($v);
                }
            }
        }
        $parts = [];
        foreach ($cookies as $k => $v) {
            $parts[] = "{$k}={$v}";
        }
        return implode('; ', $parts);
    }
}
'''

# ─── 3. EmasterSyncController ──────────────────────────────────
FILES['backend/app/Http/Controllers/Api/V1/EmasterSyncController.php'] = '''<?php

namespace App\\Http\\Controllers\\Api\\V1;

use App\\Http\\Controllers\\Controller;
use App\\Services\\EmasterSyncService;
use Illuminate\\Http\\JsonResponse;

class EmasterSyncController extends Controller
{
    public function sync(): JsonResponse
    {
        try {
            $service = new EmasterSyncService();
            $result = $service->sync();

            return response()->json([
                'success' => true,
                'message' => "Sync completed: {$result['created']} created, {$result['updated']} updated, {$result['skipped']} skipped",
                'data' => $result,
            ]);
        } catch (\\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Sync failed: ' . $e->getMessage(),
                'data' => null,
            ], 500);
        }
    }
}
'''

# ─── Write all files ────────────────────────────────────────────
base = '/home/dhonawid/simpeg-app'
for relpath, content in FILES.items():
    fullpath = os.path.join(base, relpath)
    os.makedirs(os.path.dirname(fullpath), exist_ok=True)
    with open(fullpath, 'w') as f:
        f.write(content)
    print(f"WROTE: {relpath}")

print("\\nALL_FILES_WRITTEN")
