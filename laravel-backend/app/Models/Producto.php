<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'categoria',
        'precio',
        'descripcion',
        'imagen',
        'disponibles',
        'calificacion',
        'user_id', // ID del productor
    ];

    protected $casts = [
        'precio' => 'decimal:2',
        'calificacion' => 'decimal:1',
        'disponibles' => 'integer',
    ];

    /**
     * Relación con el productor (User)
     */
    public function productor()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relación con items del carrito
     */
    public function carritoItems()
    {
        return $this->hasMany(Carrito::class);
    }

    /**
     * Relación con items de pedidos
     */
    public function pedidoItems()
    {
        return $this->hasMany(PedidoItem::class);
    }

    /**
     * Relación con reviews
     */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
