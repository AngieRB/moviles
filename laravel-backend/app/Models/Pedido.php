<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'estado', // pendiente, procesando, enviado, entregado, cancelado
        'total',
        'direccion_envio',
    ];

    protected $casts = [
        'total' => 'decimal:2',
    ];

    /**
     * Relación con el usuario (consumidor)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relación con los items del pedido
     */
    public function items()
    {
        return $this->hasMany(PedidoItem::class);
    }
}
