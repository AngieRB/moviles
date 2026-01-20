<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reportador_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('reportado_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->foreignId('producto_id')->nullable()->constrained('productos')->onDelete('cascade');
            $table->foreignId('pedido_id')->nullable()->constrained('pedidos')->onDelete('cascade');
            $table->enum('tipo_reportado', ['usuario', 'producto', 'pedido']);
            $table->enum('motivo', [
                'contenido_inapropiado',
                'fraude',
                'producto_falso',
                'mala_calidad',
                'no_entregado',
                'comportamiento_abusivo',
                'spam',
                'otro'
            ]);
            $table->text('descripcion');
            $table->json('evidencias')->nullable(); // URLs de imágenes
            $table->enum('estado', ['pendiente', 'en_revision', 'resuelto', 'rechazado'])->default('pendiente');
            $table->text('respuesta_admin')->nullable();
            $table->timestamp('fecha_revision')->nullable();
            $table->foreignId('revisado_por')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
