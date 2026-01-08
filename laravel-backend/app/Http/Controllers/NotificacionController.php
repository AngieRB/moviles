<?php

namespace App\Http\Controllers;

use App\Models\Notificacion;
use Illuminate\Http\Request;

class NotificacionController extends Controller
{
    /**
     * Listar notificaciones del usuario autenticado
     */
    public function index(Request $request)
    {
        $notificaciones = Notificacion::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($notificacion) {
                return [
                    'id' => $notificacion->id,
                    'tipo' => $notificacion->tipo,
                    'titulo' => $notificacion->titulo,
                    'mensaje' => $notificacion->mensaje,
                    'data' => $notificacion->data,
                    'leido' => $notificacion->leido,
                    'fecha' => $notificacion->created_at->format('Y-m-d H:i'),
                ];
            });

        return response()->json([
            'notificaciones' => $notificaciones,
        ], 200);
    }

    /**
     * Contar notificaciones no leídas
     */
    public function noLeidas(Request $request)
    {
        $count = Notificacion::where('user_id', $request->user()->id)
            ->where('leido', false)
            ->count();

        return response()->json([
            'no_leidas' => $count,
        ], 200);
    }

    /**
     * Marcar notificación como leída
     */
    public function marcarLeida(Request $request, $id)
    {
        $notificacion = Notificacion::find($id);

        if (!$notificacion) {
            return response()->json(['message' => 'Notificación no encontrada'], 404);
        }

        if ($notificacion->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $notificacion->update(['leido' => true]);

        return response()->json([
            'message' => 'Notificación marcada como leída',
        ], 200);
    }

    /**
     * Marcar todas como leídas
     */
    public function marcarTodasLeidas(Request $request)
    {
        Notificacion::where('user_id', $request->user()->id)
            ->where('leido', false)
            ->update(['leido' => true]);

        return response()->json([
            'message' => 'Todas las notificaciones marcadas como leídas',
        ], 200);
    }

    /**
     * Eliminar notificación
     */
    public function destroy(Request $request, $id)
    {
        $notificacion = Notificacion::find($id);

        if (!$notificacion) {
            return response()->json(['message' => 'Notificación no encontrada'], 404);
        }

        if ($notificacion->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $notificacion->delete();

        return response()->json([
            'message' => 'Notificación eliminada',
        ], 200);
    }
}
