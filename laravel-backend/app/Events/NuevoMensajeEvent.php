<?php

namespace App\Events;

use App\Models\Chat;
use App\Models\Mensaje;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NuevoMensajeEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $chat;
    public $mensaje;
    public $user;

    /**
     * Create a new event instance.
     */
    public function __construct(Chat $chat, Mensaje $mensaje, User $user)
    {
        $this->chat = $chat;
        $this->mensaje = $mensaje;
        $this->user = $user;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): Channel
    {
        return new Channel('chat-' . $this->chat->id);
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'nuevo-mensaje';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'mensaje' => [
                'id' => $this->mensaje->id,
                'mensaje' => $this->mensaje->mensaje,
                'user_id' => $this->mensaje->user_id,
                'chat_id' => $this->mensaje->chat_id,
                'created_at' => $this->mensaje->created_at->toISOString(),
            ],
        ];
    }
}
