<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductoController extends Controller
{
    /**
     * Listar todos los productos (para consumidores)
     */
    public function index(Request $request)
    {
        $query = Producto::with('productor:id,name,apellido')->where('disponibles', '>', 0);

        // Filtrar por búsqueda
        if ($request->has('search')) {
            $query->where('nombre', 'like', '%' . $request->search . '%');
        }

        // Filtrar por categoría
        if ($request->has('categoria') && $request->categoria !== 'Todos') {
            $query->where('categoria', $request->categoria);
        }

        $productos = $query->get()->map(function ($producto) {
            return [
                'id' => $producto->id,
                'nombre' => $producto->nombre,
                'categoria' => $producto->categoria,
                'precio' => $producto->precio,
                'calificacion' => $producto->calificacion,
                'imagen' => $producto->imagen,
                'disponibles' => $producto->disponibles,
                'productor' => $producto->productor->name . ' ' . $producto->productor->apellido,
                'descripcion' => $producto->descripcion,
            ];
        });

        return response()->json([
            'productos' => $productos,
        ], 200);
    }

    /**
     * Obtener producto por ID
     */
    public function show($id)
    {
        $producto = Producto::with('productor:id,name,apellido,telefono')->find($id);

        if (!$producto) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        return response()->json([
            'producto' => [
                'id' => $producto->id,
                'nombre' => $producto->nombre,
                'categoria' => $producto->categoria,
                'precio' => $producto->precio,
                'calificacion' => $producto->calificacion,
                'imagen' => $producto->imagen,
                'disponibles' => $producto->disponibles,
                'descripcion' => $producto->descripcion,
                'productor' => [
                    'id' => $producto->productor->id,
                    'nombre' => $producto->productor->name . ' ' . $producto->productor->apellido,
                    'telefono' => $producto->productor->telefono,
                ],
            ],
        ], 200);
    }

    /**
     * Listar productos del productor autenticado
     */
    public function misProductos(Request $request)
    {
        $productos = Producto::where('user_id', $request->user()->id)->get();

        return response()->json([
            'productos' => $productos,
        ], 200);
    }

    /**
     * Crear producto (solo productores)
     */
    public function store(Request $request)
    {
        // Log para debugging
        \Log::info('=== CREAR PRODUCTO ===');
        \Log::info('Usuario:', ['id' => $request->user()->id, 'role' => $request->user()->role]);
        \Log::info('Datos recibidos:', $request->all());
        
        // Verificar que el usuario es productor
        if ($request->user()->role !== 'productor') {
            \Log::error('Usuario no es productor');
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:255',
            'categoria' => 'required|string',
            'precio' => 'required|numeric|min:0',
            'disponibles' => 'required|integer|min:0',
            'descripcion' => 'nullable|string',
            'imagen' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            \Log::error('Validación fallida:', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $producto = Producto::create([
                'nombre' => $request->nombre,
                'categoria' => $request->categoria,
                'precio' => $request->precio,
                'disponibles' => $request->disponibles,
                'descripcion' => $request->descripcion ?? '',
                'imagen' => $request->imagen ?? '📦',
                'calificacion' => 0,
                'user_id' => $request->user()->id,
            ]);
            
            \Log::info('Producto creado exitosamente:', ['id' => $producto->id]);

            return response()->json([
                'message' => 'Producto creado exitosamente',
                'producto' => $producto,
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Error al crear producto:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error al crear producto: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Actualizar producto
     */
    public function update(Request $request, $id)
    {
        $producto = Producto::find($id);

        if (!$producto) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        // Verificar que el usuario es el dueño del producto
        if ($producto->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $validator = Validator::make($request->all(), [
            'nombre' => 'sometimes|string|max:255',
            'categoria' => 'sometimes|string',
            'precio' => 'sometimes|numeric|min:0',
            'disponibles' => 'sometimes|integer|min:0',
            'descripcion' => 'nullable|string',
            'imagen' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $producto->update($request->only([
            'nombre', 'categoria', 'precio', 'disponibles', 'descripcion', 'imagen'
        ]));

        return response()->json([
            'message' => 'Producto actualizado exitosamente',
            'producto' => $producto,
        ], 200);
    }

    /**
     * Eliminar producto
     */
    public function destroy(Request $request, $id)
    {
        $producto = Producto::find($id);

        if (!$producto) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        // Verificar que el usuario es el dueño del producto
        if ($producto->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $producto->delete();

        return response()->json([
            'message' => 'Producto eliminado exitosamente',
        ], 200);
    }

    /**
     * Obtener categorías disponibles
     */
    public function categorias()
    {
        $categorias = ['Todos', 'Vegetales', 'Frutas', 'Lácteos', 'Granos'];

        return response()->json([
            'categorias' => $categorias,
        ], 200);
    }
}
