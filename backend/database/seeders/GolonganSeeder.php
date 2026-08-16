<?php

namespace Database\Seeders;

use App\Models\Golongan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GolonganSeeder extends Seeder
{
    
    /**
     * Seed the golongan (grade/class) table.
     */
    public function run(): void
    {
        $golonganList = [
            'I/a', 'I/b', 'I/c', 'I/d',
            'II/a', 'II/b', 'II/c', 'II/d',
            'III/a', 'III/b', 'III/c', 'III/d',
            'IV/a', 'IV/b', 'IV/c', 'IV/d', 'IV/e',
        ];

        foreach ($golonganList as $kode) {
            Golongan::firstOrCreate(
                ['kode' => $kode],
                ['nama' => $kode],
            );
        }
    }
}
