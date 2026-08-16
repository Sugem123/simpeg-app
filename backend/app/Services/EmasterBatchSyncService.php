<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Cookie\CookieJar;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Pegawai;

class EmasterBatchSyncService
{
    private string $baseUrl = 'https://master.bkd.jatimprov.go.id';
    private string $refererBase = 'https://master.bkd.jatimprov.go.id/fasilitator/media.php?module=download';
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
            'timeout' => 120,
            'cookies' => $this->cookieJar,
            'allow_redirects' => false,
            'verify' => true,
        ]);
    }

    /**
     * Full batch sync: login, fetch all endpoints, parse, update pegawai + diklat.
     */
    public function syncBatch(): array
    {
        $stats = [
            'total_updated' => 0,
            'diklat_created' => 0,
            'endpoints_fetched' => 0,
            'errors' => [],
        ];

        // Step 1: Login
        try {
            $this->login();
        } catch (\Exception $e) {
            $stats['errors'][] = 'Login failed: ' . $e->getMessage();
            return $stats;
        }

        // Step 2: Fetch all endpoints and collect data indexed by NIP
        $batchData = [];

        // 2a. excel_nama.php — NO HP, EMAIL, NPWP, NO BPJS, NO KK, NIK
        $rows = $this->fetchAndParse('/cetak_download/excel_nama.php');
        $stats['endpoints_fetched']++;
        foreach ($rows as $row) {
            $nip = $this->cleanNip($row['NIP BARU'] ?? '');
            if (!$nip) continue;
            $batchData[$nip]['no_hp'] = trim($row['NO HP'] ?? '') ?: null;
            $batchData[$nip]['npwp'] = trim($row['NPWP'] ?? '') ?: null;
            $batchData[$nip]['no_bpjs'] = trim($row['NO BPJS'] ?? '') ?: null;
            $batchData[$nip]['no_kk'] = trim($row['NO KK'] ?? '') ?: null;
        }

        // 2b. excel_agama_kawin.php — NAMA SUAMI/ISTRI, NIP PASANGAN, JUMLAH PASANGAN, NAMA ANAK, JUMLAH ANAK
        $rows = $this->fetchAndParse('/cetak_download/excel_agama_kawin.php');
        $stats['endpoints_fetched']++;
        foreach ($rows as $row) {
            $nip = $this->cleanNip($row['NIP BARU'] ?? '');
            if (!$nip) continue;
            $batchData[$nip]['nama_pasangan'] = trim($row['NAMA SUAMI/ISTRI'] ?? '') ?: null;
            $batchData[$nip]['nip_pasangan'] = $this->cleanNip($row['NIP PASANGAN'] ?? '') ?: null;
            $batchData[$nip]['jumlah_pasangan'] = is_numeric(trim($row['JUMLAH PASANGAN'] ?? '')) ? (int) trim($row['JUMLAH PASANGAN']) : null;
            $batchData[$nip]['nama_anak'] = trim($row['NAMA ANAK'] ?? '') ?: null;
            $batchData[$nip]['jumlah_anak'] = is_numeric(trim($row['JUMLAH ANAK'] ?? '')) ? (int) trim($row['JUMLAH ANAK']) : null;
        }

        // 2c. excel_alamat.php — ALAMAT DOMISILI, KAB/KOTA DOMISILI, PROVINSI DOMISILI
        $rows = $this->fetchAndParse('/cetak_download/excel_alamat.php');
        $stats['endpoints_fetched']++;
        foreach ($rows as $row) {
            $nip = $this->cleanNip($row['NIP BARU'] ?? '');
            if (!$nip) continue;
            $batchData[$nip]['alamat_domisili'] = trim($row['ALAMAT DOMISILI'] ?? '') ?: null;
            $batchData[$nip]['kab_kota_domisili'] = trim($row['KAB/KOTA DOMISILI'] ?? '') ?: null;
            $batchData[$nip]['provinsi_domisili'] = trim($row['PROVINSI DOMISILI'] ?? '') ?: null;
        }

        // 2d. excel_cpns.php — TMT CPNS, NO SK CPNS, TGL SK CPNS
        $rows = $this->fetchAndParse('/cetak_download/excel_cpns.php');
        $stats['endpoints_fetched']++;
        foreach ($rows as $row) {
            $nip = $this->cleanNip($row['NIP BARU'] ?? '');
            if (!$nip) continue;
            $batchData[$nip]['tmt_cpns'] = $this->parseDate($row['TMT CPNS'] ?? '');
            $batchData[$nip]['no_sk_cpns'] = trim($row['NO SK CPNS'] ?? '') ?: null;
            $batchData[$nip]['tgl_sk_cpns'] = $this->parseDate($row['TGL SK CPNS'] ?? '');
        }

        // 2e. excel_pns.php — TMT PNS, NO SK PNS, TGL SK PNS
        $rows = $this->fetchAndParse('/cetak_download/excel_pns.php');
        $stats['endpoints_fetched']++;
        foreach ($rows as $row) {
            $nip = $this->cleanNip($row['NIP BARU'] ?? '');
            if (!$nip) continue;
            $batchData[$nip]['tmt_pns'] = $this->parseDate($row['TMT PNS'] ?? '');
            $batchData[$nip]['no_sk_pns'] = trim($row['NO SK PNS'] ?? '') ?: null;
            $batchData[$nip]['tgl_sk_pns'] = $this->parseDate($row['TGL SK PNS'] ?? '');
        }

        // 2f. excel_pangkat.php — NO SK PANGKAT, TGL SK PANGKAT
        $rows = $this->fetchAndParse('/cetak_download/excel_pangkat.php');
        $stats['endpoints_fetched']++;
        foreach ($rows as $row) {
            $nip = $this->cleanNip($row['NIP BARU'] ?? '');
            if (!$nip) continue;
            $batchData[$nip]['no_sk_pangkat'] = trim($row['NO SK PANGKAT'] ?? '') ?: null;
            $batchData[$nip]['tgl_sk_pangkat'] = $this->parseDate($row['TGL SK PANGKAT'] ?? '');
        }

        // 2g. excel_jabatan.php — KELAS JABATAN, RUMPUN, STATUS DIANGKAT, STATUS DIKLAT FUNGSIONAL, STATUS SERTIFIKAT PENDIDIK
        $rows = $this->fetchAndParse('/cetak_download/excel_jabatan.php');
        $stats['endpoints_fetched']++;
        foreach ($rows as $row) {
            $nip = $this->cleanNip($row['NIP BARU'] ?? '');
            if (!$nip) continue;
            $batchData[$nip]['kelas_jabatan'] = trim($row['KELAS JABATAN'] ?? '') ?: null;
            $batchData[$nip]['rumpun'] = trim($row['RUMPUN'] ?? '') ?: null;
            $batchData[$nip]['status_diangkat'] = trim($row['STATUS DIANGKAT'] ?? '') ?: null;
            $batchData[$nip]['status_diklat_fungsional'] = trim($row['STATUS DIKLAT FUNGSIONAL'] ?? '') ?: null;
            $batchData[$nip]['status_sertifikat_pendidik'] = trim($row['STATUS SERTIFIKAT PENDIDIK'] ?? '') ?: null;
        }

        // 2h. excel_pendidikan.php — JENJANG, NAMA SEKOLAH, PROGRAM STUDI, TAHUN LULUS
        $rows = $this->fetchAndParse('/cetak_download/excel_pendidikan.php');
        $stats['endpoints_fetched']++;
        foreach ($rows as $row) {
            $nip = $this->cleanNip($row['NIP BARU'] ?? '');
            if (!$nip) continue;
            $batchData[$nip]['pendidikan_jenjang'] = trim($row['JENJANG'] ?? '') ?: null;
            $batchData[$nip]['pendidikan_institusi'] = trim($row['NAMA SEKOLAH'] ?? '') ?: null;
            $batchData[$nip]['pendidikan_prodi'] = trim($row['PROGRAM STUDI'] ?? '') ?: null;
            $batchData[$nip]['pendidikan_thn_lulus'] = trim($row['TAHUN LULUS'] ?? '') ?: null;
        }

        // 2i. excel_bup.php — BUP
        $rows = $this->fetchAndParse('/cetak_download/excel_bup.php');
        $stats['endpoints_fetched']++;
        foreach ($rows as $row) {
            $nip = $this->cleanNip($row['NIP BARU'] ?? '');
            if (!$nip) continue;
            $batchData[$nip]['bup'] = $this->parseDate($row['BUP'] ?? '');
        }

        // 2j. excel_nama_lahir.php — NAMA LAHIR
        $rows = $this->fetchAndParse('/cetak_download/excel_nama_lahir.php');
        $stats['endpoints_fetched']++;
        foreach ($rows as $row) {
            $nip = $this->cleanNip($row['NIP BARU'] ?? '');
            if (!$nip) continue;
            $batchData[$nip]['nama_lahir'] = trim($row['NAMA LAHIR'] ?? '') ?: null;
        }

        // 2k. cetak_progress/laporan/excel_asn_gajiberkala.php — TMT GAJI BERKALA, GAJI BERKALA
        $rows = $this->fetchAndParse('/cetak_progress/laporan/excel_asn_gajiberkala.php');
        $stats['endpoints_fetched']++;
        foreach ($rows as $row) {
            $nip = $this->cleanNip($row['NIP BARU'] ?? $row['NIP'] ?? '');
            if (!$nip) continue;
            $batchData[$nip]['tmt_gaji_berkala'] = $this->parseDate($row['TMT GAJI BERKALA'] ?? '');
            $batchData[$nip]['gaji_berkala'] = trim($row['GAJI BERKALA'] ?? '') ?: null;
        }

        // 2l. cetak_progress/laporan/excel_asn_pernikahan.php — TGL NIKAH
        $rows = $this->fetchAndParse('/cetak_progress/laporan/excel_asn_pernikahan.php');
        $stats['endpoints_fetched']++;
        foreach ($rows as $row) {
            $nip = $this->cleanNip($row['NIP BARU'] ?? $row['NIP'] ?? '');
            if (!$nip) continue;
            $batchData[$nip]['tgl_nikah'] = $this->parseDate($row['TGL NIKAH'] ?? '');
        }

        // 2m. cetak_progress/laporan/excel_asn_spt.php — SPT e-Filling
        $rows = $this->fetchAndParse('/cetak_progress/laporan/excel_asn_spt.php');
        $stats['endpoints_fetched']++;
        foreach ($rows as $row) {
            $nip = $this->cleanNip($row['NIP BARU'] ?? $row['NIP'] ?? '');
            if (!$nip) continue;
            $batchData[$nip]['spt_efilling'] = trim($row['SPT e-FILLING'] ?? $row['SPT E-FILLING'] ?? $row['SPT e-Filling'] ?? '') ?: null;
        }

        // 2n. cetak_progress/laporan/excel_asn_sumpah_pns.php — SUMPAH PNS
        $rows = $this->fetchAndParse('/cetak_progress/laporan/excel_asn_sumpah_pns.php');
        $stats['endpoints_fetched']++;
        foreach ($rows as $row) {
            $nip = $this->cleanNip($row['NIP BARU'] ?? $row['NIP'] ?? '');
            if (!$nip) continue;
            $batchData[$nip]['sumpah_pns_status'] = trim($row['SUMPAH PNS'] ?? '') ?: null;
        }

        // 2o. cetak_progress/laporan/excel_asn_talent_dna.php — TALENT DNA
        $rows = $this->fetchAndParse('/cetak_progress/laporan/excel_asn_talent_dna.php');
        $stats['endpoints_fetched']++;
        foreach ($rows as $row) {
            $nip = $this->cleanNip($row['NIP BARU'] ?? $row['NIP'] ?? '');
            if (!$nip) continue;
            $batchData[$nip]['talent_dna'] = trim($row['TALENT DNA'] ?? $row['TALENT_DNA'] ?? '') ?: null;
        }

        // 2p. excel_diklat.php — multi-row per pegawai
        $diklatRecords = [];
        $rows = $this->fetchAndParse('/cetak_download/excel_diklat.php');
        $stats['endpoints_fetched']++;
        foreach ($rows as $row) {
            $nip = $this->cleanNip($row['NIP BARU'] ?? '');
            if (!$nip) continue;
            $namaDiklat = trim($row['NAMA DIKLAT'] ?? '') ?: null;
            if (!$namaDiklat) continue;

            $tglSertifikat = $this->parseDate($row['TGL SERTIFIKAT'] ?? '');
            $tahun = null;
            if ($tglSertifikat) {
                $tahun = (int) substr($tglSertifikat, 0, 4);
            }

            $diklatRecords[] = [
                'nip' => $nip,
                'nama_diklat' => $namaDiklat,
                'penyelenggara' => trim($row['PENYELENGGARA'] ?? '') ?: null,
                'tahun' => $tahun,
                'jam_pelajaran' => is_numeric(trim($row['JML JP'] ?? '')) ? (int) trim($row['JML JP']) : null,
                'nomor_sertifikat' => trim($row['NO SERTIFIKAT'] ?? '') ?: null,
            ];
        }

        // Step 3: Update pegawai records
        $updated = 0;
        foreach ($batchData as $nip => $data) {
            try {
                $pegawai = Pegawai::where('nip', $nip)->first();
                if (!$pegawai) {
                    continue;
                }

                $hasUpdate = false;
                foreach ($data as $key => $value) {
                    if ($value !== null) {
                        $pegawai->{$key} = $value;
                        $hasUpdate = true;
                    }
                }

                if ($hasUpdate) {
                    $pegawai->emaster_synced_at = now();
                    $pegawai->save();
                    $updated++;
                }
            } catch (\Exception $e) {
                $stats['errors'][] = "Update NIP {$nip}: " . $e->getMessage();
            }
        }
        $stats['total_updated'] = $updated;

        // Step 4: Insert diklat records into riwayat_diklat
        $diklatInserted = 0;
        foreach ($diklatRecords as $dr) {
            try {
                $pegawai = Pegawai::where('nip', $dr['nip'])->first();
                if (!$pegawai) continue;

                $exists = DB::table('riwayat_diklat')
                    ->where('pegawai_id', $pegawai->id)
                    ->where('nama_diklat', $dr['nama_diklat'])
                    ->where(function ($q) use ($dr) {
                        if ($dr['nomor_sertifikat']) {
                            $q->where('nomor_sertifikat', $dr['nomor_sertifikat']);
                        } else {
                            $q->whereNull('nomor_sertifikat');
                        }
                    })
                    ->exists();

                if ($exists) continue;

                DB::table('riwayat_diklat')->insert([
                    'id' => Str::uuid(),
                    'pegawai_id' => $pegawai->id,
                    'nama_diklat' => $dr['nama_diklat'],
                    'penyelenggara' => $dr['penyelenggara'],
                    'tahun' => $dr['tahun'],
                    'jam_pelajaran' => $dr['jam_pelajaran'],
                    'nomor_sertifikat' => $dr['nomor_sertifikat'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $diklatInserted++;
            } catch (\Exception $e) {
                $stats['errors'][] = "Diklat NIP {$dr['nip']}: " . $e->getMessage();
            }
        }
        $stats['diklat_created'] = $diklatInserted;

        return $stats;
    }

    /**
     * Fetch an endpoint and parse its HTML table.
     */
    private function fetchAndParse(string $path): array
    {
        try {
            $response = $this->client->get($path, [
                'query' => ['id_skpd' => $this->skpdId],
                'headers' => [
                    'Referer' => $this->refererBase,
                ],
            ]);

            if ($response->getStatusCode() !== 200) {
                throw new \RuntimeException("HTTP {$response->getStatusCode()}");
            }

            $html = (string) $response->getBody();
            return $this->parseHtmlTable($html);
        } catch (\Exception $e) {
            throw new \RuntimeException("Fetch {$path}: " . $e->getMessage());
        }
    }

    /**
     * Strip spaces from NIP to get 18-digit string.
     */
    private function cleanNip(string $nip): ?string
    {
        $clean = preg_replace('/\s+/', '', trim($nip));
        if (empty($clean) || $clean === '-' || strlen($clean) < 8) {
            return null;
        }
        return $clean;
    }

    /**
     * Parse date from DD-MM-YYYY or YYYY-MM-DD to YYYY-MM-DD.
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
     * Parse HTML table from Excel export using DOMDocument.
     */
    private function parseHtmlTable(string $html): array
    {
        $previous = libxml_use_internal_errors(true);

        $dom = new \DOMDocument();
        $dom->loadHTML('<?xml encoding="UTF-8">' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);

        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        $tables = $dom->getElementsByTagName('table');
        if ($tables->length === 0) {
            return [];
        }

        $table = $tables->item(0);
        $xpath = new \DOMXPath($dom);

        // Extract headers
        $headers = [];
        $allTh = $xpath->query('.//th', $table);
        foreach ($allTh as $th) {
            $headerText = trim(html_entity_decode($th->nodeValue, ENT_QUOTES, 'UTF-8'));
            $headers[] = $headerText;
        }

        if (empty($headers)) {
            return [];
        }

        // Extract data rows
        $rows = [];
        $allTr = $xpath->query('.//tr', $table);

        foreach ($allTr as $tr) {
            $thInRow = $xpath->query('./th', $tr);
            if ($thInRow->length > 0) continue;

            $tdNodes = $xpath->query('./td', $tr);
            if ($tdNodes->length < 3) continue;

            $cells = [];
            foreach ($tdNodes as $td) {
                $cellValue = trim(html_entity_decode($td->nodeValue, ENT_QUOTES, 'UTF-8'));
                $cells[] = $cellValue;
            }

            // Handle malformed HTML: merge excess cells into NAMA column
            $headerCount = count($headers);
            $cellCount = count($cells);

            if ($cellCount > $headerCount) {
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

            if (!empty($row['NIP BARU']) || !empty($row['NIP'])) {
                $rows[] = $row;
            }
        }

        return $rows;
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
