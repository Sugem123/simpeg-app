<?php

namespace App\Enums;

/**
 * Enum representing document categories.
 *
 * Includes both user-uploadable categories and eMaster BKD document types.
 */
enum KategoriDokumen: string
{
    // ─── User-uploadable categories ───
    case KTP = 'ktp';
    case KK = 'kk';
    case IJAZAH = 'ijazah';
    case SK = 'sk';
    case SERTIFIKAT = 'sertifikat';
    case FOTO = 'foto';
    case NPWP = 'npwp';
    case TRANSKRIP = 'transkrip';
    case LAINNYA = 'lainnya';

    // ─── eMaster BKD document types ───
    case FILE_FOTO = 'file_foto';
    case FILE_FOTO_FULL = 'file_foto_full';
    case FILE_KTP = 'file_ktp';
    case FILE_NPWP = 'file_npwp';
    case FILE_AKTA_KELAHIRAN = 'file_akta_kelahiran';
    case FILE_ASKES_BPJS = 'file_askes_bpjs';
    case FILE_KARIS_KARSU = 'file_karis_karsu';
    case FILE_KARPEG = 'file_karpeg';
    case FILE_KARTU_ASN_VIRTUAL = 'file_kartu_asn_virtual';
    case FILE_KARTU_TASPEN = 'file_kartu_taspen';
    case FILE_KONVERSI_NIP = 'file_konversi_nip';
    case FILE_KPE = 'file_kpe';
    case FILE_KSK = 'file_ksk';
    case FILE_MEDICAL_CHECKUP_CPNS = 'file_medical_checkup_cpns';
    case FILE_MEDICAL_CHECKUP_PNS = 'file_medical_checkup_pns';
    case FILE_NOTA_PERSETUJUAN_BKN = 'file_nota_persetujuan_bkn';
    case FILE_SPMT_CPNS = 'file_spmt_cpns';
    case FILE_SUKET_BEBAS_NARKOBA_CPNS = 'file_suket_bebas_narkoba_cpns';
    case FILE_SUKET_BEBAS_NARKOBA_PNS = 'file_suket_bebas_narkoba_pns';
    case FILE_SUMPAH_PNS = 'file_sumpah_pns';
    case FILE_TASPEN = 'file_taspen';

    /**
     * Get the human-readable label for the document category.
     */
    public function label(): string
    {
        return match ($this) {
            // User-uploadable
            self::KTP => 'KTP',
            self::KK => 'Kartu Keluarga',
            self::IJAZAH => 'Ijazah',
            self::SK => 'Surat Keputusan',
            self::SERTIFIKAT => 'Sertifikat',
            self::FOTO => 'Foto',
            self::NPWP => 'NPWP',
            self::TRANSKRIP => 'Transkrip Nilai',
            self::LAINNYA => 'Lainnya',

            // eMaster BKD
            self::FILE_FOTO => 'Foto',
            self::FILE_FOTO_FULL => 'Foto Full Body',
            self::FILE_KTP => 'KTP',
            self::FILE_NPWP => 'NPWP',
            self::FILE_AKTA_KELAHIRAN => 'Akta Kelahiran',
            self::FILE_ASKES_BPJS => 'Askes/BPJS',
            self::FILE_KARIS_KARSU => 'Karis/Karsu',
            self::FILE_KARPEG => 'Karpeg',
            self::FILE_KARTU_ASN_VIRTUAL => 'Kartu ASN Virtual',
            self::FILE_KARTU_TASPEN => 'Kartu Taspen',
            self::FILE_KONVERSI_NIP => 'Konversi NIP',
            self::FILE_KPE => 'KPE',
            self::FILE_KSK => 'KSK',
            self::FILE_MEDICAL_CHECKUP_CPNS => 'Medical Check-up CPNS',
            self::FILE_MEDICAL_CHECKUP_PNS => 'Medical Check-up PNS',
            self::FILE_NOTA_PERSETUJUAN_BKN => 'Nota Persetujuan BKN',
            self::FILE_SPMT_CPNS => 'SPMT CPNS',
            self::FILE_SUKET_BEBAS_NARKOBA_CPNS => 'Suket Bebas Narkoba CPNS',
            self::FILE_SUKET_BEBAS_NARKOBA_PNS => 'Suket Bebas Narkoba PNS',
            self::FILE_SUMPAH_PNS => 'Sumpah PNS',
            self::FILE_TASPEN => 'Taspen',
        };
    }
}
