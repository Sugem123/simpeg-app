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
        Schema::create('dokumen', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('pegawai_id')
                ->constrained('pegawai')
                ->onUpdate('cascade')
                ->onDelete('restrict');
            $table->string('kategori', 50);
            $table->string('nama_file', 255);
            $table->string('path', 500);
            $table->string('mime_type', 100);
            $table->bigInteger('ukuran');
            $table->foreignUuid('uploaded_by')
                ->constrained('users')
                ->onUpdate('cascade')
                ->onDelete('restrict');
            $table->text('keterangan')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Additional indexes
            $table->index('pegawai_id');
            $table->index('kategori');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dokumen');
    }
};
