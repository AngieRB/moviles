<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductoController extends Controller
{
    /**
     * Listar todos los productos (para consumidores)
     * Solo muestra productos disponibles
     */
    public function index(Request $request)
    {
        $query = Producto::with('productor:id,name,apellido')
            ->where('disponibles', '>', 0);

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
                'disponible' => $producto->disponible,
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
                'disponible' => $producto->disponible,
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
     * Muestra TODOS los productos (disponibles y ocultos)
     */
    public function misProductos(Request $request)
    {
        $productos = Producto::where('user_id', $request->user()->id)
            ->orderBy('disponible', 'desc') // Primero los disponibles
            ->orderBy('created_at', 'desc')
            ->get();

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
            'imagen' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        if ($validator->fails()) {
            \Log::error('Validación fallida:', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Crear el producto primero para obtener el ID
            $producto = Producto::create([
                'nombre' => $request->nombre,
                'categoria' => $request->categoria,
                'precio' => $request->precio,
                'disponibles' => $request->disponibles,
                'descripcion' => $request->descripcion ?? '',
                'imagen' => '📦', // Temporal
                'calificacion' => 0,
                'user_id' => $request->user()->id,
            ]);
            
            // Procesar imagen si existe
            if ($request->hasFile('imagen')) {
                $imagen = $request->file('imagen');
                if (ImageService::validarImagen($imagen)) {
                    $rutaImagen = ImageService::guardarImagenProducto($imagen, $producto->id, $request->nombre);
                    if ($rutaImagen) {
                        $producto->imagen = $rutaImagen;
                        $producto->save();
                    }
                }
            }
            
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
            'imagen' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Actualizar campos básicos
        $producto->fill($request->only([
            'nombre', 'categoria', 'precio', 'disponibles', 'descripcion'
        ]));

        // Procesar nueva imagen si existe
        if ($request->hasFile('imagen')) {
            $imagen = $request->file('imagen');
            if (ImageService::validarImagen($imagen)) {
                // Eliminar imagen anterior
                if ($producto->imagen && !str_starts_with($producto->imagen, 'http')) {
                    ImageService::eliminarImagenProducto($producto->imagen);
                }
                
                // Guardar nueva imagen
                $rutaImagen = ImageService::guardarImagenProducto($imagen, $producto->id, $producto->nombre);
                if ($rutaImagen) {
                    $producto->imagen = $rutaImagen;
                }
            }
        }

        $producto->save();

        return response()->json([
            'message' => 'Producto actualizado exitosamente',
            'producto' => $producto,
        ], 200);
    }

    /**
     * Ocultar producto (no lo elimina, solo lo hace invisible)
     * Útil para productos fuera de temporada
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

        // En lugar de eliminar, ocultar el producto
        $producto->disponible = false;
        $producto->save();

        return response()->json([
            'message' => 'Producto ocultado exitosamente. Podrás mostrarlo nuevamente cuando esté en temporada.',
            'producto' => $producto
        ], 200);
    }

    /**
     * Cambiar disponibilidad del producto (mostrar/ocultar)
     */
    public function toggleDisponibilidad(Request $request, $id)
    {
        $producto = Producto::find($id);

        if (!$producto) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        // Verificar que el usuario es el dueño del producto
        if ($producto->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        // Cambiar disponibilidad
        $producto->disponible = !$producto->disponible;
        $producto->save();

        $mensaje = $producto->disponible 
            ? 'Producto mostrado. Ahora es visible para los consumidores.'
            : 'Producto ocultado. Ya no es visible para los consumidores.';

        return response()->json([
            'message' => $mensaje,
            'producto' => $producto
        ], 200);
    }

    /**
     * Eliminar producto permanentemente (solo si está oculto)
     */
    public function eliminarPermanente(Request $request, $id)
    {
        $producto = Producto::find($id);

        if (!$producto) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        // Verificar que el usuario es el dueño del producto
        if ($producto->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        // Solo permitir eliminar si está oculto
        if ($producto->disponible) {
            return response()->json([
                'message' => 'Debes ocultar el producto antes de eliminarlo permanentemente'
            ], 400);
        }

        // Eliminar imagen del producto si existe
        if ($producto->imagen && !str_starts_with($producto->imagen, 'http')) {
            ImageService::eliminarImagenProducto($producto->imagen);
        }

        $producto->delete();

        return response()->json([
            'message' => 'Producto eliminado permanentemente',
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
