<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PruebaEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $mensaje; // Esta es la información que enviaremos

    public function __construct($texto)
    {
        $this->mensaje = $texto;
    }

    public function broadcastOn()
    {
        // 3. IMPORTANTE: Nombre del canal público (como una estación de radio)
        return 'evento-prueba';
    }
}
