<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    
    /**
     * Seed the permissions table and assign permissions to roles.
     */
    public function run(): void
    {
        // -----------------------------------------------------------------
        // 1. Create all permissions grouped by module
        // -----------------------------------------------------------------
        $permissionsByModule = [
            'Dashboard' => [
                'dashboard.view' => 'Melihat dashboard',
            ],
            'Pegawai' => [
                'pegawai.view'   => 'Melihat data pegawai',
                'pegawai.create' => 'Menambah data pegawai',
                'pegawai.update' => 'Mengubah data pegawai',
                'pegawai.delete' => 'Menghapus data pegawai',
                'pegawai.export' => 'Mengekspor data pegawai',
                'pegawai.import' => 'Mengimpor data pegawai',
            ],
            'Dokumen' => [
                'dokumen.view'     => 'Melihat dokumen',
                'dokumen.upload'   => 'Mengunggah dokumen',
                'dokumen.update'   => 'Mengubah dokumen',
                'dokumen.delete'   => 'Menghapus dokumen',
                'dokumen.download' => 'Mengunduh dokumen',
            ],
            'Riwayat' => [
                'riwayat.view'   => 'Melihat riwayat',
                'riwayat.create' => 'Menambah riwayat',
                'riwayat.update' => 'Mengubah riwayat',
                'riwayat.export' => 'Mengekspor riwayat',
            ],
            'Surat' => [
                'surat.view'    => 'Melihat surat',
                'surat.create'  => 'Membuat surat',
                'surat.update'  => 'Mengubah surat',
                'surat.delete'  => 'Menghapus surat',
                'surat.approve' => 'Menyetujui surat',
            ],
            'Cuti' => [
                'cuti.view'    => 'Melihat pengajuan cuti',
                'cuti.create'  => 'Mengajukan cuti',
                'cuti.update'  => 'Mengubah pengajuan cuti',
                'cuti.approve' => 'Menyetujui cuti',
                'cuti.reject'  => 'Menolak cuti',
            ],
            'Laporan' => [
                'laporan.view'   => 'Melihat laporan',
                'laporan.export' => 'Mengekspor laporan',
            ],
            'User' => [
                'user.view'           => 'Melihat data user',
                'user.create'         => 'Menambah user',
                'user.update'         => 'Mengubah user',
                'user.delete'         => 'Menghapus user',
                'user.reset_password' => 'Mereset password user',
            ],
            'Role' => [
                'role.view'   => 'Melihat role',
                'role.create' => 'Menambah role',
                'role.update' => 'Mengubah role',
                'role.delete' => 'Menghapus role',
            ],
            'Audit' => [
                'audit.view'   => 'Melihat audit log',
                'audit.export' => 'Mengekspor audit log',
            ],
            'Pengaturan' => [
                'pengaturan.view'   => 'Melihat pengaturan',
                'pengaturan.update' => 'Mengubah pengaturan',
            ],
        ];

        foreach ($permissionsByModule as $modul => $permissions) {
            foreach ($permissions as $nama => $deskripsi) {
                Permission::firstOrCreate(
                    ['nama' => $nama],
                    [
                        'modul'     => $modul,
                        'deskripsi' => $deskripsi,
                    ],
                );
            }
        }

        // -----------------------------------------------------------------
        // 2. Assign permissions to roles
        // -----------------------------------------------------------------
        $allPermissions = Permission::all();

        // Super Admin — all permissions
        $superAdmin = Role::where('nama', 'Super Admin')->first();
        if ($superAdmin) {
            $superAdmin->permissions()->syncWithoutDetaching(
                $allPermissions->pluck('id')->toArray()
            );
        }

        // Fasilitator — operational subset
        $fasilitatorPermissions = [
            'dashboard.view',
            'pegawai.view',
            'pegawai.create',
            'pegawai.update',
            'pegawai.export',
            'pegawai.import',
            'dokumen.view',
            'dokumen.upload',
            'dokumen.update',
            'dokumen.delete',
            'dokumen.download',
            'riwayat.view',
            'riwayat.create',
            'riwayat.update',
            'riwayat.export',
            'surat.view',
            'surat.create',
            'surat.update',
            'cuti.view',
            'cuti.create',
            'cuti.update',
            'cuti.approve',
            'cuti.reject',
            'laporan.view',
            'laporan.export',
            'audit.view',
        ];

        $fasilitator = Role::where('nama', 'Fasilitator')->first();
        if ($fasilitator) {
            $ids = $allPermissions
                ->whereIn('nama', $fasilitatorPermissions)
                ->pluck('id')
                ->toArray();
            $fasilitator->permissions()->syncWithoutDetaching($ids);
        }

        // Individu — own-data subset
        $individuPermissions = [
            'dashboard.view',
            'pegawai.view',
            'dokumen.view',
            'dokumen.upload',
            'dokumen.download',
            'riwayat.view',
            'cuti.view',
            'cuti.create',
            'cuti.update',
        ];

        $individu = Role::where('nama', 'Individu')->first();
        if ($individu) {
            $ids = $allPermissions
                ->whereIn('nama', $individuPermissions)
                ->pluck('id')
                ->toArray();
            $individu->permissions()->syncWithoutDetaching($ids);
        }
    }
}
