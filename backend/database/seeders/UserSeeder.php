<?php

namespace Database\Seeders;

use App\Models\Agama;
use App\Models\JenisPegawai;
use App\Models\Pegawai;
use App\Models\Role;
use App\Models\StatusKepegawaian;
use App\Models\UnitKerja;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    
    /**
     * Seed the default Super Admin user with its pegawai record.
     */
    public function run(): void
    {
        // -----------------------------------------------------------------
        // 1. Resolve required foreign keys for the pegawai record
        // -----------------------------------------------------------------
        $agama              = Agama::where('nama', 'Islam')->first();
        $jenisPegawai       = JenisPegawai::where('nama', 'Staf')->first();
        $statusKepegawaian  = StatusKepegawaian::where('nama', 'PNS')->first();
        $unitKerja          = UnitKerja::where('kode', 'UK001')->first();

        // -----------------------------------------------------------------
        // 2. Create the pegawai record for the admin
        // -----------------------------------------------------------------
        $pegawai = Pegawai::firstOrCreate(
            ['nik' => '0000000000000001'],
            [
                'nip'                   => '000000000000000000',
                'nama'                  => 'Administrator',
                'tempat_lahir'          => 'Nganjuk',
                'tanggal_lahir'         => '1990-01-01',
                'jenis_kelamin'         => 'L',
                'agama_id'              => $agama?->id,
                'jenis_pegawai_id'      => $jenisPegawai?->id,
                'status_kepegawaian_id' => $statusKepegawaian?->id,
                'unit_kerja_id'         => $unitKerja?->id,
                'email'                 => 'admin@simpeg.sman1prambon.sch.id',
                'status_aktif'          => true,
            ],
        );

        // -----------------------------------------------------------------
        // 3. Create the user account
        // -----------------------------------------------------------------
        $user = User::firstOrCreate(
            ['username' => 'admin'],
            [
                'pegawai_id'           => $pegawai->id,
                'email'                => 'admin@simpeg.sman1prambon.sch.id',
                'password'             => 'admin123',
                'is_active'            => true,
                'must_change_password' => false,
            ],
        );

        // -----------------------------------------------------------------
        // 4. Assign the Super Admin role
        // -----------------------------------------------------------------
        $superAdminRole = Role::where('nama', 'Super Admin')->first();

        if ($superAdminRole) {
            $user->roles()->syncWithoutDetaching([$superAdminRole->id]);
        }
    }
}
