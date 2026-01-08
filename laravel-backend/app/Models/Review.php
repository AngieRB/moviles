<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'producto_id',
        'user_id',
        'calificacion',
        'comentario',
    ];

    protected $casts = [
        'calificacion' => 'decimal:1',
    ];

    /**
     * Relación con el producto
     */
    public function producto()
    {
        return $this->belongsTo(Producto::class);
    }

    /**
     * Relación con el usuario (quien calificó)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
