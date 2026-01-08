<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    use HasFactory;

    protected $fillable = [
        'productor_id',
        'consumidor_id',
        'ultimo_mensaje',
        'ultimo_mensaje_at',
    ];

    protected $casts = [
        'ultimo_mensaje_at' => 'datetime',
    ];

    /**
     * Relación con el productor
     */
    public function productor()
    {
        return $this->belongsTo(User::class, 'productor_id');
    }

    /**
     * Relación con el consumidor
     */
    public function consumidor()
    {
        return $this->belongsTo(User::class, 'consumidor_id');
    }

    /**
     * Relación con los mensajes
     */
    public function mensajes()
    {
        return $this->hasMany(Mensaje::class);
    }
}
