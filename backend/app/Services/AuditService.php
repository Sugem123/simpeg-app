<?php

namespace App\Services;

use App\Models\AuditLog;

/**
 * Centralised audit-logging service.
 */
class AuditService
{
    /**
     * Write an audit-log entry.
     *
     * @param  array<string, mixed>|null  $metadata
     */
    public function log(
        ?string $userId,
        string $aksi,
        string $modul,
        ?string $deskripsi = null,
        ?array $metadata = null,
    ): AuditLog {
        return AuditLog::create([
            'user_id'    => $userId,
            'aksi'       => $aksi,
            'modul'      => $modul,
            'deskripsi'  => $deskripsi,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'metadata'   => $metadata,
            'created_at' => now(),
        ]);
    }

    /**
     * Static convenience helper.
     *
     * @param  array<string, mixed>|null  $metadata
     */
    public static function record(
        ?string $userId,
        string $aksi,
        string $modul,
        ?string $deskripsi = null,
        ?array $metadata = null,
    ): AuditLog {
        return (new self())->log($userId, $aksi, $modul, $deskripsi, $metadata);
    }
}
