<?php

namespace Database\Seeders;

use App\Models\Pendidikan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PendidikanSeeder extends Seeder
{
    
    /**
     * Seed the pendidikan (education level) table.
     */
    public function run(): void
    {
        $jenjangList = [
            'SD',
            'SMP',
            'SMA/SMK',
            'D1',
            'D2',
            'D3',
            'D4/S1',
            'S2',
            'S3',
        ];

        foreach ($jenjangList as $jenjang) {
            Pendidikan::firstOrCreate(['jenjang' => $jenjang]);
        }
    }
}
