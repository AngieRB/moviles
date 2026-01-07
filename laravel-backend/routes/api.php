<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\PedidoController;
use App\Http\Controllers\CarritoController;

// ============================================
// RUTAS PÚBLICAS (Sin autenticación)
// ============================================

// Autenticación
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register/consumidor', [AuthController::class, 'registerConsumidor']);
Route::post('/register/productor', [AuthController::class, 'registerProductor']);

// Productos públicos (para ver el catálogo sin login)
Route::get('/productos', [ProductoController::class, 'index']);
Route::get('/productos/{id}', [ProductoController::class, 'show']);
Route::get('/categorias', [ProductoController::class, 'categorias']);

// ============================================
// RUTAS PROTEGIDAS (Requieren autenticación)
// ============================================

Route::middleware('auth:sanctum')->group(function () {

    // Usuario autenticado
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // ============================================
    // PRODUCTOS
    // ============================================

    // Listar productos del productor autenticado
    Route::get('/mis-productos', [ProductoController::class, 'misProductos']);

    // CRUD de productos (solo productores)
    Route::post('/productos', [ProductoController::class, 'store']);
    Route::put('/productos/{id}', [ProductoController::class, 'update']);
    Route::delete('/productos/{id}', [ProductoController::class, 'destroy']);

    // ============================================
    // CARRITO (solo consumidores)
    // ============================================

    Route::get('/carrito', [CarritoController::class, 'index']);
    Route::post('/carrito', [CarritoController::class, 'store']);
    Route::put('/carrito/{id}', [CarritoController::class, 'update']);
    Route::delete('/carrito/{id}', [CarritoController::class, 'destroy']);
    Route::delete('/carrito', [CarritoController::class, 'clear']);

    // ============================================
    // PEDIDOS
    // ============================================

    // Consumidores
    Route::get('/mis-pedidos', [PedidoController::class, 'misPedidos']);
    Route::get('/pedidos/{id}', [PedidoController::class, 'show']);
    Route::post('/pedidos', [PedidoController::class, 'store']);

    // Productores
    Route::get('/pedidos-pendientes', [PedidoController::class, 'pedidosPendientes']);
    Route::put('/pedidos/{id}/estado', [PedidoController::class, 'updateEstado']);
});
