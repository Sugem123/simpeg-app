<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Cookie\CookieJar;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Pegawai;
use App\Models\Agama;
use App\Models\Jabatan;
use App\Models\Pangkat;
use App\Models\Golongan;
use App\Models\JenisPegawai;
use App\Models\StatusKepegawaian;
use App\Models\UnitKerja;
use Carbon\Carbon;

class EmasterSyncService
{
    private string $baseUrl = 'https://master.bkd.jatimprov.go.id';
    private string $username;
    private string $password;
    private string $totpSecret;
    private string $skpdId = '105401011';
    private Client $client;
    private CookieJar $cookieJar;

    public function __construct()
    {
        $this->username = env('EMASTER_USERNAME');
        $this->password = env('EMASTER_PASSWORD');
        $this->totpSecret = env('EMASTER_TOTP_SECRET');
        $this->cookieJar = new CookieJar();
        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'timeout' => 60,
            'cookies' => $this->cookieJar,
            'allow_redirects' => false,
            'verify' => true,
        ]);
    }

    /**
     * Full sync: login, fetch data, parse, upsert.
     */
    public function sync(): array
    {
        // Step 1: Login + MFA
        $this->login();

        // Step 2: Fetch Excel PNS (all employees)
        $html = $this->fetchExcelPns();

        // Step 3: Parse HTML table
        $rows = $this->parseHtmlTable($html);

        // Step 4: Upsert each row
        $results = ['created' => 0, 'updated' => 0, 'skipped' => 0, 'errors' => []];

        foreach ($rows as $idx => $row) {
            try {
                $result = $this->upsertPegawai($row);
                $results[$result]++;
            } catch (\Exception $e) {
                $results['errors'][] = "Row {$idx}: " . $e->getMessage();
                $results['skipped']++;
            }
        }

        $results['total_fetched'] = count($rows);
        return $results;
    }

    /**
     * Login to eMaster with username/password + TOTP.
     * Uses Guzzle with CookieJar to handle session cookies from 302 redirects.
     */
    private function login(): void
    {
        // Step 1: POST credentials
        $response = $this->client->post('/cek_login.php', [
            'form_params' => [
                'username' => $this->username,
                'password' => $this->password,
            ],
        ]);

        if ($response->getStatusCode() !== 302) {
            throw new \RuntimeException("Login failed: expected 302 redirect, got HTTP {$response->getStatusCode()}");
        }

        // CookieJar automatically captures PHPSESSID from Set-Cookie headers

        // Step 2: Generate TOTP
        $totp = $this->generateTOTP($this->totpSecret);

        // Step 3: Submit MFA
        $mfaResponse = $this->client->post('/cek_login_mfa.php', [
            'form_params' => [
                'secret_code' => '',
                'username' => $this->username,
                'one_code' => $totp,
            ],
            'headers' => [
                'Referer' => $this->baseUrl . '/fasilitator/index_mfa.php',
            ],
        ]);

        $mfaStatus = $mfaResponse->getStatusCode();
        $mfaBody = (string) $mfaResponse->getBody();

        // Check for login failure
        if (str_contains($mfaBody, 'Login Gagal')) {
            throw new \RuntimeException("MFA login failed: invalid TOTP or credentials");
        }

        // MFA should return 302 (redirect to dashboard) or 200 (dashboard directly)
        if ($mfaStatus !== 302 && $mfaStatus !== 200) {
            throw new \RuntimeException("MFA submission failed: HTTP {$mfaStatus}");
        }

        // Verify we have a session cookie
        $hasSession = false;
        foreach ($this->cookieJar->toArray() as $cookie) {
            if ($cookie['Name'] === 'PHPSESSID') {
                $hasSession = true;
                break;
            }
        }

        if (!$hasSession) {
            throw new \RuntimeException("No PHPSESSID cookie found after MFA login");
        }
    }

    /**
     * Fetch excel_pns.php (returns ALL employees: PNS + PPPK + PPPK Paruh Waktu).
     */
    private function fetchExcelPns(): string
    {
        $response = $this->client->get('/cetak/excel_pns.php', [
            'query' => ['id_skpd' => $this->skpdId],
            'headers' => [
                'Referer' => $this->baseUrl . '/media.php?module=home',
            ],
        ]);

        if ($response->getStatusCode() !== 200) {
            throw new \RuntimeException("Failed to fetch excel_pns: HTTP {$response->getStatusCode()}");
        }

        return (string) $response->getBody();
    }

    /**
     * Parse HTML table from Excel export using DOMDocument.
     * eMaster HTML is malformed — NAMA cell has nested/unclosed <td> tags.
     * DOMDocument auto-closes unclosed tags and handles nested structures.
     */
    private function parseHtmlTable(string $html): array
    {
        // Suppress libxml warnings from malformed HTML
        $previous = libxml_use_internal_errors(true);

        $dom = new \DOMDocument();
        $dom->loadHTML('<?xml encoding="UTF-8">' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);

        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        // Find first table
        $tables = $dom->getElementsByTagName('table');
        if ($tables->length === 0) {
            throw new \RuntimeException("No table found in Excel HTML");
        }

        $table = $tables->item(0);
        $xpath = new \DOMXPath($dom);

        // Extract headers from all <th> elements in the table
        $headers = [];
        $allTh = $xpath->query('.//th', $table);
        foreach ($allTh as $th) {
            $headerText = trim(html_entity_decode($th->nodeValue, ENT_QUOTES, 'UTF-8'));
            $headers[] = $headerText;
        }

        // Extract data rows — get all <tr>, skip those containing <th>
        $rows = [];
        $allTr = $xpath->query('.//tr', $table);

        foreach ($allTr as $tr) {
            // Skip header rows (rows with <th> children)
            $thInRow = $xpath->query('./th', $tr);
            if ($thInRow->length > 0) continue;

            // Get only DIRECT <td> children of this <tr> (not nested ones)
            $tdNodes = $xpath->query('./td', $tr);
            if ($tdNodes->length < 5) continue;

            $cells = [];
            foreach ($tdNodes as $td) {
                // nodeValue includes text from all descendant nodes (including nested <td>)
                $cellValue = trim(html_entity_decode($td->nodeValue, ENT_QUOTES, 'UTF-8'));
                $cells[] = $cellValue;
            }

            // Handle malformed HTML: if cell count > header count,
            // the NAMA cell was split by DOMDocument auto-closing an unclosed <td>.
            // Merge excess cells (the NIP fragment) back into NAMA (index 1).
            $headerCount = count($headers);
            $cellCount = count($cells);

            if ($cellCount > $headerCount) {
                // Merge extra cells into NAMA cell (typically index 1)
                $namaIdx = array_search('NAMA', $headers);
                if ($namaIdx !== false) {
                    $extraCells = array_slice($cells, $headerCount);
                    $cells[$namaIdx] = trim($cells[$namaIdx] . ' ' . implode(' ', $extraCells));
                }
                $cells = array_slice($cells, 0, $headerCount);
            }

            // Map cells to headers
            $row = [];
            for ($i = 0; $i < min(count($headers), count($cells)); $i++) {
                $row[$headers[$i]] = $cells[$i];
            }

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
        $nik = preg_replace('/\s+/', '', $row['NIK'] ?? '');
        if (empty($nik) || strlen($nik) < 6) {
            $nipLama = preg_replace('/\s+/', '', $row['NIP LAMA'] ?? '');
            if (empty($nipLama)) {
                throw new \RuntimeException("No NIK or NIP LAMA found");
            }
            $nik = $nipLama;
        }

        // Parse name and gelar from NAMA field
        [$nama, $gelarDepan, $gelarBelakang, $nipFromName] = $this->parseNama($row['NAMA'] ?? '');

        // Determine NIP (strip spaces — eMaster stores NIP as "19931022 202421 1 006")
        $nip = preg_replace('/\s+/', '', $row['NIP BARU'] ?? '');
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
        $nipLama = preg_replace('/\s+/', '', $row['NIP LAMA'] ?? '') ?: null;
        $nuptk = preg_replace('/\s+/', '', $row['NUPTK'] ?? '') ?: null;
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

        // Find or create by NIK
        $pegawai = Pegawai::where('nik', $nik)->first();
        $isNew = !$pegawai;

        // Generate email (exclude self when updating to prevent self-collision)
        $email = $this->generateEmail($nama, $gelarDepan, $gelarBelakang, $isNew ? null : $nik);

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
        if (preg_match('/(\d{8})\s+(\d{6})\s+(\d)\s+(\d{3})\s*$/', $raw, $m)) {
            $nip = $m[1] . $m[2] . $m[3] . $m[4];
            $raw = preg_replace('/\s+\d{8}\s+\d{6}\s+\d\s+\d{3}\s*$/', '', $raw);
        }

        // Split by comma to extract gelar
        $parts = array_map('trim', explode(',', $raw));
        $nama = $parts[0];
        $gelarDepan = null;
        $gelarBelakang = null;

        if (count($parts) > 1) {
            $firstPart = $parts[0];
            if (preg_match('/^(Drs\.|Dra\.|H\.|Hj\.|Ir\.|Dr\.|Prof\.)\s+/i', $firstPart)) {
                preg_match('/^((?:Drs\.|Dra\.|H\.|Hj\.|Ir\.|Dr\.|Prof\.)\s*)/i', $firstPart, $gd);
                $gelarDepan = trim($gd[1]);
                $nama = trim(substr($firstPart, strlen($gelarDepan)));
            } else {
                $nama = $firstPart;
            }

            $gelarParts = array_slice($parts, 1);
            $gelarBelakang = trim(implode(', ', array_filter($gelarParts, fn($p) => !empty($p)))) ?: null;
        }

        $nama = preg_replace('/\s+/', ' ', trim($nama));

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

        if (preg_match('/^(\d{1,2})-(\d{1,2})-(\d{4})$/', $date, $m)) {
            return $m[3] . '-' . str_pad($m[2], 2, '0', STR_PAD_LEFT) . '-' . str_pad($m[1], 2, '0', STR_PAD_LEFT);
        }

        if (preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $date)) {
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

        if (preg_match('/^([IV]+\/[a-d])/', $golRuang, $m)) {
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

        $sk = StatusKepegawaian::where('nama', $status)->first();
        if ($sk) return $sk->id;

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

        if (stripos($jabatanPtk, 'Guru') !== false || stripos($jabatanPtk, 'BK') !== false) {
            if (stripos($jabatanPtk, 'Bimbingan') !== false || stripos($jabatanPtk, 'BK') !== false) {
                return Jabatan::where('kode', 'GBK')->first()?->id;
            }
            return Jabatan::where('kode', 'GMP')->first()?->id;
        }

        if (stripos($jenisJabatan, 'Pelaksana') !== false) {
            return Jabatan::where('kode', 'STU')->first()?->id;
        }

        return null;
    }

    /**
     * Generate email from name.
     * Pass $excludeNik to skip the current pegawai when checking uniqueness
     * (prevents self-collision when updating existing records).
     */
    private function generateEmail(string $nama, ?string $gelarDepan, ?string $gelarBelakang, ?string $excludeNik = null): string
    {
        $cleanNama = $nama;
        $cleanNama = preg_replace('/\b(S\.Pd|S\.Kom|S\.Si|S\.Sos|M\.Pd|M\.Si|M\.MA|S\.Pd\.|Gr|Drs\.|Dra\.)\b\.?/', '', $cleanNama);
        $cleanNama = preg_replace('/\s+/', ' ', trim($cleanNama));

        $emailName = strtolower($cleanNama);
        $emailName = preg_replace('/[^a-z\s]/', '', $emailName);
        $emailName = preg_replace('/\s+/', '.', $emailName);
        $emailName = trim($emailName, '.');

        if (empty($emailName)) {
            $emailName = 'pegawai.' . substr(md5($nama . time()), 0, 6);
        }

        $email = $emailName . '@sman1prambon.sch.id';

        $base = $email;
        $counter = 1;
        while (Pegawai::where('email', $email)
            ->when($excludeNik, fn($q) => $q->where('nik', '!=', $excludeNik))
            ->exists()) {
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
}
