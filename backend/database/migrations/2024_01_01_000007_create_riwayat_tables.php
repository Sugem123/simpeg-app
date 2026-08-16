<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('riwayat_jabatan', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('pegawai_id')
                ->constrained('pegawai')
                ->onUpdate('cascade')
                ->onDelete('restrict');
            $table->foreignUuid('jabatan_id')
                ->constrained('jabatan')
                ->onUpdate('cascade')
                ->onDelete('restrict');
            $table->string('nomor_sk', 100)->nullable();
            $table->date('tanggal_sk')->nullable();
            $table->date('tmt');
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });

        Schema::create('riwayat_pangkat', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('pegawai_id')
                ->constrained('pegawai')
                ->onUpdate('cascade')
                ->onDelete('restrict');
            $table->foreignUuid('pangkat_id')
                ->constrained('pangkat')
                ->onUpdate('cascade')
                ->onDelete('restrict');
            $table->foreignUuid('golongan_id')
                ->constrained('golongan')
                ->onUpdate('cascade')
                ->onDelete('restrict');
            $table->string('nomor_sk', 100)->nullable();
            $table->date('tanggal_sk')->nullable();
            $table->date('tmt');
            $table->timestamps();
        });

        Schema::create('riwayat_pendidikan', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('pegawai_id')
                ->constrained('pegawai')
                ->onUpdate('cascade')
                ->onDelete('restrict');
            $table->string('jenjang', 50);
            $table->string('institusi', 200);
            $table->string('jurusan', 200)->nullable();
            $table->year('tahun_lulus');
            $table->string('nomor_ijazah', 100)->nullable();
            $table->timestamps();
        });

        Schema::create('riwayat_kgb', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('pegawai_id')
                ->constrained('pegawai')
                ->onUpdate('cascade')
                ->onDelete('restrict');
            $table->string('nomor_sk', 100)->nullable();
            $table->date('tanggal_sk')->nullable();
            $table->date('tmt');
            $table->decimal('gaji_pokok_lama', 15, 2)->nullable();
            $table->decimal('gaji_pokok_baru', 15, 2)->nullable();
            $table->timestamps();
        });

        Schema::create('riwayat_diklat', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('pegawai_id')
                ->constrained('pegawai')
                ->onUpdate('cascade')
                ->onDelete('restrict');
            $table->string('nama_diklat', 200);
            $table->string('penyelenggara', 200)->nullable();
            $table->year('tahun')->nullable();
            $table->integer('jam_pelajaran')->nullable();
            $table->string('nomor_sertifikat', 100)->nullable();
            $table->timestamps();
        });

        Schema::create('riwayat_mutasi', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('pegawai_id')
                ->constrained('pegawai')
                ->onUpdate('cascade')
                ->onDelete('restrict');
            $table->string('asal', 200);
            $table->string('tujuan', 200);
            $table->string('nomor_sk', 100)->nullable();
            $table->date('tanggal_sk')->nullable();
            $table->date('tmt');
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('riwayat_mutasi');
        Schema::dropIfExists('riwayat_diklat');
        Schema::dropIfExists('riwayat_kgb');
        Schema::dropIfExists('riwayat_pendidikan');
        Schema::dropIfExists('riwayat_pangkat');
        Schema::dropIfExists('riwayat_jabatan');
    }
};
