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
        Schema::create('agama', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nama', 50)->unique();
            $table->timestamps();
        });

        Schema::create('jenis_pegawai', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nama', 50)->unique();
            $table->timestamps();
        });

        Schema::create('status_kepegawaian', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nama', 100)->unique();
            $table->timestamps();
        });

        Schema::create('unit_kerja', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('kode', 20)->unique();
            $table->string('nama', 200);
            $table->timestamps();
        });

        Schema::create('jabatan', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('kode', 20)->unique();
            $table->string('nama', 200);
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });

        Schema::create('pangkat', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('kode', 20)->unique();
            $table->string('nama', 200);
            $table->timestamps();
        });

        Schema::create('golongan', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('kode', 20)->unique();
            $table->string('nama', 200);
            $table->timestamps();
        });

        Schema::create('mata_pelajaran', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('kode', 20)->nullable()->unique();
            $table->string('nama', 200);
            $table->timestamps();
        });

        Schema::create('pendidikan', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('jenjang', 50)->unique();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pendidikan');
        Schema::dropIfExists('mata_pelajaran');
        Schema::dropIfExists('golongan');
        Schema::dropIfExists('pangkat');
        Schema::dropIfExists('jabatan');
        Schema::dropIfExists('unit_kerja');
        Schema::dropIfExists('status_kepegawaian');
        Schema::dropIfExists('jenis_pegawai');
        Schema::dropIfExists('agama');
    }
};
