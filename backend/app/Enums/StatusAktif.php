<?php

namespace App\Enums;

/**
 * Enum representing employee active status.
 */
enum StatusAktif: string
{
    case AKTIF = 'aktif';
    case CUTI = 'cuti';
    case TUGAS_BELAJAR = 'tugas_belajar';
    case MUTASI = 'mutasi';
    case PENSIUN = 'pensiun';
    case BERHENTI = 'berhenti';

    /**
     * Get the human-readable label for the active status.
     */
    public function label(): string
    {
        return match ($this) {
            self::AKTIF => 'Aktif',
            self::CUTI => 'Cuti',
            self::TUGAS_BELAJAR => 'Tugas Belajar',
            self::MUTASI => 'Mutasi',
            self::PENSIUN => 'Pensiun',
            self::BERHENTI => 'Berhenti',
        };
    }
}
