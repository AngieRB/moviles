<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'reportador_id',
        'reportado_id',
        'producto_id',
        'pedido_id',
        'tipo_reportado',
        'motivo',
        'descripcion',
        'evidencias',
        'estado',
        'respuesta_admin',
        'fecha_revision',
        'revisado_por'
    ];

    protected $casts = [
        'evidencias' => 'array',
        'fecha_revision' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relaciones
    public function reportador()
    {
        return $this->belongsTo(User::class, 'reportador_id');
    }

    public function reportado()
    {
        return $this->belongsTo(User::class, 'reportado_id');
    }

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'producto_id');
    }

    public function pedido()
    {
        return $this->belongsTo(Pedido::class, 'pedido_id');
    }

    public function revisor()
    {
        return $this->belongsTo(User::class, 'revisado_por');
    }
}
