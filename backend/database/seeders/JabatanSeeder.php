<?php

namespace Database\Seeders;

use App\Models\Jabatan;
use Illuminate\Database\Seeder;

class JabatanSeeder extends Seeder
{
    /**
     * Seed jabatan (positions) for SMAN 1 Prambon.
     */
    public function run(): void
    {
        $jabatanList = [
            ['kode' => 'KS',   'nama' => 'Kepala Sekolah'],
            ['kode' => 'WKS1', 'nama' => 'Wakil Kepala Sekolah Bidang Kurikulum'],
            ['kode' => 'WKS2', 'nama' => 'Wakil Kepala Sekolah Bidang Kesiswaan'],
            ['kode' => 'WKS3', 'nama' => 'Wakil Kepala Sekolah Bidang Sarana Prasarana'],
            ['kode' => 'WKS4', 'nama' => 'Wakil Kepala Sekolah Bidang Humas'],
            ['kode' => 'GMP',  'nama' => 'Guru Mata Pelajaran'],
            ['kode' => 'GBK',  'nama' => 'Guru Bimbingan Konseling'],
            ['kode' => 'WALI', 'nama' => 'Wali Kelas'],
            ['kode' => 'KTU',  'nama' => 'Kepala Tata Usaha'],
            ['kode' => 'STU',  'nama' => 'Staf Tata Usaha'],
            ['kode' => 'BEN',  'nama' => 'Bendahara'],
            ['kode' => 'PRP',  'nama' => 'Petugas Perpustakaan'],
            ['kode' => 'LAB',  'nama' => 'Laboran'],
            ['kode' => 'SAT',  'nama' => 'Satpam'],
            ['kode' => 'PBR',  'nama' => 'Petugas Kebersihan'],
        ];

        foreach ($jabatanList as $jabatan) {
            Jabatan::firstOrCreate(
                ['kode' => $jabatan['kode']],
                ['nama' => $jabatan['nama']]
            );
        }
    }
}
