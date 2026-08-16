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
        Schema::create('surat', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nomor', 100);
            $table->string('jenis', 50);
            $table->foreignUuid('pegawai_id')
                ->constrained('pegawai')
                ->onUpdate('cascade')
                ->onDelete('restrict');
            $table->string('perihal', 255)->nullable();
            $table->date('tanggal');
            $table->string('file_pdf', 500)->nullable();
            $table->foreignUuid('created_by')
                ->constrained('users')
                ->onUpdate('cascade')
                ->onDelete('restrict');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('surat');
    }
};
