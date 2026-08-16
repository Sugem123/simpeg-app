<?php

namespace Database\Seeders;

use App\Models\UnitKerja;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UnitKerjaSeeder extends Seeder
{
    
    /**
     * Seed the unit_kerja (work unit) table.
     */
    public function run(): void
    {
        UnitKerja::firstOrCreate(
            ['kode' => 'UK001'],
            ['nama' => 'SMAN 1 Prambon'],
        );
    }
}
