<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    
    /**
     * Seed the application's database.
     *
     * Seeders are called in dependency order — master data first,
     * then entities that reference them.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            PermissionSeeder::class,
            AgamaSeeder::class,
            JenisPegawaiSeeder::class,
            StatusKepegawaianSeeder::class,
            PangkatSeeder::class,
            GolonganSeeder::class,
            UnitKerjaSeeder::class,
            PendidikanSeeder::class,
            MataPelajaranSeeder::class,
            JabatanSeeder::class,
            UserSeeder::class,
            PegawaiSeeder::class,
            PengaturanSekolahSeeder::class,
        ]);
    }
}
