<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pegawai', function (Blueprint $table) {
            $table->string('npwp', 30)->nullable()->after('emaster_synced_at');
            $table->string('no_bpjs', 30)->nullable()->after('npwp');
            $table->string('no_kk', 30)->nullable()->after('no_bpjs');
            $table->date('bup')->nullable()->after('no_kk');
            $table->date('tmt_cpns')->nullable()->after('bup');
            $table->string('no_sk_cpns', 100)->nullable()->after('tmt_cpns');
            $table->date('tgl_sk_cpns')->nullable()->after('no_sk_cpns');
            $table->date('tmt_pns')->nullable()->after('tgl_sk_cpns');
            $table->string('no_sk_pns', 100)->nullable()->after('tmt_pns');
            $table->date('tgl_sk_pns')->nullable()->after('no_sk_pns');
            $table->string('no_sk_pangkat', 100)->nullable()->after('tgl_sk_pns');
            $table->date('tgl_sk_pangkat')->nullable()->after('no_sk_pangkat');
            $table->string('kelas_jabatan', 10)->nullable()->after('tgl_sk_pangkat');
            $table->string('rumpun', 50)->nullable()->after('kelas_jabatan');
            $table->string('status_diangkat', 50)->nullable()->after('rumpun');
            $table->string('status_diklat_fungsional', 50)->nullable()->after('status_diangkat');
            $table->string('status_sertifikat_pendidik', 50)->nullable()->after('status_diklat_fungsional');
            $table->text('alamat_domisili')->nullable()->after('status_sertifikat_pendidik');
            $table->string('kab_kota_domisili', 100)->nullable()->after('alamat_domisili');
            $table->string('provinsi_domisili', 100)->nullable()->after('kab_kota_domisili');
            $table->string('nama_pasangan', 200)->nullable()->after('provinsi_domisili');
            $table->string('nip_pasangan', 30)->nullable()->after('nama_pasangan');
            $table->string('tempat_lahir_pasangan', 100)->nullable()->after('nip_pasangan');
            $table->date('tgl_lahir_pasangan')->nullable()->after('tempat_lahir_pasangan');
            $table->integer('jumlah_pasangan')->nullable()->after('tgl_lahir_pasangan');
            $table->integer('jumlah_anak')->nullable()->after('jumlah_pasangan');
            $table->text('nama_anak')->nullable()->after('jumlah_anak');
            $table->date('tgl_nikah')->nullable()->after('nama_anak');
            $table->string('spt_efilling', 50)->nullable()->after('tgl_nikah');
            $table->string('sumpah_pns_status', 50)->nullable()->after('spt_efilling');
            $table->string('talent_dna', 100)->nullable()->after('sumpah_pns_status');
            $table->string('nama_lahir', 200)->nullable()->after('talent_dna');
            $table->date('tmt_gaji_berkala')->nullable()->after('nama_lahir');
            $table->string('gaji_berkala', 100)->nullable()->after('tmt_gaji_berkala');
        });
    }

    public function down(): void
    {
        Schema::table('pegawai', function (Blueprint $table) {
            $table->dropColumn([
                'npwp', 'no_bpjs', 'no_kk', 'bup',
                'tmt_cpns', 'no_sk_cpns', 'tgl_sk_cpns',
                'tmt_pns', 'no_sk_pns', 'tgl_sk_pns',
                'no_sk_pangkat', 'tgl_sk_pangkat',
                'kelas_jabatan', 'rumpun',
                'status_diangkat', 'status_diklat_fungsional', 'status_sertifikat_pendidik',
                'alamat_domisili', 'kab_kota_domisili', 'provinsi_domisili',
                'nama_pasangan', 'nip_pasangan', 'tempat_lahir_pasangan', 'tgl_lahir_pasangan',
                'jumlah_pasangan', 'jumlah_anak', 'nama_anak',
                'tgl_nikah', 'spt_efilling', 'sumpah_pns_status',
                'talent_dna', 'nama_lahir',
                'tmt_gaji_berkala', 'gaji_berkala',
            ]);
        });
    }
};
