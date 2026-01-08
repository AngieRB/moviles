<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\Mensaje;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ChatController extends Controller
{
    /**
     * Listar chats del usuario autenticado
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Obtener chats donde el usuario es productor o consumidor
        $chats = Chat::where('productor_id', $user->id)
            ->orWhere('consumidor_id', $user->id)
            ->with(['productor', 'consumidor'])
            ->orderBy('ultimo_mensaje_at', 'desc')
            ->get()
            ->map(function ($chat) use ($user) {
                // Determinar quién es el "otro" usuario en el chat
                $otroUsuario = $chat->productor_id === $user->id 
                    ? $chat->consumidor 
                    : $chat->productor;
                
                return [
                    'id' => $chat->id,
                    'otro_usuario' => [
                        'id' => $otroUsuario->id,
                        'nombre' => $otroUsuario->nombre . ' ' . $otroUsuario->apellido,
                        'role' => $otroUsuario->role,
                    ],
                    'ultimo_mensaje' => $chat->ultimo_mensaje,
                    'ultimo_mensaje_at' => $chat->ultimo_mensaje_at?->format('Y-m-d H:i'),
                ];
            });

        return response()->json([
            'chats' => $chats,
        ], 200);
    }

    /**
     * Obtener o crear un chat entre productor y consumidor
     */
    public function getOrCreate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'otro_usuario_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $otroUsuarioId = $request->otro_usuario_id;

        // Determinar quién es productor y quién es consumidor
        if ($user->role === 'productor') {
            $productorId = $user->id;
            $consumidorId = $otroUsuarioId;
        } else {
            $productorId = $otroUsuarioId;
            $consumidorId = $user->id;
        }

        // Buscar o crear el chat
        $chat = Chat::firstOrCreate([
            'productor_id' => $productorId,
            'consumidor_id' => $consumidorId,
        ]);

        return response()->json([
            'chat' => [
                'id' => $chat->id,
                'productor_id' => $chat->productor_id,
                'consumidor_id' => $chat->consumidor_id,
            ],
        ], 200);
    }

    /**
     * Obtener mensajes de un chat
     */
    public function mensajes(Request $request, $chatId)
    {
        $chat = Chat::find($chatId);

        if (!$chat) {
            return response()->json(['message' => 'Chat no encontrado'], 404);
        }

        // Verificar que el usuario pertenece al chat
        $user = $request->user();
        if ($chat->productor_id !== $user->id && $chat->consumidor_id !== $user->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        // Obtener mensajes
        $mensajes = Mensaje::where('chat_id', $chatId)
            ->with('user:id,nombre,apellido')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($mensaje) use ($user) {
                return [
                    'id' => $mensaje->id,
                    'mensaje' => $mensaje->mensaje,
                    'user_id' => $mensaje->user_id,
                    'es_mio' => $mensaje->user_id === $user->id,
                    'remitente' => $mensaje->user->nombre . ' ' . $mensaje->user->apellido,
                    'leido' => $mensaje->leido,
                    'created_at' => $mensaje->created_at->format('Y-m-d H:i'),
                ];
            });

        // Marcar mensajes como leídos
        Mensaje::where('chat_id', $chatId)
            ->where('user_id', '!=', $user->id)
            ->where('leido', false)
            ->update(['leido' => true]);

        return response()->json([
            'mensajes' => $mensajes,
        ], 200);
    }

    /**
     * Enviar mensaje
     */
    public function enviarMensaje(Request $request, $chatId)
    {
        $validator = Validator::make($request->all(), [
            'mensaje' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $chat = Chat::find($chatId);

        if (!$chat) {
            return response()->json(['message' => 'Chat no encontrado'], 404);
        }

        // Verificar que el usuario pertenece al chat
        $user = $request->user();
        if ($chat->productor_id !== $user->id && $chat->consumidor_id !== $user->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        // Crear mensaje
        $mensaje = Mensaje::create([
            'chat_id' => $chatId,
            'user_id' => $user->id,
            'mensaje' => $request->mensaje,
        ]);

        // Actualizar último mensaje del chat
        $chat->update([
            'ultimo_mensaje' => $request->mensaje,
            'ultimo_mensaje_at' => now(),
        ]);

        return response()->json([
            'message' => 'Mensaje enviado',
            'mensaje' => [
                'id' => $mensaje->id,
                'mensaje' => $mensaje->mensaje,
                'created_at' => $mensaje->created_at->format('Y-m-d H:i'),
            ],
        ], 201);
    }
}
