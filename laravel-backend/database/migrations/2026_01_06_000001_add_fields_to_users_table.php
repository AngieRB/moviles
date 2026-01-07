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
        Schema::table('users', function (Blueprint $table) {
            $table->string('name')->after('id');
            $table->string('apellido')->nullable()->after('name');
            $table->string('cedula')->unique()->nullable()->after('apellido');
            $table->string('telefono')->nullable()->after('cedula');
            $table->enum('role', ['productor', 'consumidor', 'administrador'])->default('consumidor')->after('email');
            $table->json('role_data')->nullable()->after('role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['name', 'apellido', 'cedula', 'telefono', 'role', 'role_data']);
        });
    }
};
