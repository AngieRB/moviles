<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use App\Models\PedidoItem;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PedidoController extends Controller
{
    /**
     * Listar pedidos del consumidor autenticado
     */
    public function misPedidos(Request $request)
    {
        $pedidos = Pedido::with(['items.producto'])
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($pedido) {
                return [
                    'id' => $pedido->id,
                    'estado' => $pedido->estado,
                    'total' => $pedido->total,
                    'fecha' => $pedido->created_at->format('Y-m-d H:i'),
                    'items' => $pedido->items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'producto' => $item->producto->nombre,
                            'cantidad' => $item->cantidad,
                            'precio' => $item->precio,
                            'subtotal' => $item->cantidad * $item->precio,
                        ];
                    }),
                ];
            });

        return response()->json([
            'pedidos' => $pedidos,
        ], 200);
    }

    /**
     * Obtener detalle de un pedido
     */
    public function show($id, Request $request)
    {
        $pedido = Pedido::with(['items.producto.productor'])->find($id);

        if (!$pedido) {
            return response()->json(['message' => 'Pedido no encontrado'], 404);
        }

        // Verificar que el pedido pertenece al usuario autenticado
        if ($pedido->user_id !== $request->user()->id && $request->user()->role !== 'administrador') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return response()->json([
            'pedido' => [
                'id' => $pedido->id,
                'estado' => $pedido->estado,
                'total' => $pedido->total,
                'fecha' => $pedido->created_at->format('Y-m-d H:i'),
                'direccion_envio' => $pedido->direccion_envio,
                'items' => $pedido->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'producto' => [
                            'id' => $item->producto->id,
                            'nombre' => $item->producto->nombre,
                            'imagen' => $item->producto->imagen,
                        ],
                        'productor' => $item->producto->productor->nombre . ' ' . $item->producto->productor->apellido,
                        'cantidad' => $item->cantidad,
                        'precio' => $item->precio,
                        'subtotal' => $item->cantidad * $item->precio,
                    ];
                }),
            ],
        ], 200);
    }

    /**
     * Crear un nuevo pedido desde el carrito
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.producto_id' => 'required|exists:productos,id',
            'items.*.cantidad' => 'required|integer|min:1',
            'direccion_envio' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();

        try {
            $total = 0;

            // Validar disponibilidad de productos
            foreach ($request->items as $item) {
                $producto = Producto::find($item['producto_id']);
                
                if ($producto->disponibles < $item['cantidad']) {
                    DB::rollBack();
                    return response()->json([
                        'message' => "No hay suficiente stock de {$producto->nombre}. Disponibles: {$producto->disponibles}",
                    ], 400);
                }

                $total += $producto->precio * $item['cantidad'];
            }

            // Calcular envío
            $envio = $total > 20 ? 0 : 3.50;
            $totalFinal = $total + $envio;

            // Crear pedido
            $pedido = Pedido::create([
                'user_id' => $request->user()->id,
                'estado' => 'pendiente',
                'total' => $totalFinal,
                'direccion_envio' => $request->direccion_envio ?? '',
            ]);

            // Crear items del pedido y actualizar stock
            foreach ($request->items as $item) {
                $producto = Producto::find($item['producto_id']);

                PedidoItem::create([
                    'pedido_id' => $pedido->id,
                    'producto_id' => $producto->id,
                    'cantidad' => $item['cantidad'],
                    'precio' => $producto->precio,
                ]);

                // Actualizar disponibilidad del producto
                $producto->disponibles -= $item['cantidad'];
                $producto->save();
            }

            DB::commit();

            return response()->json([
                'message' => 'Pedido creado exitosamente',
                'pedido' => [
                    'id' => $pedido->id,
                    'total' => $pedido->total,
                    'estado' => $pedido->estado,
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear el pedido',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Listar pedidos pendientes (para productores)
     */
    public function pedidosPendientes(Request $request)
    {
        // Verificar que el usuario es productor
        if ($request->user()->role !== 'productor') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        // Obtener pedidos que contienen productos del productor
        $pedidos = Pedido::with(['items.producto', 'user'])
            ->whereHas('items.producto', function ($query) use ($request) {
                $query->where('user_id', $request->user()->id);
            })
            ->where('estado', 'pendiente')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($pedido) use ($request) {
                return [
                    'id' => $pedido->id,
                    'cliente' => $pedido->user->nombre . ' ' . $pedido->user->apellido,
                    'telefono' => $pedido->user->telefono,
                    'fecha' => $pedido->created_at->format('Y-m-d H:i'),
                    'total' => $pedido->total,
                    'items' => $pedido->items->filter(function ($item) use ($request) {
                        return $item->producto->user_id === $request->user()->id;
                    })->map(function ($item) {
                        return [
                            'producto' => $item->producto->nombre,
                            'cantidad' => $item->cantidad,
                            'precio' => $item->precio,
                        ];
                    })->values(),
                ];
            });

        return response()->json([
            'pedidos' => $pedidos,
        ], 200);
    }

    /**
     * Listar TODOS los pedidos del productor (para estadísticas)
     */
    public function misPedidosProductor(Request $request)
    {
        // Verificar que el usuario es productor
        if ($request->user()->role !== 'productor') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        // Obtener pedidos que contienen productos del productor
        $pedidos = Pedido::with(['items.producto', 'user'])
            ->whereHas('items.producto', function ($query) use ($request) {
                $query->where('user_id', $request->user()->id);
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($pedido) use ($request) {
                return [
                    'id' => $pedido->id,
                    'cliente' => $pedido->user ? ($pedido->user->name . ' ' . $pedido->user->apellido) : 'N/A',
                    'cliente_id' => $pedido->user_id,
                    'fecha' => $pedido->created_at->format('Y-m-d H:i'),
                    'estado' => $pedido->estado,
                    'total' => $pedido->total,
                    'items_count' => $pedido->items->count(),
                ];
            });

        return response()->json([
            'pedidos' => $pedidos,
        ], 200);
    }

    /**
     * Actualizar estado de pedido
     */
    public function updateEstado(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'estado' => 'required|in:pendiente,procesando,enviado,entregado,cancelado',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $pedido = Pedido::find($id);

        if (!$pedido) {
            return response()->json(['message' => 'Pedido no encontrado'], 404);
        }

        $pedido->estado = $request->estado;
        $pedido->save();

        return response()->json([
            'message' => 'Estado del pedido actualizado',
            'pedido' => [
                'id' => $pedido->id,
                'estado' => $pedido->estado,
            ],
        ], 200);
    }

    /**
     * Obtener todos los pedidos (para admin)
     */
    public function todosPedidos(Request $request)
    {
        $pedidos = Pedido::with(['user', 'items.producto'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($pedido) {
                return [
                    'id' => $pedido->id,
                    'estado' => $pedido->estado,
                    'total' => $pedido->total,
                    'fecha' => $pedido->created_at->format('Y-m-d H:i'),
                    'cliente' => $pedido->user ? $pedido->user->name . ' ' . $pedido->user->apellido : 'N/A',
                    'items_count' => $pedido->items->count(),
                ];
            });

        return response()->json([
            'pedidos' => $pedidos,
        ], 200);
    }

    /**
     * Obtener estadísticas para admin
     */
    public function estadisticasAdmin(Request $request)
    {
        $totalPedidos = Pedido::count();
        $pedidosPendientes = Pedido::whereIn('estado', ['pendiente', 'procesando'])->count();
        $pedidosCompletados = Pedido::where('estado', 'entregado')->count();
        $ventasTotales = Pedido::sum('total');

        return response()->json([
            'estadisticas' => [
                'totalPedidos' => $totalPedidos,
                'pedidosPendientes' => $pedidosPendientes,
                'pedidosCompletados' => $pedidosCompletados,
                'ventasTotales' => floatval($ventasTotales),
            ],
        ], 200);
    }

    /**
     * Consumidor confirma la recepción del pedido
     */
    public function confirmarRecepcion(Request $request, $id)
    {
        $pedido = Pedido::find($id);

        if (!$pedido) {
            return response()->json(['message' => 'Pedido no encontrado'], 404);
        }

        // Verificar que el pedido pertenece al consumidor
        if ($pedido->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        // Solo se puede confirmar si el pedido está en estado "enviado"
        if (!in_array($pedido->estado, ['enviado', 'procesando'])) {
            return response()->json([
                'message' => 'El pedido no puede ser confirmado en su estado actual: ' . $pedido->estado
            ], 400);
        }

        $pedido->estado = 'entregado';
        $pedido->fecha_entrega = now();
        $pedido->save();

        return response()->json([
            'message' => 'Pedido confirmado como entregado',
            'pedido' => [
                'id' => $pedido->id,
                'estado' => $pedido->estado,
            ],
        ], 200);
    }
}
