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
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('pegawai_id')
                ->unique()
                ->constrained('pegawai')
                ->onUpdate('cascade')
                ->onDelete('restrict');
            $table->string('username', 50)->unique();
            $table->string('email', 150)->unique();
            $table->string('password', 255);
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_login_at')->nullable();
            $table->boolean('must_change_password')->default(true);
            $table->timestamps();

            // Additional indexes
            $table->index('username');
            $table->index('email');
        });

        Schema::create('role_user', function (Blueprint $table) {
            $table->foreignUuid('role_id')
                ->constrained('roles')
                ->onUpdate('cascade')
                ->onDelete('restrict');
            $table->foreignUuid('user_id')
                ->constrained('users')
                ->onUpdate('cascade')
                ->onDelete('restrict');
            $table->primary(['role_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_user');
        Schema::dropIfExists('users');
    }
};
