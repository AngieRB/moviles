<?php

use Illuminate\Support\Facades\DB;

// Ver productos actuales
$productos = DB::table('productos')->get();
echo "Total de productos: " . $productos->count() . "\n\n";

if ($productos->count() > 0) {
    echo "Productos encontrados:\n";
    foreach ($productos as $producto) {
        echo "ID: {$producto->id} - {$producto->nombre} - Precio: \${$producto->precio} - User: {$producto->user_id}\n";
    }
    
    echo "\n¿Eliminar todos los productos? (esto eliminará todos los datos de la tabla productos)\n";
    
    // Descomentar la siguiente línea para eliminar TODOS los productos
    // DB::table('productos')->truncate();
    // echo "Todos los productos han sido eliminados.\n";
} else {
    echo "No hay productos en la base de datos.\n";
}
