<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Agregar columnas de acciones administrativas a la tabla reports
        Schema::table('reports', function (Blueprint $table) {
            $table->string('accion_admin')->default('ninguna')->after('respuesta_admin');
            $table->json('historial_acciones')->nullable()->after('accion_admin');
            $table->integer('prioridad')->default(0)->after('historial_acciones')->comment('0=baja, 1=media, 2=alta');
        });

        // PostgreSQL no soporta ENUM ni MODIFY COLUMN directamente
        // Los nuevos motivos se validarán en el controlador
    }

    public function down()
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropColumn(['accion_admin', 'historial_acciones', 'prioridad']);
        });
    }
};
