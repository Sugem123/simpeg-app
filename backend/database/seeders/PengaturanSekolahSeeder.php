<?php

namespace Database\Seeders;

use App\Models\PengaturanSekolah;
use Illuminate\Database\Seeder;

class PengaturanSekolahSeeder extends Seeder
{
    public function run(): void
    {
        PengaturanSekolah::firstOrCreate(
            ['nama' => 'SMAN 1 Prambon'],
            [
                'npsn'            => '20510078',
                'alamat'          => 'Jl. Raya Prambon, Kec. Prambon, Kab. Nganjuk, Jawa Timur',
                'telepon'         => '(0358) 771234',
                'email'           => 'info@sman1prambon.sch.id',
                'website'         => 'https://sman1prambon.sch.id',
                'kepala_sekolah'  => 'Drs. Bambang Supriyanto',
                'nip_kepala'      => '196812051993031008',
            ]
        );
    }
}
