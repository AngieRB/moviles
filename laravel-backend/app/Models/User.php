<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'apellido',
        'cedula',
        'telefono',
        'email',
        'password',
        'role', // productor, consumidor, administrador
        'role_data', // JSON con datos específicos del rol
        'foto_perfil', // Ruta de la foto de perfil
        'verificado', // Agregado para permitir asignación masiva si es necesario
        'fecha_verificacion',
        'bloqueado',
        'tipo_bloqueo',
        'motivo_bloqueo',
        'fecha_bloqueo',
        'fecha_desbloqueo',
        'bloqueado_por'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            // --- AQUÍ ESTÁ EL CAMBIO IMPORTANTE ---
            'verificado' => 'boolean', // Convierte 1/0 a true/false
            'role_data' => 'array',    // Convierte JSON a Array automáticamente
        ];
    }

    /**
     * Relación con productos (para productores)
     */
    public function productos()
    {
        return $this->hasMany(Producto::class);
    }

    /**
     * Relación con pedidos (para consumidores)
     */
    public function pedidos()
    {
        return $this->hasMany(Pedido::class);
    }

    /**
     * Relación con carrito
     */
    public function carrito()
    {
        return $this->hasMany(Carrito::class);
    }

    /**
     * Relación con chats como productor
     */
    public function chatsComoProductor()
    {
        return $this->hasMany(Chat::class, 'productor_id');
    }

    /**
     * Relación con chats como consumidor
     */
    public function chatsComoConsumidor()
    {
        return $this->hasMany(Chat::class, 'consumidor_id');
    }

    /**
     * Relación con mensajes enviados
     */
    public function mensajes()
    {
        return $this->hasMany(Mensaje::class);
    }

    /**
     * Relación con reviews
     */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Relación con notificaciones
     */
    public function notificaciones()
    {
        return $this->hasMany(Notificacion::class);
    }
}
