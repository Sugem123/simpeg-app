<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pegawai', function (Blueprint $table) {
            $table->string('nip_lama', 30)->nullable()->after('nip');
            $table->string('status_hukum', 50)->nullable()->after('status_aktif');
            $table->date('tmt_pangkat')->nullable()->after('status_hukum');
            $table->date('tmt_jabatan')->nullable()->after('tmt_pangkat');
            $table->date('tmt_pensiun')->nullable()->after('tmt_jabatan');
            $table->string('jenis_jabatan_emaster', 50)->nullable()->after('tmt_pensiun');
            $table->string('nama_jabatan_emaster', 200)->nullable()->after('jenis_jabatan_emaster');
            $table->string('mapel', 200)->nullable()->after('nama_jabatan_emaster');
            $table->string('sumber_gaji', 100)->nullable()->after('mapel');
            $table->string('wilayah_pembayaran', 100)->nullable()->after('sumber_gaji');
            $table->string('tunjangan_sertifikasi', 20)->nullable()->after('wilayah_pembayaran');
            $table->string('pendidikan_jenjang', 20)->nullable()->after('tunjangan_sertifikasi');
            $table->string('pendidikan_institusi', 200)->nullable()->after('pendidikan_jenjang');
            $table->string('pendidikan_prodi', 200)->nullable()->after('pendidikan_institusi');
            $table->string('pendidikan_thn_lulus', 10)->nullable()->after('pendidikan_prodi');
            $table->timestamp('emaster_synced_at')->nullable()->after('pendidikan_thn_lulus');
        });
    }

    public function down(): void
    {
        Schema::table('pegawai', function (Blueprint $table) {
            $table->dropColumn([
                'nip_lama', 'status_hukum', 'tmt_pangkat', 'tmt_jabatan', 'tmt_pensiun',
                'jenis_jabatan_emaster', 'nama_jabatan_emaster', 'mapel',
                'sumber_gaji', 'wilayah_pembayaran', 'tunjangan_sertifikasi',
                'pendidikan_jenjang', 'pendidikan_institusi', 'pendidikan_prodi',
                'pendidikan_thn_lulus', 'emaster_synced_at',
            ]);
        });
    }
};
