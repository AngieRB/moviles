<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageService
{
    /**
     * Estructura de directorios:
     * - public/imagenes/consumidores/{cedula}/
     * - public/imagenes/productores/{cedula}/
     * - public/imagenes/productos/{producto_id}/
     */

    /**
     * Guardar foto de perfil de usuario (consumidor o productor)
     * 
     * @param UploadedFile $imagen
     * @param string $cedula
     * @param string $role (consumidor|productor)
     * @return string|null Ruta relativa de la imagen guardada
     */
    public static function guardarFotoUsuario(UploadedFile $imagen, string $cedula, string $role): ?string
    {
        try {
            // Validar que el rol sea válido
            if (!in_array($role, ['consumidor', 'productor'])) {
                return null;
            }

            // Pluralizar el rol para el directorio
            $directorioBase = $role === 'consumidor' ? 'consumidores' : 'productores';
            
            // Crear el directorio si no existe
            $directorio = "imagenes/{$directorioBase}/{$cedula}";
            $rutaCompleta = public_path($directorio);
            
            if (!file_exists($rutaCompleta)) {
                mkdir($rutaCompleta, 0755, true);
            }

            // Eliminar foto anterior si existe
            self::eliminarFotosAnteriores($rutaCompleta);

            // Generar nombre único para la imagen
            $extension = $imagen->getClientOriginalExtension();
            $nombreArchivo = "perfil_{$cedula}_" . time() . ".{$extension}";
            
            // Mover la imagen al directorio
            $imagen->move($rutaCompleta, $nombreArchivo);

            // Retornar la ruta relativa para guardar en BD
            return "imagenes/{$directorioBase}/{$cedula}/{$nombreArchivo}";
        } catch (\Exception $e) {
            \Log::error("Error guardando foto de usuario: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Guardar imagen de producto
     * 
     * @param UploadedFile $imagen
     * @param int $productoId
     * @param string $nombreProducto (opcional, para nombre descriptivo)
     * @return string|null Ruta relativa de la imagen guardada
     */
    public static function guardarImagenProducto(UploadedFile $imagen, int $productoId, string $nombreProducto = ''): ?string
    {
        try {
            // Crear el directorio si no existe
            $directorio = "imagenes/productos/{$productoId}";
            $rutaCompleta = public_path($directorio);
            
            if (!file_exists($rutaCompleta)) {
                mkdir($rutaCompleta, 0755, true);
            }

            // Eliminar imágenes anteriores del producto
            self::eliminarFotosAnteriores($rutaCompleta);

            // Generar nombre único para la imagen
            $extension = $imagen->getClientOriginalExtension();
            $slug = Str::slug($nombreProducto ?: 'producto');
            $nombreArchivo = "{$slug}_{$productoId}_" . time() . ".{$extension}";
            
            // Mover la imagen al directorio
            $imagen->move($rutaCompleta, $nombreArchivo);

            // Retornar la ruta relativa para guardar en BD
            return "imagenes/productos/{$productoId}/{$nombreArchivo}";
        } catch (\Exception $e) {
            \Log::error("Error guardando imagen de producto: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Eliminar foto de usuario
     * 
     * @param string|null $rutaFoto
     * @return bool
     */
    public static function eliminarFotoUsuario(?string $rutaFoto): bool
    {
        if (!$rutaFoto) {
            return false;
        }

        try {
            $rutaCompleta = public_path($rutaFoto);
            if (file_exists($rutaCompleta)) {
                unlink($rutaCompleta);
                return true;
            }
            return false;
        } catch (\Exception $e) {
            \Log::error("Error eliminando foto de usuario: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Eliminar imagen de producto
     * 
     * @param string|null $rutaImagen
     * @return bool
     */
    public static function eliminarImagenProducto(?string $rutaImagen): bool
    {
        return self::eliminarFotoUsuario($rutaImagen);
    }

    /**
     * Obtener URL completa de una imagen
     * 
     * @param string|null $rutaRelativa
     * @return string|null
     */
    public static function obtenerUrlCompleta(?string $rutaRelativa): ?string
    {
        if (!$rutaRelativa) {
            return null;
        }

        // Si ya es una URL completa, retornarla
        if (Str::startsWith($rutaRelativa, ['http://', 'https://'])) {
            return $rutaRelativa;
        }

        // Construir URL completa
        return url($rutaRelativa);
    }

    /**
     * Validar que el archivo sea una imagen válida
     * 
     * @param UploadedFile $archivo
     * @return bool
     */
    public static function validarImagen(UploadedFile $archivo): bool
    {
        $extensionesPermitidas = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        $extension = strtolower($archivo->getClientOriginalExtension());
        
        // Validar extensión
        if (!in_array($extension, $extensionesPermitidas)) {
            return false;
        }

        // Validar tamaño (máximo 5MB)
        $tamañoMaximo = 5 * 1024 * 1024; // 5MB en bytes
        if ($archivo->getSize() > $tamañoMaximo) {
            return false;
        }

        // Validar que sea realmente una imagen
        $imagenInfo = @getimagesize($archivo->getPathname());
        if ($imagenInfo === false) {
            return false;
        }

        return true;
    }

    /**
     * Eliminar todas las fotos anteriores de un directorio
     * 
     * @param string $directorio
     * @return void
     */
    private static function eliminarFotosAnteriores(string $directorio): void
    {
        if (!is_dir($directorio)) {
            return;
        }

        $archivos = glob($directorio . '/*');
        foreach ($archivos as $archivo) {
            if (is_file($archivo)) {
                unlink($archivo);
            }
        }
    }

    /**
     * Crear la estructura de directorios necesaria
     * 
     * @return void
     */
    public static function crearEstructuraDirectorios(): void
    {
        $directorios = [
            'imagenes/consumidores',
            'imagenes/productores',
            'imagenes/productos',
        ];

        foreach ($directorios as $directorio) {
            $ruta = public_path($directorio);
            if (!file_exists($ruta)) {
                mkdir($ruta, 0755, true);
            }
        }
    }
}
