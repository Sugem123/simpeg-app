<?php

namespace Database\Seeders;

use App\Models\StatusKepegawaian;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StatusKepegawaianSeeder extends Seeder
{
    
    /**
     * Seed the status_kepegawaian (employment status) table.
     */
    public function run(): void
    {
        $statusList = [
            'PNS',
            'PPPK',
            'PPPK Paruh Waktu',
            'GTT',
            'PTT',
        ];

        foreach ($statusList as $nama) {
            StatusKepegawaian::firstOrCreate(['nama' => $nama]);
        }
    }
}
