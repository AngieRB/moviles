<?php

namespace App\Http\Controllers;

use App\Models\Carrito;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CarritoController extends Controller
{
    /**
     * Obtener carrito del usuario autenticado
     */
    public function index(Request $request)
    {
        $items = Carrito::with('producto')
            ->where('user_id', $request->user()->id)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'producto_id' => $item->producto->id,
                    'nombre' => $item->producto->nombre,
                    'cantidad' => $item->cantidad,
                    'precio' => $item->producto->precio,
                    'imagen' => $item->producto->imagen,
                    'productor' => $item->producto->productor->nombre ?? 'Productor',
                    'disponibles' => $item->producto->disponibles,
                ];
            });

        $subtotal = $items->sum(function ($item) {
            return $item['precio'] * $item['cantidad'];
        });

        $envio = $subtotal > 20 ? 0 : 3.50;
        $total = $subtotal + $envio;

        return response()->json([
            'items' => $items,
            'subtotal' => $subtotal,
            'envio' => $envio,
            'total' => $total,
        ], 200);
    }

    /**
     * Agregar producto al carrito
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'producto_id' => 'required|exists:productos,id',
            'cantidad' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $producto = Producto::find($request->producto_id);

        // Verificar disponibilidad
        if ($producto->disponibles < $request->cantidad) {
            return response()->json([
                'message' => 'No hay suficiente stock disponible',
            ], 400);
        }

        // Verificar si el producto ya está en el carrito
        $carritoItem = Carrito::where('user_id', $request->user()->id)
            ->where('producto_id', $request->producto_id)
            ->first();

        if ($carritoItem) {
            // Actualizar cantidad
            $nuevaCantidad = $carritoItem->cantidad + $request->cantidad;
            
            if ($producto->disponibles < $nuevaCantidad) {
                return response()->json([
                    'message' => 'No hay suficiente stock disponible',
                ], 400);
            }

            $carritoItem->cantidad = $nuevaCantidad;
            $carritoItem->save();

            return response()->json([
                'message' => 'Cantidad actualizada en el carrito',
                'item' => $carritoItem,
            ], 200);
        }

        // Crear nuevo item en el carrito
        $carritoItem = Carrito::create([
            'user_id' => $request->user()->id,
            'producto_id' => $request->producto_id,
            'cantidad' => $request->cantidad,
        ]);

        return response()->json([
            'message' => 'Producto agregado al carrito',
            'item' => $carritoItem,
        ], 201);
    }

    /**
     * Actualizar cantidad de un item del carrito
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'cantidad' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $carritoItem = Carrito::find($id);

        if (!$carritoItem) {
            return response()->json(['message' => 'Item no encontrado'], 404);
        }

        // Verificar que el item pertenece al usuario
        if ($carritoItem->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        // Verificar disponibilidad
        if ($carritoItem->producto->disponibles < $request->cantidad) {
            return response()->json([
                'message' => 'No hay suficiente stock disponible',
            ], 400);
        }

        $carritoItem->cantidad = $request->cantidad;
        $carritoItem->save();

        return response()->json([
            'message' => 'Cantidad actualizada',
            'item' => $carritoItem,
        ], 200);
    }

    /**
     * Eliminar item del carrito
     */
    public function destroy(Request $request, $id)
    {
        $carritoItem = Carrito::find($id);

        if (!$carritoItem) {
            return response()->json(['message' => 'Item no encontrado'], 404);
        }

        // Verificar que el item pertenece al usuario
        if ($carritoItem->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $carritoItem->delete();

        return response()->json([
            'message' => 'Producto eliminado del carrito',
        ], 200);
    }

    /**
     * Vaciar carrito completo
     */
    public function clear(Request $request)
    {
        Carrito::where('user_id', $request->user()->id)->delete();

        return response()->json([
            'message' => 'Carrito vaciado',
        ], 200);
    }
}
