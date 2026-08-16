<?php

namespace Database\Seeders;

use App\Models\Agama;
use App\Models\Golongan;
use App\Models\Jabatan;
use App\Models\JenisPegawai;
use App\Models\Pangkat;
use App\Models\Pegawai;
use App\Models\StatusKepegawaian;
use App\Models\UnitKerja;
use Illuminate\Database\Seeder;

class PegawaiSeeder extends Seeder
{
    /**
     * Seed 5 demo pegawai for SMAN 1 Prambon.
     */
    public function run(): void
    {
        // Resolve master data IDs by nama
        $unitKerja  = UnitKerja::where('nama', 'SMAN 1 Prambon')->first();
        $islam      = Agama::where('nama', 'Islam')->first();
        $kristen    = Agama::where('nama', 'Kristen')->first();
        $katolik    = Agama::where('nama', 'Katolik')->first();

        $pns   = StatusKepegawaian::where('nama', 'PNS')->first();
        $pppk  = StatusKepegawaian::where('nama', 'PPPK')->first();
        $gtt   = StatusKepegawaian::where('nama', 'GTT')->first();

        $guru = JenisPegawai::where('nama', 'Guru')->first();
        $staf = JenisPegawai::where('nama', 'Staf')->first();

        // Jabatan
        $ks   = Jabatan::where('kode', 'KS')->first();
        $wks1 = Jabatan::where('kode', 'WKS1')->first();
        $gmp  = Jabatan::where('kode', 'GMP')->first();
        $gbk  = Jabatan::where('kode', 'GBK')->first();
        $ktu  = Jabatan::where('kode', 'KTU')->first();

        // Pangkat & Golongan
        $pembinaIVa   = Pangkat::where('nama', 'Pembina')->first();
        $golIVa       = Golongan::where('nama', 'IV/a')->first();

        $penataIIIc   = Pangkat::where('nama', 'Penata')->first();
        $golIIIc      = Golongan::where('nama', 'III/c')->first();

        $penataMudaIIIa = Pangkat::where('nama', 'Penata Muda')->first();
        $golIIIa        = Golongan::where('nama', 'III/a')->first();

        $penataMudaTkIIIb = Pangkat::where('nama', 'Penata Muda Tingkat I')->first();
        $golIIIb          = Golongan::where('nama', 'III/b')->first();

        $pengaturIIc  = Pangkat::where('nama', 'Pengatur')->first();
        $golIIc       = Golongan::where('nama', 'II/c')->first();

        $pegawaiData = [
            [
                'nip'                    => '196812051993031008',
                'nik'                    => '3518120512680001',
                'nama'                   => 'Drs. Bambang Supriyanto',
                'gelar_depan'            => 'Drs.',
                'gelar_belakang'         => null,
                'tempat_lahir'           => 'Nganjuk',
                'tanggal_lahir'          => '1968-12-05',
                'jenis_kelamin'          => 'L',
                'agama_id'               => $islam?->id,
                'jenis_pegawai_id'       => $guru?->id,
                'status_kepegawaian_id'  => $pns?->id,
                'jabatan_id'             => $ks?->id,
                'pangkat_id'             => $pembinaIVa?->id,
                'golongan_id'            => $golIVa?->id,
                'unit_kerja_id'          => $unitKerja?->id,
                'alamat'                 => 'Jl. Raya Prambon No. 45, Nganjuk',
                'no_hp'                  => '081234567801',
                'email'                  => 'bambang.supriyanto@sman1prambon.sch.id',
                'status_aktif'           => true,
            ],
            [
                'nip'                    => '198503142010012015',
                'nik'                    => '3518034503850002',
                'nama'                   => 'Siti Rahayu',
                'gelar_depan'            => null,
                'gelar_belakang'         => 'S.Pd., M.Pd.',
                'tempat_lahir'           => 'Surabaya',
                'tanggal_lahir'          => '1985-03-14',
                'jenis_kelamin'          => 'P',
                'agama_id'               => $islam?->id,
                'jenis_pegawai_id'       => $guru?->id,
                'status_kepegawaian_id'  => $pns?->id,
                'jabatan_id'             => $wks1?->id,
                'pangkat_id'             => $penataIIIc?->id,
                'golongan_id'            => $golIIIc?->id,
                'unit_kerja_id'          => $unitKerja?->id,
                'alamat'                 => 'Perum Graha Indah Blok C-12, Nganjuk',
                'no_hp'                  => '081234567802',
                'email'                  => 'siti.rahayu@sman1prambon.sch.id',
                'status_aktif'           => true,
            ],
            [
                'nip'                    => '199207222019032004',
                'nik'                    => '3518036207920003',
                'nama'                   => 'Dewi Kartika Sari',
                'gelar_depan'            => null,
                'gelar_belakang'         => 'S.Pd.',
                'tempat_lahir'           => 'Kediri',
                'tanggal_lahir'          => '1992-07-22',
                'jenis_kelamin'          => 'P',
                'agama_id'               => $kristen?->id,
                'jenis_pegawai_id'       => $guru?->id,
                'status_kepegawaian_id'  => $pppk?->id,
                'jabatan_id'             => $gmp?->id,
                'pangkat_id'             => $penataMudaIIIa?->id,
                'golongan_id'            => $golIIIa?->id,
                'unit_kerja_id'          => $unitKerja?->id,
                'alamat'                 => 'Ds. Gondang RT 03/RW 01, Nganjuk',
                'no_hp'                  => '081234567803',
                'email'                  => 'dewi.kartika@sman1prambon.sch.id',
                'status_aktif'           => true,
            ],
            [
                'nip'                    => null,
                'nuptk'                  => '3842770671130003',
                'nik'                    => '3518011505880004',
                'nama'                   => 'Ahmad Fauzi',
                'gelar_depan'            => null,
                'gelar_belakang'         => 'S.Psi.',
                'tempat_lahir'           => 'Jombang',
                'tanggal_lahir'          => '1988-05-15',
                'jenis_kelamin'          => 'L',
                'agama_id'               => $islam?->id,
                'jenis_pegawai_id'       => $guru?->id,
                'status_kepegawaian_id'  => $gtt?->id,
                'jabatan_id'             => $gbk?->id,
                'pangkat_id'             => null,
                'golongan_id'            => null,
                'unit_kerja_id'          => $unitKerja?->id,
                'alamat'                 => 'Jl. Mawar No. 8, Jombang',
                'no_hp'                  => '081234567804',
                'email'                  => 'ahmad.fauzi@sman1prambon.sch.id',
                'status_aktif'           => true,
            ],
            [
                'nip'                    => '198911302015041002',
                'nik'                    => '3518013011890005',
                'nama'                   => 'Eko Prasetyo',
                'gelar_depan'            => null,
                'gelar_belakang'         => 'A.Md.',
                'tempat_lahir'           => 'Nganjuk',
                'tanggal_lahir'          => '1989-11-30',
                'jenis_kelamin'          => 'L',
                'agama_id'               => $katolik?->id,
                'jenis_pegawai_id'       => $staf?->id,
                'status_kepegawaian_id'  => $pns?->id,
                'jabatan_id'             => $ktu?->id,
                'pangkat_id'             => $pengaturIIc?->id,
                'golongan_id'            => $golIIc?->id,
                'unit_kerja_id'          => $unitKerja?->id,
                'alamat'                 => 'Jl. Diponegoro No. 23, Nganjuk',
                'no_hp'                  => '081234567805',
                'email'                  => 'eko.prasetyo@sman1prambon.sch.id',
                'status_aktif'           => true,
            ],
        ];

        foreach ($pegawaiData as $data) {
            Pegawai::firstOrCreate(
                ['nik' => $data['nik']],
                $data
            );
        }
    }
}
