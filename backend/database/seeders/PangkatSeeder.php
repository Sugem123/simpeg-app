<?php

namespace Database\Seeders;

use App\Models\Pangkat;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PangkatSeeder extends Seeder
{
    
    /**
     * Seed the pangkat (civil servant rank) table.
     */
    public function run(): void
    {
        $pangkatList = [
            ['kode' => 'I/a',  'nama' => 'Juru Muda'],
            ['kode' => 'I/b',  'nama' => 'Juru Muda Tingkat I'],
            ['kode' => 'I/c',  'nama' => 'Juru'],
            ['kode' => 'I/d',  'nama' => 'Juru Tingkat I'],
            ['kode' => 'II/a', 'nama' => 'Pengatur Muda'],
            ['kode' => 'II/b', 'nama' => 'Pengatur Muda Tingkat I'],
            ['kode' => 'II/c', 'nama' => 'Pengatur'],
            ['kode' => 'II/d', 'nama' => 'Pengatur Tingkat I'],
            ['kode' => 'III/a', 'nama' => 'Penata Muda'],
            ['kode' => 'III/b', 'nama' => 'Penata Muda Tingkat I'],
            ['kode' => 'III/c', 'nama' => 'Penata'],
            ['kode' => 'III/d', 'nama' => 'Penata Tingkat I'],
            ['kode' => 'IV/a', 'nama' => 'Pembina'],
            ['kode' => 'IV/b', 'nama' => 'Pembina Tingkat I'],
            ['kode' => 'IV/c', 'nama' => 'Pembina Utama Muda'],
            ['kode' => 'IV/d', 'nama' => 'Pembina Utama Madya'],
            ['kode' => 'IV/e', 'nama' => 'Pembina Utama'],
        ];

        foreach ($pangkatList as $pangkat) {
            Pangkat::firstOrCreate(
                ['kode' => $pangkat['kode']],
                ['nama' => $pangkat['nama']],
            );
        }
    }
}
