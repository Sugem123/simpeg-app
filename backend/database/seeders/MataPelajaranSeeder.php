<?php

namespace Database\Seeders;

use App\Models\MataPelajaran;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MataPelajaranSeeder extends Seeder
{
    
    /**
     * Seed the mata_pelajaran (school subject) table.
     */
    public function run(): void
    {
        $mapelList = [
            ['kode' => 'MTK',  'nama' => 'Matematika'],
            ['kode' => 'BIN',  'nama' => 'Bahasa Indonesia'],
            ['kode' => 'BIG',  'nama' => 'Bahasa Inggris'],
            ['kode' => 'FIS',  'nama' => 'Fisika'],
            ['kode' => 'KIM',  'nama' => 'Kimia'],
            ['kode' => 'BIO',  'nama' => 'Biologi'],
            ['kode' => 'EKO',  'nama' => 'Ekonomi'],
            ['kode' => 'GEO',  'nama' => 'Geografi'],
            ['kode' => 'SOS',  'nama' => 'Sosiologi'],
            ['kode' => 'SEJ',  'nama' => 'Sejarah'],
            ['kode' => 'PKN',  'nama' => 'PPKn'],
            ['kode' => 'PAI',  'nama' => 'Pendidikan Agama'],
            ['kode' => 'SBD',  'nama' => 'Seni Budaya'],
            ['kode' => 'PJK',  'nama' => 'PJOK'],
            ['kode' => 'PKY',  'nama' => 'Prakarya'],
            ['kode' => 'INF',  'nama' => 'Informatika'],
            ['kode' => 'BJW',  'nama' => 'Bahasa Jawa'],
        ];

        foreach ($mapelList as $mapel) {
            MataPelajaran::firstOrCreate(
                ['kode' => $mapel['kode']],
                ['nama' => $mapel['nama']],
            );
        }
    }
}
