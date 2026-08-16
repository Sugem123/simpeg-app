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
        Schema::create('permissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nama', 100)->unique();
            $table->string('modul', 50);
            $table->text('deskripsi')->nullable();
            $table->string('guard_name', 50)->default('api');
            $table->timestamps();
        });

        Schema::create('permission_role', function (Blueprint $table) {
            $table->foreignUuid('permission_id')
                ->constrained('permissions')
                ->onUpdate('cascade')
                ->onDelete('restrict');
            $table->foreignUuid('role_id')
                ->constrained('roles')
                ->onUpdate('cascade')
                ->onDelete('restrict');
            $table->primary(['permission_id', 'role_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permission_role');
        Schema::dropIfExists('permissions');
    }
};
