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
        // Agregar campo de foto de perfil a usuarios
        Schema::table('users', function (Blueprint $table) {
            $table->string('foto_perfil')->nullable()->after('role_data')->comment('Ruta de la foto de perfil guardada por cédula');
        });

        // El campo 'imagen' ya existe en productos, pero lo actualizamos para incluir comentario
        Schema::table('productos', function (Blueprint $table) {
            $table->string('imagen')->nullable()->comment('Ruta de la imagen del producto')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('foto_perfil');
        });

        // No hacemos cambios en productos ya que el campo ya existía
    }
};
