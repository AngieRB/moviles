<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Producto;
use Illuminate\Http\Request;

class ProveedorController extends Controller
{
    /**
     * Listar todos los proveedores verificados (para consumidores)
     */
    public function index(Request $request)
    {
        $query = User::where('role', 'productor')
            ->where('verificado', true);

        // Filtro de búsqueda
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                  ->orWhere('apellido', 'like', "%{$search}%");
            });
        }

        $proveedores = $query->get()->map(function ($proveedor) {
            // Contar productos disponibles
            $productosDisponibles = Producto::where('user_id', $proveedor->id)
                ->where('disponible', true)
                ->where('disponibles', '>', 0)
                ->count();

            return [
                'id' => $proveedor->id,
                'nombre' => $proveedor->nombre,
                'apellido' => $proveedor->apellido,
                'nombre_completo' => $proveedor->nombre . ' ' . $proveedor->apellido,
                'foto_perfil' => $proveedor->foto_perfil,
                'verificado' => $proveedor->verificado,
                'calificacion_promedio' => $this->calcularCalificacionProveedor($proveedor->id),
                'productos_disponibles' => $productosDisponibles,
                'ubicacion' => $proveedor->role_data['ubicacion_hacienda'] ?? 'No especificada',
            ];
        });

        return response()->json([
            'proveedores' => $proveedores,
        ], 200);
    }

    /**
     * Obtener perfil completo de un proveedor
     */
    public function show($id)
    {
        $proveedor = User::where('role', 'productor')
            ->where('id', $id)
            ->first();

        if (!$proveedor) {
            return response()->json(['message' => 'Proveedor no encontrado'], 404);
        }

        // Obtener productos disponibles
        $productos = Producto::where('user_id', $proveedor->id)
            ->where('disponible', true)
            ->where('disponibles', '>', 0)
            ->get()
            ->map(function ($producto) {
                return [
                    'id' => $producto->id,
                    'nombre' => $producto->nombre,
                    'categoria' => $producto->categoria,
                    'precio' => $producto->precio,
                    'imagen' => $producto->imagen,
                    'disponibles' => $producto->disponibles,
                    'calificacion' => $producto->calificacion,
                ];
            });

        // Calcular estadísticas
        $calificacionPromedio = $this->calcularCalificacionProveedor($proveedor->id);
        $totalProductos = $productos->count();
        $totalVentas = \App\Models\Pedido::whereHas('items', function($q) use ($proveedor) {
            $q->whereHas('producto', function($q2) use ($proveedor) {
                $q2->where('user_id', $proveedor->id);
            });
        })->where('estado', 'entregado')->count();

        return response()->json([
            'proveedor' => [
                'id' => $proveedor->id,
                'nombre' => $proveedor->nombre,
                'apellido' => $proveedor->apellido,
                'nombre_completo' => $proveedor->nombre . ' ' . $proveedor->apellido,
                'email' => $proveedor->email,
                'telefono' => $proveedor->telefono,
                'cedula' => $proveedor->cedula,
                'foto_perfil' => $proveedor->foto_perfil,
                'verificado' => $proveedor->verificado,
                'fecha_verificacion' => $proveedor->role_data['fecha_verificacion'] ?? null,
                
                // Información de la hacienda
                'ubicacion_hacienda' => $proveedor->role_data['ubicacion_hacienda'] ?? 'No especificada',
                'nombre_hacienda' => $proveedor->role_data['nombre_hacienda'] ?? null,
                'descripcion_hacienda' => $proveedor->role_data['descripcion_hacienda'] ?? null,
                'hectareas' => $proveedor->role_data['hectareas'] ?? null,
                'tipo_cultivo' => $proveedor->role_data['tipo_cultivo'] ?? [],
                
                // Estadísticas
                'calificacion_promedio' => $calificacionPromedio,
                'total_productos' => $totalProductos,
                'total_ventas' => $totalVentas,
                'miembro_desde' => $proveedor->created_at->format('Y-m-d'),
                
                // Productos
                'productos' => $productos,
            ],
        ], 200);
    }

    /**
     * Calcular calificación promedio del proveedor
     */
    private function calcularCalificacionProveedor($proveedorId)
    {
        $productos = Producto::where('user_id', $proveedorId)->get();
        
        if ($productos->isEmpty()) {
            return 0;
        }

        $calificacionPromedio = $productos->avg('calificacion');

        return round($calificacionPromedio ?? 4.5, 1);
    }

    /**
     * Obtener productos de un proveedor (para consumidores)
     */
    public function productos($id)
    {
        $productos = Producto::where('user_id', $id)
            ->where('disponible', true)
            ->where('disponibles', '>', 0)
            ->with('productor:id,nombre,apellido')
            ->get()
            ->map(function ($producto) {
                return [
                    'id' => $producto->id,
                    'nombre' => $producto->nombre,
                    'categoria' => $producto->categoria,
                    'precio' => $producto->precio,
                    'imagen' => $producto->imagen,
                    'disponibles' => $producto->disponibles,
                    'calificacion' => $producto->calificacion,
                    'descripcion' => $producto->descripcion,
                    'productor' => $producto->productor->nombre . ' ' . $producto->productor->apellido,
                ];
            });

        return response()->json([
            'productos' => $productos,
        ], 200);
    }
}
