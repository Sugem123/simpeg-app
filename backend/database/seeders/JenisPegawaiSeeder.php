<?php

namespace Database\Seeders;

use App\Models\JenisPegawai;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class JenisPegawaiSeeder extends Seeder
{
    
    /**
     * Seed the jenis_pegawai (employee type) table.
     */
    public function run(): void
    {
        $jenisList = [
            'Guru',
            'Staf',
        ];

        foreach ($jenisList as $nama) {
            JenisPegawai::firstOrCreate(['nama' => $nama]);
        }
    }
}
