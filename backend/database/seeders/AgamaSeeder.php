<?php

namespace Database\Seeders;

use App\Models\Agama;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AgamaSeeder extends Seeder
{
    
    /**
     * Seed the agama (religion) table.
     */
    public function run(): void
    {
        $agamaList = [
            'Islam',
            'Kristen',
            'Katolik',
            'Hindu',
            'Buddha',
            'Konghucu',
            'Kepercayaan Terhadap Tuhan YME',
        ];

        foreach ($agamaList as $nama) {
            Agama::firstOrCreate(['nama' => $nama]);
        }
    }
}
