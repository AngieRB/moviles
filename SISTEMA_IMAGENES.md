# 📸 Sistema de Gestión de Imágenes - AgroConnect

## 🎯 Descripción General

Sistema completo para gestión de imágenes de usuarios y productos, organizado por cédula e ID con almacenamiento estructurado en el servidor.

## 📁 Estructura de Directorios

```
public/
└── imagenes/
    ├── consumidores/
    │   └── {cedula}/
    │       └── perfil_{cedula}_{timestamp}.jpg
    ├── productores/
    │   └── {cedula}/
    │       └── perfil_{cedula}_{timestamp}.jpg
    └── productos/
        └── {producto_id}/
            └── {nombre-producto}_{producto_id}_{timestamp}.jpg
```

### Ejemplo Real:
```
public/imagenes/
├── consumidores/
│   ├── 1234567890/
│   │   └── perfil_1234567890_1737945600.jpg
│   └── 0987654321/
│       └── perfil_0987654321_1737945700.jpg
├── productores/
│   ├── 1122334455/
│   │   └── perfil_1122334455_1737945800.jpg
│   └── 5544332211/
│       └── perfil_5544332211_1737945900.jpg
└── productos/
    ├── 1/
    │   └── tomate-rojo_1_1737946000.jpg
    ├── 2/
    │   └── lechuga-organica_2_1737946100.jpg
    └── 3/
        └── zanahoria-fresca_3_1737946200.jpg
```

## 🚀 Instalación y Configuración

### 1. Ejecutar Setup Automático

```powershell
# Ejecutar desde la raíz del proyecto
.\setup-imagenes.ps1
```

Este script:
- ✅ Ejecuta las migraciones de BD
- ✅ Crea la estructura de directorios
- ✅ Configura permisos necesarios

### 2. Setup Manual (Alternativo)

```bash
# 1. Ejecutar migraciones
cd laravel-backend
php artisan migrate

# 2. Crear directorios
mkdir -p public/imagenes/{consumidores,productores,productos}

# 3. Configurar permisos (Linux/Mac)
chmod -R 755 public/imagenes
```

## 📋 Base de Datos

### Tabla: `users`
```sql
ALTER TABLE users ADD COLUMN foto_perfil VARCHAR(255) NULL 
COMMENT 'Ruta de la foto de perfil guardada por cédula';
```

### Tabla: `productos`
```sql
-- El campo 'imagen' ya existe, actualizado para almacenar rutas
imagen VARCHAR(255) NULL COMMENT 'Ruta de la imagen del producto'
```

## 🔧 API Endpoints

### 📸 Foto de Perfil de Usuarios

#### 1. Registro con Foto (Consumidor)
```http
POST /api/register-consumidor
Content-Type: multipart/form-data

Campos:
- name: string (requerido)
- apellido: string (requerido)
- cedula: string (10 dígitos, requerido)
- telefono: string (10 dígitos, requerido)
- email: string (requerido)
- password: string (min 8 chars, requerido)
- foto_perfil: file (opcional, max 5MB, jpg|png|gif|webp)
```

**Respuesta exitosa:**
```json
{
  "message": "¡Cuenta de consumidor creada exitosamente!",
  "user": {
    "id": 1,
    "name": "Juan",
    "apellido": "Pérez",
    "email": "juan@email.com",
    "telefono": "0987654321",
    "role": "consumidor",
    "foto_perfil": "imagenes/consumidores/1234567890/perfil_1234567890_1737945600.jpg"
  },
  "token": "..."
}
```

#### 2. Registro con Foto (Productor)
```http
POST /api/register-productor
Content-Type: multipart/form-data

Campos:
- name: string (requerido)
- cedula: string (requerido)
- telefono: string (requerido)
- email: string (requerido)
- password: string (requerido)
- password_confirmation: string (requerido)
- nombreFinca: string (requerido)
- tipoCultivos: array (requerido)
- foto_perfil: file (opcional, max 5MB)
- ... (otros campos de productor)
```

#### 3. Actualizar Foto de Perfil
```http
POST /api/actualizar-foto-perfil
Authorization: Bearer {token}
Content-Type: multipart/form-data

Campos:
- foto_perfil: file (requerido, max 5MB, jpg|png|gif|webp)
```

**Respuesta exitosa:**
```json
{
  "message": "Foto de perfil actualizada exitosamente",
  "foto_perfil": "http://localhost:8000/imagenes/consumidores/1234567890/perfil_1234567890_1737945600.jpg"
}
```

### 🍎 Imágenes de Productos

#### 1. Crear Producto con Imagen
```http
POST /api/productos
Authorization: Bearer {token}
Content-Type: multipart/form-data

Campos:
- nombre: string (requerido)
- categoria: string (requerido)
- precio: number (requerido)
- disponibles: integer (requerido)
- descripcion: string (opcional)
- imagen: file (opcional, max 5MB, jpg|png|gif|webp)
```

**Respuesta exitosa:**
```json
{
  "message": "Producto creado exitosamente",
  "producto": {
    "id": 1,
    "nombre": "Tomate Rojo",
    "categoria": "Verduras",
    "precio": "2.50",
    "disponibles": 100,
    "descripcion": "Tomates frescos y orgánicos",
    "imagen": "imagenes/productos/1/tomate-rojo_1_1737946000.jpg",
    "user_id": 2
  }
}
```

#### 2. Actualizar Producto (con nueva imagen)
```http
PUT /api/productos/{id}
Authorization: Bearer {token}
Content-Type: multipart/form-data

Campos:
- nombre: string (opcional)
- categoria: string (opcional)
- precio: number (opcional)
- disponibles: integer (opcional)
- descripcion: string (opcional)
- imagen: file (opcional, max 5MB) // La anterior se elimina automáticamente
```

#### 3. Eliminar Producto
```http
DELETE /api/productos/{id}
Authorization: Bearer {token}
```
**Nota:** Al eliminar un producto, su imagen también se elimina automáticamente.

## 💻 Código - Ejemplos de Uso

### Frontend - React Native

#### Subir Foto de Perfil al Registrarse
```javascript
import * as ImagePicker from 'expo-image-picker';

const registrarConFoto = async () => {
  // Seleccionar imagen
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled) {
    const formData = new FormData();
    formData.append('name', 'Juan');
    formData.append('apellido', 'Pérez');
    formData.append('cedula', '1234567890');
    formData.append('telefono', '0987654321');
    formData.append('email', 'juan@email.com');
    formData.append('password', 'password123');
    
    // Agregar imagen
    formData.append('foto_perfil', {
      uri: result.assets[0].uri,
      type: 'image/jpeg',
      name: 'perfil.jpg',
    });

    const response = await apiClient.post('/register-consumidor', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    console.log('Usuario registrado:', response.data);
  }
};
```

#### Actualizar Foto de Perfil
```javascript
const actualizarFotoPerfil = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled) {
    const formData = new FormData();
    formData.append('foto_perfil', {
      uri: result.assets[0].uri,
      type: 'image/jpeg',
      name: 'perfil.jpg',
    });

    try {
      const response = await apiClient.post('/actualizar-foto-perfil', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      Alert.alert('Éxito', response.data.message);
      console.log('Nueva foto:', response.data.foto_perfil);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la foto');
    }
  }
};
```

#### Crear Producto con Imagen
```javascript
const crearProductoConImagen = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.canceled) {
    const formData = new FormData();
    formData.append('nombre', 'Tomate Rojo');
    formData.append('categoria', 'Verduras');
    formData.append('precio', '2.50');
    formData.append('disponibles', '100');
    formData.append('descripcion', 'Tomates frescos');
    
    formData.append('imagen', {
      uri: result.assets[0].uri,
      type: 'image/jpeg',
      name: 'producto.jpg',
    });

    const response = await apiClient.post('/productos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    console.log('Producto creado:', response.data);
  }
};
```

#### Mostrar Imagen en la App
```javascript
import { Image } from 'react-native';

// Opción 1: URL completa desde la respuesta
<Image 
  source={{ uri: usuario.foto_perfil }} 
  style={{ width: 100, height: 100, borderRadius: 50 }}
/>

// Opción 2: Construir URL
const API_BASE_URL = 'http://192.168.1.100:8000';
<Image 
  source={{ uri: `${API_BASE_URL}/${producto.imagen}` }} 
  style={{ width: 200, height: 150 }}
/>

// Opción 3: Con placeholder si no hay imagen
<Image 
  source={producto.imagen ? { uri: producto.imagen } : require('./assets/placeholder.png')}
  style={{ width: 200, height: 150 }}
/>
```

## 🛡️ Validaciones y Seguridad

### Validaciones Implementadas

1. **Tipo de archivo**: Solo imágenes (jpg, jpeg, png, gif, webp)
2. **Tamaño máximo**: 5MB por archivo
3. **Validación de imagen real**: Verifica que sea una imagen válida
4. **Nombres únicos**: Timestamp para evitar colisiones
5. **Organización por usuario**: Cada usuario tiene su directorio

### Seguridad

- ✅ Solo el propietario puede actualizar/eliminar sus imágenes
- ✅ Validación de autenticación con Sanctum
- ✅ Las imágenes se eliminan al borrar usuario/producto
- ✅ Los directorios se crean con permisos seguros (755)

## 🔍 Troubleshooting

### Problema: "Error al guardar imagen"

**Solución:**
```bash
# Verificar permisos
ls -la public/imagenes/

# Si hay problemas de permisos (Linux/Mac)
chmod -R 755 public/imagenes
chown -R www-data:www-data public/imagenes

# En Windows, verificar que el usuario tenga permisos de escritura
```

### Problema: "Imagen no se muestra en la app"

**Solución:**
```javascript
// Verificar la URL completa
console.log('URL de imagen:', producto.imagen);

// Asegurarse de usar la IP correcta del servidor
const API_BASE_URL = 'http://192.168.1.100:8000'; // Cambiar por tu IP

// Verificar que el archivo existe en el servidor
```

### Problema: "File too large"

**Solución:**
```php
// Aumentar límite en php.ini (si es necesario)
upload_max_filesize = 10M
post_max_size = 10M

// Reiniciar servidor después de cambios
```

## 📊 Estadísticas y Monitoreo

### Verificar Uso de Espacio
```bash
# Ver tamaño total de imágenes
du -sh public/imagenes/*

# Listar archivos por tamaño
find public/imagenes -type f -exec ls -lh {} \; | sort -k 5 -h
```

### Limpiar Imágenes Huérfanas
```php
// Crear comando Artisan para limpieza
php artisan make:command CleanOrphanImages

// Implementar lógica para:
// 1. Buscar imágenes sin usuario/producto asociado
// 2. Eliminar directorios vacíos
// 3. Comprimir imágenes antiguas
```

## 📝 Notas Importantes

1. **Respaldo**: Incluir `public/imagenes/` en los respaldos del sistema
2. **CDN**: Para producción, considerar usar S3/Cloudinary para almacenamiento
3. **Optimización**: Implementar compresión automática de imágenes
4. **Cache**: Configurar headers de cache para las imágenes estáticas

## 🎓 Mejoras Futuras

- [ ] Redimensionamiento automático de imágenes
- [ ] Generación de thumbnails
- [ ] Soporte para múltiples imágenes por producto
- [ ] Galería de imágenes del usuario
- [ ] Compresión automática con TinyPNG
- [ ] Integración con CDN (Cloudinary, AWS S3)
- [ ] Watermark automático para protección

---

**Última actualización**: 27 de Enero, 2026
**Versión**: 1.0.0
**Autor**: Sistema AgroConnect
