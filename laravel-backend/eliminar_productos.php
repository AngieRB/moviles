<?php

use Illuminate\Support\Facades\DB;

// Eliminar todos los productos
$count = DB::table('productos')->count();
echo "Productos encontrados: {$count}\n";

if ($count > 0) {
    DB::table('productos')->truncate();
    echo "✓ Todos los productos han sido eliminados.\n";
    echo "✓ La tabla productos está ahora vacía.\n";
} else {
    echo "No hay productos para eliminar.\n";
}
