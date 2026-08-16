<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    
    /**
     * Seed the roles table.
     */
    public function run(): void
    {
        $roles = [
            [
                'nama'      => 'Super Admin',
                'deskripsi' => 'Akses penuh terhadap seluruh sistem',
            ],
            [
                'nama'      => 'Fasilitator',
                'deskripsi' => 'Mengelola data operasional kepegawaian',
            ],
            [
                'nama'      => 'Individu',
                'deskripsi' => 'Mengakses data milik sendiri',
            ],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(
                ['nama' => $role['nama']],
                ['deskripsi' => $role['deskripsi']],
            );
        }
    }
}
