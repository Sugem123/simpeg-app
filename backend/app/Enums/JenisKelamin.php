<?php

namespace App\Enums;

/**
 * Enum representing gender types.
 */
enum JenisKelamin: string
{
    case L = 'L';
    case P = 'P';

    /**
     * Get the human-readable label for the gender.
     */
    public function label(): string
    {
        return match ($this) {
            self::L => 'Laki-laki',
            self::P => 'Perempuan',
        };
    }
}
