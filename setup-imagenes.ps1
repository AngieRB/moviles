# Script para configurar el sistema de imágenes

Write-Host "=== Configurando Sistema de Imágenes ===" -ForegroundColor Green

# Navegar al directorio de Laravel
Set-Location "laravel-backend"

Write-Host "`n1. Ejecutando migraciones..." -ForegroundColor Yellow
php artisan migrate

Write-Host "`n2. Creando estructura de directorios..." -ForegroundColor Yellow

$directorios = @(
    "public/imagenes",
    "public/imagenes/consumidores",
    "public/imagenes/productores", 
    "public/imagenes/productos"
)

foreach ($dir in $directorios) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "   ✓ Creado: $dir" -ForegroundColor Green
    } else {
        Write-Host "   ✓ Ya existe: $dir" -ForegroundColor Cyan
    }
}

Write-Host "`n3. Configurando permisos..." -ForegroundColor Yellow
# En Windows no es necesario configurar permisos especiales
Write-Host "   ✓ Permisos configurados (Windows)" -ForegroundColor Green

Write-Host "`n=== Configuración Completada ===" -ForegroundColor Green
Write-Host "`nEstructura de directorios creada:" -ForegroundColor Cyan
Write-Host "  📁 public/imagenes/" -ForegroundColor White
Write-Host "    📂 consumidores/{cedula}/" -ForegroundColor White
Write-Host "    📂 productores/{cedula}/" -ForegroundColor White
Write-Host "    📂 productos/{producto_id}/" -ForegroundColor White

Write-Host "`nNuevas funcionalidades disponibles:" -ForegroundColor Cyan
Write-Host "  • Subir foto al registrarse (consumidor/productor)" -ForegroundColor White
Write-Host "  • Actualizar foto de perfil: POST /api/actualizar-foto-perfil" -ForegroundColor White
Write-Host "  • Subir imagen de producto: POST /api/productos (campo 'imagen')" -ForegroundColor White
Write-Host "  • Las imágenes se guardan organizadas por cédula/ID" -ForegroundColor White

Write-Host "`n¡Sistema listo para usar! 🚀" -ForegroundColor Green
