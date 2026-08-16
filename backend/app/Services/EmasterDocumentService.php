<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Cookie\CookieJar;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EmasterDocumentService
{
    private string $baseUrl = 'https://master.bkd.jatimprov.go.id';
    private string $username;
    private string $password;
    private string $totpSecret;
    private string $skpdId = '105401011';
    private string $skpdHash = '05804f4f6ea16da57b18b6a4c22bb18f';
    private Client $client;
    private CookieJar $cookieJar;

    private const ADMIN_USER_ID = '3460c957-890d-4054-bd89-a5445eaf3cbd';

    private const DOCUMENT_FIELDS = [
        'file_foto',
        'file_foto_full',
        'file_akta_kelahiran',
        'file_ktp',
        'file_ksk',
        'file_karpeg',
        'file_kpe',
        'file_askes_bpjs',
        'file_taspen',
        'file_karis_karsu',
        'file_npwp',
        'file_konversi_nip',
        'file_sumpah_pns',
        'file_nota_persetujuan_bkn',
        'file_spmt_cpns',
        'file_kartu_taspen',
        'file_medical_checkup_cpns',
        'file_suket_bebas_narkoba_cpns',
        'file_kartu_asn_virtual',
        'file_medical_checkup_pns',
        'file_suket_bebas_narkoba_pns',
    ];

    private array $stats = [
        'photos_downloaded' => 0,
        'documents_downloaded' => 0,
        'skipped' => 0,
        'errors' => [],
    ];

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
     * Main entry point: sync all documents from eMaster.
     */
    public function syncDocuments(): array
    {
        $startTime = microtime(true);

        $this->login();

        $this->syncPhotos();

        $this->syncAllDocuments();

        $this->stats['total_time_seconds'] = round(microtime(true) - $startTime, 2);

        return $this->stats;
    }

    /**
     * Sync only photos (batch approach via excel_foto.php).
     * Useful for testing with a small batch.
     */
    public function syncPhotosOnly(int $limit = 0): array
    {
        $startTime = microtime(true);

        $this->login();

        $this->syncPhotos($limit);

        $this->stats['total_time_seconds'] = round(microtime(true) - $startTime, 2);

        return $this->stats;
    }

    /**
     * Sync only per-pegawai documents (all 21 types).
     * Useful for testing with a small batch.
     */
    public function syncDocumentsOnly(int $limit = 0): array
    {
        $startTime = microtime(true);

        $this->login();

        $this->syncAllDocuments($limit);

        $this->stats['total_time_seconds'] = round(microtime(true) - $startTime, 2);

        return $this->stats;
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

        $mfaStatus = $mfaResponse->getStatusCode();
        $mfaBody = (string) $mfaResponse->getBody();

        if (str_contains($mfaBody, 'Login Gagal')) {
            throw new \RuntimeException("MFA login failed: invalid TOTP or credentials");
        }

        if ($mfaStatus !== 302 && $mfaStatus !== 200) {
            throw new \RuntimeException("MFA submission failed: HTTP {$mfaStatus}");
        }
    }

    /**
     * Batch download photos via excel_foto.php.
     * Returns HTML table: NO | NIP BARU | FOTO
     */
    private function syncPhotos(int $limit = 0): void
    {
        try {
            $response = $this->client->get('/cetak_download/excel_foto.php', [
                'query' => ['id_skpd' => $this->skpdId],
                'headers' => [
                    'Referer' => $this->baseUrl . '/media.php?module=home',
                ],
            ]);

            if ($response->getStatusCode() !== 200) {
                $this->stats['errors'][] = "Failed to fetch excel_foto: HTTP {$response->getStatusCode()}";
                return;
            }

            $html = (string) $response->getBody();
            $photos = $this->parsePhotoTable($html);

            $count = 0;
            foreach ($photos as $photo) {
                if ($limit > 0 && $count >= $limit) break;
                $count++;

                $nip = $photo['nip'];
                $url = $photo['url'];

                $pegawai = $this->findPegawaiByNip($nip);
                if (!$pegawai) {
                    $this->stats['errors'][] = "Photo: pegawai not found for NIP {$nip}";
                    continue;
                }

                if ($this->dokumenExists($pegawai->id, 'file_foto')) {
                    $this->stats['skipped']++;
                    continue;
                }

                try {
                    $this->downloadAndSave($url, $pegawai, 'file_foto');
                    $this->stats['photos_downloaded']++;
                } catch (\Exception $e) {
                    $this->stats['errors'][] = "Photo download failed for NIP {$nip}: " . $e->getMessage();
                }
            }
        } catch (\Exception $e) {
            $this->stats['errors'][] = "syncPhotos error: " . $e->getMessage();
        }
    }

    /**
     * Parse the excel_foto.php HTML table.
     * Expected columns: NO | NIP BARU | FOTO
     * HTML is malformed (unclosed <tr>), so use regex instead of DOMDocument.
     * FOTO column contains plain text URLs, not <img> or <a> tags.
     */
    private function parsePhotoTable(string $html): array
    {
        $photos = [];

        // Pattern: <td>NIP_WITH_SPACES</td><td>URL</td>
        // NIP format: "19850206 201408 1 001" (8+6+1+3 digits with spaces)
        // URL: https://master.bkd.jatimprov.go.id/files_jatimprov/...
        if (preg_match_all('/<td>\s*(\d{8}\s+\d{6}\s+\d\s+\d{3})\s*<\/td>\s*<td>\s*(https?:\/\/[^\s<]+)\s*<\/td>/i', $html, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $m) {
                $nip = preg_replace('/\s+/', '', $m[1]);
                $url = trim($m[2]);
                $photos[] = ['nip' => $nip, 'url' => $url];
            }
        }

        // Fallback: also try relative URLs (../files_jatimprov/...)
        if (empty($photos)) {
            if (preg_match_all('/<td>\s*(\d{8}\s+\d{6}\s+\d\s+\d{3})\s*<\/td>\s*<td>\s*(\.\.\/files_jatimprov\/[^\s<]+)\s*<\/td>/i', $html, $matches, PREG_SET_ORDER)) {
                foreach ($matches as $m) {
                    $nip = preg_replace('/\s+/', '', $m[1]);
                    $url = $this->resolveUrl(trim($m[2]));
                    $photos[] = ['nip' => $nip, 'url' => $url];
                }
            }
        }

        return $photos;
    }

    /**
     * Sync all 21 document types per-pegawai.
     * Constructs dokumen_pribadi URL directly from pegawai_hash (skips dashboard page).
     */
    private function syncAllDocuments(int $limit = 0): void
    {
        try {
            $pegawaiList = $this->fetchPegawaiList();
            $count = 0;

            foreach ($pegawaiList as $pegawaiInfo) {
                if ($limit > 0 && $count >= $limit) break;
                $count++;

                $nip = $pegawaiInfo['nip'];
                $pegawaiHash = $pegawaiInfo['hash'];

                $pegawai = $this->findPegawaiByNip($nip);
                if (!$pegawai) {
                    $this->stats['errors'][] = "Doc sync: pegawai not found for NIP {$nip}";
                    continue;
                }

                $dokumenUrl = "/media.php?module=dokumen_pribadi&id_skpd={$this->skpdHash}&id={$pegawaiHash}";

                try {
                    $this->syncPegawaiDocuments($dokumenUrl, $pegawai);
                } catch (\Exception $e) {
                    $this->stats['errors'][] = "Doc sync failed for NIP {$nip}: " . $e->getMessage();
                }
            }
        } catch (\Exception $e) {
            $this->stats['errors'][] = "syncAllDocuments error: " . $e->getMessage();
        }
    }

    /**
     * Fetch pegawai list from media.php?module=pegawai with pagination.
     * Returns array of ['nip' => string, 'hash' => string].
     * Page has NIPs in <font color=#0066FF> and dashboard links with id={hash}.
     */
    private function fetchPegawaiList(): array
    {
        $pegawaiList = [];
        $seenNips = [];
        $maxPages = 20;

        for ($page = 1; $page <= $maxPages; $page++) {
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

            // Extract NIPs from <font color=#0066FF>NIP</font>
            $nips = [];
            if (preg_match_all('/<font color=#0066FF>(\d{8}\s+\d{6}\s+\d\s+\d{3})<\/font>/i', $html, $m)) {
                $nips = $m[1];
            }

            // Extract pegawai hashes from module=dashboard links
            $hashes = [];
            if (preg_match_all('/module=dashboard&id_skpd=[^&]+&id=([a-f0-9]+)/i', $html, $m)) {
                $hashes = $m[1];
            }

            // Pair NIPs with hashes by index
            $count = min(count($nips), count($hashes));
            for ($i = 0; $i < $count; $i++) {
                $nip = preg_replace('/\s+/', '', $nips[$i]);
                $hash = $hashes[$i];

                if (isset($seenNips[$nip])) continue;
                $seenNips[$nip] = true;

                $pegawaiList[] = ['nip' => $nip, 'hash' => $hash];
            }

            // Check if there are more pages
            $nextPage = $page + 1;
            if (!str_contains($html, "halaman={$nextPage}")) {
                break;
            }
        }

        return $pegawaiList;
    }

    /**
     * Parse the dokumen_pribadi page and download all documents.
     */
    private function syncPegawaiDocuments(string $dokumenUrl, $pegawai): void
    {
        $response = $this->client->get($dokumenUrl, [
            'headers' => [
                'Referer' => $this->baseUrl . '/media.php?module=pegawai',
            ],
        ]);

        if ($response->getStatusCode() !== 200) {
            $this->stats['errors'][] = "Failed to fetch dokumen_pribadi for pegawai {$pegawai->nip}: HTTP {$response->getStatusCode()}";
            return;
        }

        $html = (string) $response->getBody();
        $documents = $this->parseDokumenPribadiPage($html);

        foreach ($documents as $doc) {
            $field = $doc['field'];
            $url = $doc['url'];

            // Map generic field names to specific ones if needed
            $field = $this->normalizeField($field, $html);

            if (!in_array($field, self::DOCUMENT_FIELDS)) continue;

            if ($this->dokumenExists($pegawai->id, $field)) {
                $this->stats['skipped']++;
                continue;
            }

            // Skip file_foto if already downloaded via batch photo sync
            if ($field === 'file_foto') {
                $this->stats['skipped']++;
                continue;
            }

            try {
                $this->downloadAndSave($url, $pegawai, $field);
                $this->stats['documents_downloaded']++;
            } catch (\Exception $e) {
                $this->stats['errors'][] = "Download failed for {$field} (NIP {$pegawai->nip}): " . $e->getMessage();
            }
        }
    }

    /**
     * Normalize generic field names (file_medical_checkup, file_suket_bebas_narkoba)
     * to specific ones (_cpns or _pns) based on which one appears in the edit links.
     */
    private function normalizeField(string $field, string $html): string
    {
        // These generic fields appear in URLs but the actual category may be _cpns or _pns
        $genericToSpecific = [
            'file_medical_checkup' => ['file_medical_checkup_cpns', 'file_medical_checkup_pns'],
            'file_suket_bebas_narkoba' => ['file_suket_bebas_narkoba_cpns', 'file_suket_bebas_narkoba_pns'],
        ];

        if (isset($genericToSpecific[$field])) {
            foreach ($genericToSpecific[$field] as $specific) {
                if (str_contains($html, "field={$specific}")) {
                    return $specific;
                }
            }
        }

        return $field;
    }

    /**
     * Parse the dokumen_pribadi page for document file URLs.
     * File URLs are inside window.open('../files_jatimprov/...') JavaScript calls.
     * Field names are extracted from the URL pattern: {id}-{field}-{date}-{rand}-{filename}.{ext}
     */
    private function parseDokumenPribadiPage(string $html): array
    {
        $documents = [];

        // Find all window.open('../files_jatimprov/...') URLs
        if (preg_match_all("/window\.open\('(\.\.\/files_jatimprov\/[^']+)'/i", $html, $m, PREG_SET_ORDER)) {
            foreach ($m as $match) {
                $url = $match[1];
                $field = $this->extractFieldFromUrl($url);

                if ($field) {
                    $documents[] = [
                        'field' => $field,
                        'url' => $this->resolveUrl($url),
                    ];
                }
            }
        }

        // Also check for direct <a href="../files_jatimprov/..."> patterns
        if (preg_match_all('/href=["\'](\.\.\/files_jatimprov\/[^"\']+)["\']/i', $html, $m, PREG_SET_ORDER)) {
            foreach ($m as $match) {
                $url = $match[1];
                $field = $this->extractFieldFromUrl($url);

                if ($field) {
                    $alreadyExists = false;
                    foreach ($documents as $doc) {
                        if ($doc['field'] === $field) {
                            $alreadyExists = true;
                            break;
                        }
                    }
                    if (!$alreadyExists) {
                        $documents[] = [
                            'field' => $field,
                            'url' => $this->resolveUrl($url),
                        ];
                    }
                }
            }
        }

        // Also check for <img src="../files_jatimprov/..."> patterns
        if (preg_match_all('/src=["\'](\.\.\/files_jatimprov\/[^"\']+)["\']/i', $html, $m, PREG_SET_ORDER)) {
            foreach ($m as $match) {
                $url = $match[1];
                $field = $this->extractFieldFromUrl($url);

                if ($field) {
                    $alreadyExists = false;
                    foreach ($documents as $doc) {
                        if ($doc['field'] === $field) {
                            $alreadyExists = true;
                            break;
                        }
                    }
                    if (!$alreadyExists) {
                        $documents[] = [
                            'field' => $field,
                            'url' => $this->resolveUrl($url),
                        ];
                    }
                }
            }
        }

        return $documents;
    }

    /**
     * Extract the field name from a files_jatimprov URL.
     * URL format: ../files_jatimprov/{id}-{field}-{date}-{rand}-{filename}.{ext}
     * Known field names are matched longest-first to avoid partial matches.
     */
    private function extractFieldFromUrl(string $url): ?string
    {
        // Sort fields by length descending to match longest first
        $fields = self::DOCUMENT_FIELDS;
        // Add generic variants that may appear in URLs
        $allFields = array_merge($fields, [
            'file_medical_checkup',
            'file_suket_bebas_narkoba',
        ]);

        usort($allFields, fn($a, $b) => strlen($b) - strlen($a));

        foreach ($allFields as $field) {
            $pattern = '/files_jatimprov\/\d+-' . preg_quote($field, '/') . '-\d{8}-/i';
            if (preg_match($pattern, $url)) {
                return $field;
            }
        }

        return null;
    }

    /**
     * Download a file from URL and save to storage + create dokumen record.
     */
    private function downloadAndSave(string $url, $pegawai, string $field): void
    {
        $response = $this->client->get($url, [
            'timeout' => 60,
            'headers' => [
                'Referer' => $this->baseUrl . '/media.php',
            ],
        ]);

        if ($response->getStatusCode() !== 200) {
            throw new \RuntimeException("HTTP {$response->getStatusCode()}");
        }

        $content = (string) $response->getBody();
        $size = strlen($content);

        if ($size < 100) {
            throw new \RuntimeException("File too small ({$size} bytes), likely error page");
        }

        $ext = $this->getExtensionFromUrl($url);
        $contentType = $response->getHeader('Content-Type')[0] ?? '';
        $mimeType = $this->determineMimeType($content, $ext, $contentType);

        $nip = preg_replace('/\s+/', '', $pegawai->nip ?? $pegawai->nik);
        $relativePath = "dokumen-emaster/{$nip}/{$field}.{$ext}";
        $absolutePath = "/var/www/html/storage/app/public/{$relativePath}";

        $dir = dirname($absolutePath);
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }

        file_put_contents($absolutePath, $content);

        $namaFile = $this->extractFilenameFromUrl($url);

        DB::table('dokumen')->insert([
            'id' => Str::uuid(),
            'pegawai_id' => $pegawai->id,
            'kategori' => $field,
            'nama_file' => $namaFile,
            'path' => $relativePath,
            'mime_type' => $mimeType,
            'ukuran' => $size,
            'uploaded_by' => self::ADMIN_USER_ID,
            'keterangan' => 'Migrated from eMaster BKD',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Check if a dokumen record already exists for this pegawai + kategori.
     */
    private function dokumenExists(string $pegawaiId, string $kategori): bool
    {
        return DB::table('dokumen')
            ->where('pegawai_id', $pegawaiId)
            ->where('kategori', $kategori)
            ->whereNull('deleted_at')
            ->exists();
    }

    /**
     * Find a pegawai in SIMPEG by NIP (strip spaces to 18 digits).
     */
    private function findPegawaiByNip(string $nip)
    {
        $nip = preg_replace('/\s+/', '', $nip);

        $pegawai = DB::table('pegawai')
            ->where('nip', $nip)
            ->first();

        if (!$pegawai) {
            $pegawai = DB::table('pegawai')
                ->whereRaw("REPLACE(nip, ' ', '') = ?", [$nip])
                ->first();
        }

        return $pegawai;
    }

    /**
     * Resolve relative URLs to absolute.
     */
    private function resolveUrl(string $url): string
    {
        if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
            return $url;
        }

        if (str_starts_with($url, '../')) {
            return $this->baseUrl . '/' . substr($url, 3);
        }

        if (str_starts_with($url, '/')) {
            return $this->baseUrl . $url;
        }

        return $this->baseUrl . '/' . $url;
    }

    /**
     * Extract file extension from URL.
     */
    private function getExtensionFromUrl(string $url): string
    {
        $path = parse_url($url, PHP_URL_PATH);
        $ext = pathinfo($path, PATHINFO_EXTENSION);
        if ($ext) {
            return strtolower($ext);
        }
        return 'jpg';
    }

    /**
     * Extract a clean filename from the URL.
     */
    private function extractFilenameFromUrl(string $url): string
    {
        $path = parse_url($url, PHP_URL_PATH);
        $filename = basename($path);
        if (empty($filename) || $filename === '/') {
            return 'document_' . time();
        }
        return $filename;
    }

    /**
     * Determine MIME type from file content, extension, and Content-Type header.
     */
    private function determineMimeType(string $content, string $ext, string $contentType): string
    {
        if (!empty($contentType) && !str_contains($contentType, 'text/html')) {
            $parts = explode(';', $contentType);
            return trim($parts[0]);
        }

        $extMimes = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'pdf' => 'application/pdf',
            'webp' => 'image/webp',
            'bmp' => 'image/bmp',
        ];

        $extLower = strtolower($ext);
        if (isset($extMimes[$extLower])) {
            return $extMimes[$extLower];
        }

        $magic = substr($content, 0, 8);
        if (str_starts_with($magic, "\xFF\xD8\xFF")) return 'image/jpeg';
        if (str_starts_with($magic, "\x89PNG\r\n\x1a\n")) return 'image/png';
        if (str_starts_with($magic, "GIF87a") || str_starts_with($magic, "GIF89a")) return 'image/gif';
        if (str_starts_with($magic, "%PDF")) return 'application/pdf';

        return 'application/octet-stream';
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
