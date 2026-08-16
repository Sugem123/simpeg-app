<?php

namespace App\Enums;

/**
 * Enum representing leave types.
 */
enum JenisCuti: string
{
    case TAHUNAN = 'tahunan';
    case SAKIT = 'sakit';
    case MELAHIRKAN = 'melahirkan';
    case BESAR = 'besar';
    case PENTING = 'penting';
    case LUAR_TANGGUNGAN = 'luar_tanggungan';

    /**
     * Get the human-readable label for the leave type.
     */
    public function label(): string
    {
        return match ($this) {
            self::TAHUNAN => 'Cuti Tahunan',
            self::SAKIT => 'Cuti Sakit',
            self::MELAHIRKAN => 'Cuti Melahirkan',
            self::BESAR => 'Cuti Besar',
            self::PENTING => 'Cuti karena Alasan Penting',
            self::LUAR_TANGGUNGAN => 'Cuti di Luar Tanggungan Negara',
        };
    }
}
