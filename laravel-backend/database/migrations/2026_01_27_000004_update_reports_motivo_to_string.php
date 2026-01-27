<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // PostgreSQL no soporta ALTER COLUMN de ENUM directamente
        // Necesitamos recrear la columna
        
        // Paso 1: Agregar nueva columna temporal
        DB::statement('ALTER TABLE reports ADD COLUMN motivo_temp VARCHAR(255)');
        
        // Paso 2: Copiar datos existentes
        DB::statement("UPDATE reports SET motivo_temp = motivo::text");
        
        // Paso 3: Eliminar columna vieja
        DB::statement('ALTER TABLE reports DROP COLUMN motivo');
        
        // Paso 4: Renombrar columna temporal
        DB::statement('ALTER TABLE reports RENAME COLUMN motivo_temp TO motivo');
        
        // Paso 5: Agregar constraint check con todos los motivos permitidos
        DB::statement("
            ALTER TABLE reports ADD CONSTRAINT reports_motivo_check CHECK (
                motivo IN (
                    'producto_defectuoso',
                    'cobro_indebido',
                    'incumplimiento_entrega',
                    'producto_diferente',
                    'comportamiento_inadecuado',
                    'fraude_proveedor',
                    'pedido_fraudulento',
                    'pago_no_realizado',
                    'devolucion_injustificada',
                    'abuso_consumidor',
                    'informacion_falsa',
                    'otro'
                )
            )
        ");
    }

    public function down(): void
    {
        // Eliminar constraint
        DB::statement('ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_motivo_check');
        
        // Volver a enum original (opcional)
        DB::statement('ALTER TABLE reports ADD COLUMN motivo_temp VARCHAR(255)');
        DB::statement("UPDATE reports SET motivo_temp = motivo");
        DB::statement('ALTER TABLE reports DROP COLUMN motivo');
        
        Schema::table('reports', function (Blueprint $table) {
            $table->enum('motivo', [
                'contenido_inapropiado',
                'fraude',
                'producto_falso',
                'mala_calidad',
                'no_entregado',
                'comportamiento_abusivo',
                'spam',
                'otro'
            ])->after('tipo_reportado');
        });
        
        DB::statement("UPDATE reports SET motivo = motivo_temp");
        DB::statement('ALTER TABLE reports DROP COLUMN motivo_temp');
    }
};
