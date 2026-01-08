<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mensaje extends Model
{
    use HasFactory;

    protected $fillable = [
        'chat_id',
        'user_id',
        'mensaje',
        'leido',
    ];

    protected $casts = [
        'leido' => 'boolean',
    ];

    /**
     * Relación con el chat
     */
    public function chat()
    {
        return $this->belongsTo(Chat::class);
    }

    /**
     * Relación con el usuario (remitente)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
