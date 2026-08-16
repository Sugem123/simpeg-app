<?php

namespace App\Enums;

/**
 * Enum representing letter/document types.
 */
enum JenisSurat: string
{
    case SK = 'sk';
    case SURAT_TUGAS = 'surat_tugas';
    case PAKTA_INTEGRITAS = 'pakta_integritas';
    case SURAT_KETERANGAN = 'surat_keterangan';

    /**
     * Get the human-readable label for the letter type.
     */
    public function label(): string
    {
        return match ($this) {
            self::SK => 'Surat Keputusan',
            self::SURAT_TUGAS => 'Surat Tugas',
            self::PAKTA_INTEGRITAS => 'Pakta Integritas',
            self::SURAT_KETERANGAN => 'Surat Keterangan',
        };
    }
}
