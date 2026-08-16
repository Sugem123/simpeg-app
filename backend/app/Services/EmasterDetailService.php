<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Cookie\CookieJar;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Pegawai;
use App\Models\Pangkat;
use App\Models\Golongan;
use App\Models\Jabatan;

class EmasterDetailService
{
    private string $baseUrl = 'https://master.bkd.jatimprov.go.id';
    private string $username;
    private string $password;
    private string $totpSecret;
    private string $skpdHash = '05804f4f6ea16da57b18b6a4c22bb18f';
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
     * Sync riwayat details from eMaster per-pegawai detail pages.
     *
     * @param int $maxPegawai 0 = no limit, >0 = process only N pegawai (for testing)
     * @return array
     */
    public function syncDetails(int $maxPegawai = 0): array
    {
        $stats = [
            'pegawai_processed' => 0,
            'pangkat_created' => 0,
            'jabatan_created' => 0,
            'pendidikan_created' => 0,
            'diklat_created' => 0,
            'errors' => [],
        ];

        try {
            $this->login();
        } catch (\Exception $e) {
            $stats['errors'][] = 'Login failed: ' . $e->getMessage();
            return $stats;
        }

        $pegawaiList = $this->fetchPegawaiList();
        $stats['pegawai_found'] = count($pegawaiList);

        if ($maxPegawai > 0) {
            $pegawaiList = array_slice($pegawaiList, 0, $maxPegawai);
        }

        foreach ($pegawaiList as $info) {
            try {
                $pegawai = Pegawai::where('nip', $info['nip'])->first();
                if (!$pegawai) {
                    $stats['errors'][] = "NIP {$info['nip']} not found in SIMPEG";
                    continue;
                }

                $stats['pegawai_processed']++;

                $stats['pangkat_created'] += $this->syncPangkat($pegawai, $info['hash'], $info['skpd_hash']);
                $stats['jabatan_created'] += $this->syncJabatan($pegawai, $info['hash'], $info['skpd_hash']);
                $stats['pendidikan_created'] += $this->syncPendidikan($pegawai, $info['hash'], $info['skpd_hash']);
                $stats['diklat_created'] += $this->syncDiklat($pegawai, $info['hash'], $info['skpd_hash']);
            } catch (\Exception $e) {
                $stats['errors'][] = "Pegawai {$info['nip']}: " . $e->getMessage();
            }
        }

        return $stats;
    }

    /**
     * Login to eMaster with username/password + TOTP.
     */
    private function login(): void
    {
        $response = $this->client->post('/cek_login.php', [
            'form_params' => [
                'username' => $this->username,
                'password' => $this->password,
            ],
        ]);

        if ($response->getStatusCode() !== 302) {
            throw new \RuntimeException("Login failed: expected 302, got HTTP {$response->getStatusCode()}");
        }

        $totp = $this->generateTOTP($this->totpSecret);

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

        $mfaBody = (string) $mfaResponse->getBody();
        if (str_contains($mfaBody, 'Login Gagal')) {
            throw new \RuntimeException("MFA login failed: invalid TOTP or credentials");
        }

        if ($mfaResponse->getStatusCode() !== 302 && $mfaResponse->getStatusCode() !== 200) {
            throw new \RuntimeException("MFA failed: HTTP {$mfaResponse->getStatusCode()}");
        }
    }

    /**
     * Fetch pegawai list from all pages (6 pages, 10 pegawai/page).
     * Returns array of ['nip' => string, 'hash' => string, 'skpd_hash' => string].
     */
    private function fetchPegawaiList(): array
    {
        $list = [];
        $seenNips = [];
        $maxPages = 20;

        for ($page = 1; $page <= $maxPages; $page++) {
            try {
                $response = $this->client->get('/media.php', [
                    'query' => [
                        'module' => 'pegawai',
                        'id_skpd' => $this->skpdHash,
                        'halaman' => $page,
                    ],
                    'headers' => [
                        'Referer' => $this->baseUrl . '/media.php?module=home',
                    ],
                ]);

                if ($response->getStatusCode() !== 200) {
                    break;
                }

                $html = (string) $response->getBody();
                $pageList = $this->parsePegawaiList($html);

                if (empty($pageList)) {
                    break;
                }

                foreach ($pageList as $item) {
                    if (isset($seenNips[$item['nip']])) {
                        continue;
                    }
                    $seenNips[$item['nip']] = true;
                    $list[] = $item;
                }

                $nextPage = $page + 1;
                if (!str_contains($html, "halaman={$nextPage}")) {
                    break;
                }
            } catch (\Exception $e) {
                break;
            }
        }

        return $list;
    }

    /**
     * Parse pegawai list HTML: extract NIP from <font color=#0066FF> and hash from dashboard links.
     */
    private function parsePegawaiList(string $html): array
    {
        $list = [];

        $nips = [];
        if (preg_match_all('/<font color=#0066FF>(\d{8}\s+\d{6}\s+\d\s+\d{3})<\/font>/i', $html, $m)) {
            $nips = $m[1];
        }

        $skpdHashes = [];
        $hashes = [];
        if (preg_match_all('/module=dashboard&id_skpd=([a-f0-9]+)&id=([a-f0-9]+)/i', $html, $m)) {
            $skpdHashes = $m[1];
            $hashes = $m[2];
        }

        $count = min(count($nips), count($hashes));
        for ($i = 0; $i < $count; $i++) {
            $nip = preg_replace('/\s+/', '', $nips[$i]);
            $list[] = [
                'nip' => $nip,
                'hash' => $hashes[$i],
                'skpd_hash' => $skpdHashes[$i] ?? $this->skpdHash,
            ];
        }

        return $list;
    }

    /**
     * Sync riwayat pangkat from eMaster pangkat detail page.
     */
    private function syncPangkat(Pegawai $pegawai, string $hash, string $skpdHash): int
    {
        $html = $this->fetchModulePage('pangkat', $hash, $skpdHash);
        $parsed = $this->parseDetailTable($html);
        $rows = $parsed['rows'];
        $headers = $parsed['headers'];

        $golIdx = $this->findColumnIndex($headers, ['gol', 'ruang']) ?? 2;
        $tmtIdx = $this->findColumnIndex($headers, ['tmt']) ?? 6;
        $ketIdx = $this->findColumnIndex($headers, ['keterangan']) ?? 7;

        $created = 0;

        foreach ($rows as $row) {
            try {
                $golRuang = trim($row[$golIdx] ?? '');
                if (empty($golRuang) || $golRuang === '-') {
                    continue;
                }

                $pangkatId = null;
                $golonganId = null;
                if (preg_match('/^([IV]+\/[a-d])/', $golRuang, $m)) {
                    $kode = $m[1];
                    $pangkat = Pangkat::where('kode', $kode)->first();
                    $golongan = Golongan::where('kode', $kode)->first();
                    $pangkatId = $pangkat?->id;
                    $golonganId = $golongan?->id;
                }

                if (!$pangkatId && !$golonganId) {
                    continue;
                }

                $tmt = $this->parseIndonesianDate($row[$tmtIdx] ?? '');
                $keterangan = trim($row[$ketIdx] ?? '');
                $nomorSk = ($keterangan && $keterangan !== '-') ? $keterangan : null;

                if (!$tmt) {
                    continue;
                }

                $exists = DB::table('riwayat_pangkat')
                    ->where('pegawai_id', $pegawai->id)
                    ->where('tmt', $tmt)
                    ->where('pangkat_id', $pangkatId)
                    ->exists();

                if ($exists) {
                    continue;
                }

                DB::table('riwayat_pangkat')->insert([
                    'id' => Str::uuid(),
                    'pegawai_id' => $pegawai->id,
                    'pangkat_id' => $pangkatId,
                    'golongan_id' => $golonganId,
                    'nomor_sk' => $nomorSk,
                    'tanggal_sk' => null,
                    'tmt' => $tmt,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $created++;
            } catch (\Exception $e) {
            }
        }

        return $created;
    }

    /**
     * Sync riwayat jabatan from eMaster jab_fungsional and jab_pelaksana pages.
     */
    private function syncJabatan(Pegawai $pegawai, string $hash, string $skpdHash): int
    {
        $created = 0;

        $modules = ['jab_fungsional', 'jab_pelaksana'];
        foreach ($modules as $module) {
            try {
                $html = $this->fetchModulePage($module, $hash, $skpdHash);
                $parsed = $this->parseDetailTable($html);
                $rows = $parsed['rows'];
                $headers = $parsed['headers'];

                $namaIdx = $this->findColumnIndex($headers, ['nama jabatan', 'jabatan']) ?? 2;
                $tmtIdx = $this->findColumnIndex($headers, ['tmt']) ?? 4;
                $instansiIdx = $this->findColumnIndex($headers, ['instansi']) ?? 3;

                foreach ($rows as $row) {
                    try {
                        $namaJabatan = trim($row[$namaIdx] ?? '');
                        if (empty($namaJabatan) || $namaJabatan === '-') {
                            continue;
                        }

                        $tmt = $this->parseIndonesianDate($row[$tmtIdx] ?? '');
                        if (!$tmt) {
                            continue;
                        }

                        $jabatanId = $this->matchJabatan($namaJabatan);
                        $instansi = trim($row[$instansiIdx] ?? '');
                        $keterangan = $namaJabatan;
                        if ($instansi && $instansi !== '-') {
                            $keterangan .= ' @ ' . $instansi;
                        }

                        $exists = DB::table('riwayat_jabatan')
                            ->where('pegawai_id', $pegawai->id)
                            ->where('tmt', $tmt)
                            ->where('keterangan', $keterangan)
                            ->exists();

                        if ($exists) {
                            continue;
                        }

                        DB::table('riwayat_jabatan')->insert([
                            'id' => Str::uuid(),
                            'pegawai_id' => $pegawai->id,
                            'jabatan_id' => $jabatanId,
                            'nomor_sk' => null,
                            'tanggal_sk' => null,
                            'tmt' => $tmt,
                            'keterangan' => $keterangan,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                        $created++;
                    } catch (\Exception $e) {
                    }
                }
            } catch (\Exception $e) {
            }
        }

        return $created;
    }

    /**
     * Sync riwayat pendidikan from eMaster pendidikan detail page.
     */
    private function syncPendidikan(Pegawai $pegawai, string $hash, string $skpdHash): int
    {
        $html = $this->fetchModulePage('pendidikan', $hash, $skpdHash);
        $parsed = $this->parseDetailTable($html);
        $rows = $parsed['rows'];
        $headers = $parsed['headers'];

        $jenjangIdx = $this->findColumnIndex($headers, ['jenjang']) ?? 3;
        $sekolahIdx = $this->findColumnIndex($headers, ['sekolah', 'institusi', 'nama sekolah']) ?? 4;
        $prodiIdx = $this->findColumnIndex($headers, ['prodi', 'jurusan']) ?? 5;
        $tahunIdx = $this->findColumnIndex($headers, ['tahun lulus', 'tahun']) ?? 6;

        $created = 0;

        foreach ($rows as $row) {
            try {
                $jenjang = trim($row[$jenjangIdx] ?? '');
                $institusi = trim($row[$sekolahIdx] ?? '');
                $prodi = trim($row[$prodiIdx] ?? '');
                $tahunLulus = trim($row[$tahunIdx] ?? '');

                if (empty($jenjang) || $jenjang === '-') {
                    continue;
                }
                if (empty($institusi) || $institusi === '-') {
                    continue;
                }

                $tahunInt = is_numeric($tahunLulus) ? (int) $tahunLulus : null;
                if (!$tahunInt || $tahunInt < 1900 || $tahunInt > 2100) {
                    continue;
                }

                $jurusan = ($prodi && $prodi !== '-') ? $prodi : null;

                $exists = DB::table('riwayat_pendidikan')
                    ->where('pegawai_id', $pegawai->id)
                    ->where('jenjang', $jenjang)
                    ->where('institusi', $institusi)
                    ->where('tahun_lulus', $tahunInt)
                    ->exists();

                if ($exists) {
                    continue;
                }

                DB::table('riwayat_pendidikan')->insert([
                    'id' => Str::uuid(),
                    'pegawai_id' => $pegawai->id,
                    'jenjang' => $jenjang,
                    'institusi' => $institusi,
                    'jurusan' => $jurusan,
                    'tahun_lulus' => $tahunInt,
                    'nomor_ijazah' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $created++;
            } catch (\Exception $e) {
            }
        }

        return $created;
    }

    /**
     * Sync riwayat diklat from eMaster diklat detail page.
     */
    private function syncDiklat(Pegawai $pegawai, string $hash, string $skpdHash): int
    {
        $html = $this->fetchModulePage('diklat', $hash, $skpdHash);
        $parsed = $this->parseDetailTable($html);
        $rows = $parsed['rows'];
        $headers = $parsed['headers'];

        $namaIdx = $this->findColumnIndex($headers, ['nama diklat']) ?? 3;
        $sertifikatIdx = $this->findColumnIndex($headers, ['no sertifikat', 'sertifikat']) ?? 4;
        $tglSertIdx = $this->findColumnIndex($headers, ['tgl sertifikat', 'tanggal sertifikat']) ?? 5;
        $jpIdx = $this->findColumnIndex($headers, ['jumlah jam', 'jam', 'jp']) ?? 7;

        $created = 0;

        foreach ($rows as $row) {
            try {
                $namaDiklat = trim($row[$namaIdx] ?? '');
                if (empty($namaDiklat) || $namaDiklat === '-') {
                    continue;
                }

                $nomorSertifikat = trim($row[$sertifikatIdx] ?? '');
                $nomorSertifikat = ($nomorSertifikat && $nomorSertifikat !== '-') ? $nomorSertifikat : null;

                $tglSertifikat = $this->parseIndonesianDate($row[$tglSertIdx] ?? '');
                $tahun = null;
                if ($tglSertifikat) {
                    $tahun = (int) substr($tglSertifikat, 0, 4);
                }

                $jpRaw = trim($row[$jpIdx] ?? '');
                $jamPelajaran = is_numeric($jpRaw) ? (int) $jpRaw : null;

                $query = DB::table('riwayat_diklat')
                    ->where('pegawai_id', $pegawai->id)
                    ->where('nama_diklat', $namaDiklat);

                if ($nomorSertifikat) {
                    $query->where('nomor_sertifikat', $nomorSertifikat);
                } else {
                    $query->whereNull('nomor_sertifikat');
                }

                if ($tahun) {
                    $query->where('tahun', $tahun);
                }

                $exists = $query->exists();
                if ($exists) {
                    continue;
                }

                DB::table('riwayat_diklat')->insert([
                    'id' => Str::uuid(),
                    'pegawai_id' => $pegawai->id,
                    'nama_diklat' => $namaDiklat,
                    'penyelenggara' => null,
                    'tahun' => $tahun,
                    'jam_pelajaran' => $jamPelajaran,
                    'nomor_sertifikat' => $nomorSertifikat,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $created++;
            } catch (\Exception $e) {
            }
        }

        return $created;
    }

    /**
     * Fetch a module page for a specific pegawai.
     */
    private function fetchModulePage(string $module, string $hash, string $skpdHash): string
    {
        $response = $this->client->get('/media.php', [
            'query' => [
                'module' => $module,
                'id_skpd' => $skpdHash,
                'id' => $hash,
            ],
            'headers' => [
                'Referer' => $this->baseUrl . '/media.php?module=dashboard',
            ],
        ]);

        if ($response->getStatusCode() !== 200) {
            throw new \RuntimeException("Failed to fetch {$module}: HTTP {$response->getStatusCode()}");
        }

        return (string) $response->getBody();
    }

    /**
     * Parse detail page HTML: Table 0 = instructions, Table 1 = data.
     * Returns ['headers' => [...], 'rows' => [[...], ...]].
     */
    private function parseDetailTable(string $html): array
    {
        $previous = libxml_use_internal_errors(true);
        $dom = new \DOMDocument();
        $dom->loadHTML('<?xml encoding="UTF-8">' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        $tables = $dom->getElementsByTagName('table');
        if ($tables->length < 2) {
            $table = $tables->item(0);
        } else {
            $table = $tables->item(1);
        }

        if (!$table) {
            return ['headers' => [], 'rows' => []];
        }

        $xpath = new \DOMXPath($dom);

        $headers = [];
        $thNodes = $xpath->query('.//th', $table);
        foreach ($thNodes as $th) {
            $headers[] = trim(html_entity_decode($th->nodeValue, ENT_QUOTES, 'UTF-8'));
        }

        $rows = [];
        $trNodes = $xpath->query('.//tr', $table);
        foreach ($trNodes as $tr) {
            $thInRow = $xpath->query('./th', $tr);
            if ($thInRow->length > 0) {
                continue;
            }

            $tdNodes = $xpath->query('./td', $tr);
            if ($tdNodes->length < 3) {
                continue;
            }

            $cells = [];
            foreach ($tdNodes as $td) {
                $cells[] = trim(html_entity_decode($td->nodeValue, ENT_QUOTES, 'UTF-8'));
            }

            $hasData = false;
            foreach ($cells as $c) {
                if (!empty($c) && $c !== '-') {
                    $hasData = true;
                    break;
                }
            }
            if (!$hasData) {
                continue;
            }

            $rows[] = $cells;
        }

        return ['headers' => $headers, 'rows' => $rows];
    }

    /**
     * Find column index by searching for keywords in header text.
     */
    private function findColumnIndex(array $headers, array $keywords): ?int
    {
        foreach ($headers as $idx => $header) {
            $headerLower = strtolower(trim($header));
            foreach ($keywords as $keyword) {
                if (str_contains($headerLower, strtolower($keyword))) {
                    return $idx;
                }
            }
        }
        return null;
    }

    /**
     * Parse Indonesian date format: "01 Oktober 2023" -> "2023-10-01".
     */
    private function parseIndonesianDate(string $date): ?string
    {
        $date = trim($date);
        if (empty($date) || $date === '-' || $date === '--') {
            return null;
        }

        $months = [
            'januari' => '01', 'februari' => '02', 'maret' => '03', 'april' => '04',
            'mei' => '05', 'juni' => '06', 'juli' => '07', 'agustus' => '08',
            'september' => '09', 'oktober' => '10', 'november' => '11', 'desember' => '12',
            'jan' => '01', 'feb' => '02', 'mar' => '03', 'apr' => '04',
            'jun' => '06', 'jul' => '07', 'agu' => '08', 'ags' => '08',
            'sep' => '09', 'okt' => '10', 'nov' => '11', 'des' => '12',
        ];

        $monthPattern = implode('|', array_keys($months));
        if (preg_match('/(\d{1,2})\s+(' . $monthPattern . ')\s+(\d{4})/i', $date, $m)) {
            $day = str_pad($m[1], 2, '0', STR_PAD_LEFT);
            $monthKey = strtolower($m[2]);
            $month = $months[$monthKey] ?? null;
            if ($month) {
                return $m[3] . '-' . $month . '-' . $day;
            }
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
     * Match eMaster jabatan name to SIMPEG Jabatan ID.
     */
    private function matchJabatan(string $namaJabatan): ?string
    {
        $namaJabatan = trim($namaJabatan);
        if (empty($namaJabatan) || $namaJabatan === '-') {
            return null;
        }

        $jabatan = Jabatan::where('nama', $namaJabatan)->first();
        if ($jabatan) {
            return $jabatan->id;
        }

        $jabatan = Jabatan::where('nama', 'like', "%{$namaJabatan}%")->first();
        if ($jabatan) {
            return $jabatan->id;
        }

        $lower = strtolower($namaJabatan);

        if (str_contains($lower, 'kepala sekolah')) {
            return Jabatan::where('kode', 'KS')->first()?->id;
        }
        if (str_contains($lower, 'wakil') && str_contains($lower, 'kurikulum')) {
            return Jabatan::where('kode', 'WKS1')->first()?->id;
        }
        if (str_contains($lower, 'wakil') && str_contains($lower, 'kesiswaan')) {
            return Jabatan::where('kode', 'WKS2')->first()?->id;
        }
        if (str_contains($lower, 'wakil') && (str_contains($lower, 'sarana') || str_contains($lower, 'prasana'))) {
            return Jabatan::where('kode', 'WKS3')->first()?->id;
        }
        if (str_contains($lower, 'wakil') && str_contains($lower, 'humas')) {
            return Jabatan::where('kode', 'WKS4')->first()?->id;
        }
        if (str_contains($lower, 'bimbingan') || str_contains($lower, 'bk ')) {
            return Jabatan::where('kode', 'GBK')->first()?->id;
        }
        if (str_contains($lower, 'guru')) {
            return Jabatan::where('kode', 'GMP')->first()?->id;
        }
        if (str_contains($lower, 'tenaga administrasi') || str_contains($lower, 'pengadministrasi') ||
            str_contains($lower, 'operator') || str_contains($lower, 'penata layanan') ||
            str_contains($lower, 'pelaksana')) {
            return Jabatan::where('kode', 'STU')->first()?->id;
        }

        return null;
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
            if ($pos === false) {
                continue;
            }
            $bits .= str_pad(decbin($pos), 5, '0', STR_PAD_LEFT);
        }
        $bytes = '';
        for ($i = 0; $i + 8 <= strlen($bits); $i += 8) {
            $bytes .= chr(bindec(substr($bits, $i, 8)));
        }
        return $bytes;
    }
}
