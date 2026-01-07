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
        // Eliminar la columna 'nombre' si existe y agregar 'name' si no está
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'nombre')) {
                $table->dropColumn('nombre');
            }
            if (!Schema::hasColumn('users', 'name')) {
                $table->string('name')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            //
        });
    }
};
