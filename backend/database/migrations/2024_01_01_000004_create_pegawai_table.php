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
        Schema::create('pegawai', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nip', 30)->nullable()->unique();
            $table->string('nuptk', 30)->nullable();
            $table->string('nik', 16)->unique();
            $table->string('nama', 200);
            $table->string('gelar_depan', 30)->nullable();
            $table->string('gelar_belakang', 50)->nullable();
            $table->string('tempat_lahir', 100);
            $table->date('tanggal_lahir');
            $table->char('jenis_kelamin', 1);
            $table->foreignUuid('agama_id')
                ->constrained('agama')
                ->onUpdate('cascade')
                ->onDelete('restrict');
            $table->foreignUuid('jenis_pegawai_id')
                ->constrained('jenis_pegawai')
                ->onUpdate('cascade')
                ->onDelete('restrict');
            $table->foreignUuid('status_kepegawaian_id')
                ->constrained('status_kepegawaian')
                ->onUpdate('cascade')
                ->onDelete('restrict');
            $table->foreignUuid('jabatan_id')
                ->nullable()
                ->constrained('jabatan')
                ->onUpdate('cascade')
                ->onDelete('restrict');
            $table->foreignUuid('pangkat_id')
                ->nullable()
                ->constrained('pangkat')
                ->onUpdate('cascade')
                ->onDelete('restrict');
            $table->foreignUuid('golongan_id')
                ->nullable()
                ->constrained('golongan')
                ->onUpdate('cascade')
                ->onDelete('restrict');
            $table->foreignUuid('unit_kerja_id')
                ->nullable()
                ->constrained('unit_kerja')
                ->onUpdate('cascade')
                ->onDelete('restrict');
            $table->text('alamat')->nullable();
            $table->string('no_hp', 20)->nullable();
            $table->string('email', 150)->unique();
            $table->string('foto', 255)->nullable();
            $table->boolean('status_aktif')->default(true);
            $table->timestamps();
            $table->softDeletes();

            // Additional indexes
            $table->index('nip');
            $table->index('nik');
            $table->index('email');
            $table->index('status_kepegawaian_id');
            $table->index('jabatan_id');
            $table->index('unit_kerja_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pegawai');
    }
};
