<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    /**
     * Listar reviews de un producto
     */
    public function index($productoId)
    {
        $producto = Producto::find($productoId);

        if (!$producto) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        $reviews = Review::where('producto_id', $productoId)
            ->with('user:id,nombre,apellido')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($review) {
                return [
                    'id' => $review->id,
                    'usuario' => $review->user->nombre . ' ' . $review->user->apellido,
                    'calificacion' => $review->calificacion,
                    'comentario' => $review->comentario,
                    'fecha' => $review->created_at->format('Y-m-d'),
                ];
            });

        // Calcular promedio
        $promedio = Review::where('producto_id', $productoId)->avg('calificacion');

        return response()->json([
            'reviews' => $reviews,
            'promedio' => round($promedio, 1),
            'total' => $reviews->count(),
        ], 200);
    }

    /**
     * Crear o actualizar review
     */
    public function store(Request $request, $productoId)
    {
        $producto = Producto::find($productoId);

        if (!$producto) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'calificacion' => 'required|numeric|min:0|max:5',
            'comentario' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Crear o actualizar review
        $review = Review::updateOrCreate(
            [
                'producto_id' => $productoId,
                'user_id' => $request->user()->id,
            ],
            [
                'calificacion' => $request->calificacion,
                'comentario' => $request->comentario,
            ]
        );

        // Actualizar calificación promedio del producto
        $this->actualizarCalificacionProducto($productoId);

        return response()->json([
            'message' => 'Review guardada exitosamente',
            'review' => $review,
        ], 201);
    }

    /**
     * Eliminar review
     */
    public function destroy(Request $request, $productoId)
    {
        $review = Review::where('producto_id', $productoId)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$review) {
            return response()->json(['message' => 'Review no encontrada'], 404);
        }

        $review->delete();

        // Actualizar calificación promedio del producto
        $this->actualizarCalificacionProducto($productoId);

        return response()->json([
            'message' => 'Review eliminada',
        ], 200);
    }

    /**
     * Actualizar calificación promedio del producto
     */
    private function actualizarCalificacionProducto($productoId)
    {
        $promedio = Review::where('producto_id', $productoId)->avg('calificacion');
        
        Producto::where('id', $productoId)->update([
            'calificacion' => $promedio ? round($promedio, 1) : 0,
        ]);
    }
}
