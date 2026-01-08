# API Routes - AgroConnect Backend

## 📋 Resumen
Backend Laravel para la aplicación móvil AgroConnect. Proporciona APIs RESTful para gestión de usuarios (Productores, Consumidores, Administradores), productos, carritos y pedidos.

**Base URL:** `http://tu-servidor.com/api`

---

## 🔓 RUTAS PÚBLICAS (Sin autenticación)

### Autenticación

#### Login
```http
POST /api/login
```
**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "password123",
  "role": "productor" // productor | consumidor | administrador
}
```
**Response:**
```json
{
  "message": "Login exitoso",
  "user": {
    "id": 1,
    "nombre": "Juan",
    "apellido": "García",
    "email": "juan@example.com",
    "telefono": "+1234567890",
    "role": "productor",
    "roleData": {...}
  },
  "token": "1|abc123..."
}
```

#### Registro Consumidor
```http
POST /api/register/consumidor
```
**Body:**
```json
{
  "nombre": "María López",
  "cedula": "1234567890",
  "telefono": "+1234567890",
  "email": "maria@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

#### Registro Productor
```http
POST /api/register/productor
```
**Body:**
```json
{
  "nombre": "Juan García",
  "cedula": "0987654321",
  "telefono": "+1234567890",
  "email": "juan@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "nombreFinca": "Finca El Paraíso",
  "ubicacionGPS": "4.7110, -74.0721",
  "tipoCultivos": ["Maíz", "Café", "Tomate"],
  "experiencia": "5 años",
  "areaCultivo": "10 hectáreas",
  "fotoCedula": "base64_string_o_url",
  "fotoFinca": "base64_string_o_url"
}
```

### Productos (Vista pública)

#### Listar productos
```http
GET /api/productos?search=tomate&categoria=Vegetales
```
**Response:**
```json
{
  "productos": [
    {
      "id": 1,
      "nombre": "Tomates Frescos",
      "categoria": "Vegetales",
      "precio": 2.50,
      "calificacion": 4.5,
      "imagen": "🍅",
      "disponibles": 50,
      "productor": "Juan García",
      "descripcion": "Tomates orgánicos..."
    }
  ]
}
```

#### Ver detalle de producto
```http
GET /api/productos/{id}
```

#### Obtener categorías
```http
GET /api/categorias
```

---

## 🔐 RUTAS PROTEGIDAS (Requieren token)

**Header requerido:**
```
Authorization: Bearer {token}
```

### Usuario

#### Obtener datos del usuario autenticado
```http
GET /api/me
```

#### Logout
```http
POST /api/logout
```

---

### 🛍️ PRODUCTOS

#### Mis productos (Productor)
```http
GET /api/mis-productos
```

#### Crear producto (Solo productores)
```http
POST /api/productos
```
**Body:**
```json
{
  "nombre": "Lechugas Orgánicas",
  "categoria": "Vegetales",
  "precio": 1.80,
  "disponibles": 30,
  "descripcion": "Lechugas frescas...",
  "imagen": "url_o_base64"
}
```

#### Actualizar producto
```http
PUT /api/productos/{id}
```
**Body:** (campos a actualizar)
```json
{
  "precio": 2.00,
  "disponibles": 25
}
```

#### Eliminar producto
```http
DELETE /api/productos/{id}
```

---

### 🛒 CARRITO (Solo consumidores)

#### Ver carrito
```http
GET /api/carrito
```
**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "producto_id": 5,
      "nombre": "Tomates Frescos",
      "cantidad": 2,
      "precio": 2.50,
      "imagen": "🍅",
      "productor": "Juan García",
      "disponibles": 50
    }
  ],
  "subtotal": 5.00,
  "envio": 3.50,
  "total": 8.50
}
```

#### Agregar al carrito
```http
POST /api/carrito
```
**Body:**
```json
{
  "producto_id": 5,
  "cantidad": 2
}
```

#### Actualizar cantidad
```http
PUT /api/carrito/{id}
```
**Body:**
```json
{
  "cantidad": 3
}
```

#### Eliminar item
```http
DELETE /api/carrito/{id}
```

#### Vaciar carrito
```http
DELETE /api/carrito
```

---

### 📦 PEDIDOS

#### Mis pedidos (Consumidor)
```http
GET /api/mis-pedidos
```
**Response:**
```json
{
  "pedidos": [
    {
      "id": 1,
      "estado": "pendiente",
      "total": 8.50,
      "fecha": "2026-01-06 10:30",
      "items": [...]
    }
  ]
}
```

#### Ver detalle de pedido
```http
GET /api/pedidos/{id}
```

#### Crear pedido desde carrito
```http
POST /api/pedidos
```
**Body:**
```json
{
  "items": [
    {
      "producto_id": 5,
      "cantidad": 2
    },
    {
      "producto_id": 3,
      "cantidad": 1
    }
  ],
  "direccion_envio": "Calle 123 #45-67, Bogotá"
}
```

#### Pedidos pendientes (Productor)
```http
GET /api/pedidos-pendientes
```
Muestra pedidos que contienen productos del productor autenticado.

#### Actualizar estado de pedido
```http
PUT /api/pedidos/{id}/estado
```
**Body:**
```json
{
  "estado": "procesando" // pendiente | procesando | enviado | entregado | cancelado
}
```

---

## � CHAT

#### Listar chats del usuario
```http
GET /api/chats
```
**Response:**
```json
{
  "chats": [
    {
      "id": 1,
      "otro_usuario": {
        "id": 5,
        "nombre": "Juan García",
        "role": "productor"
      },
      "ultimo_mensaje": "Hola, está disponible?",
      "ultimo_mensaje_at": "2026-01-06 14:30"
    }
  ]
}
```

#### Crear o obtener chat con otro usuario
```http
POST /api/chats
```
**Body:**
```json
{
  "otro_usuario_id": 5
}
```

#### Ver mensajes de un chat
```http
GET /api/chats/{chatId}/mensajes
```
**Response:**
```json
{
  "mensajes": [
    {
      "id": 1,
      "mensaje": "Hola, buenos días",
      "user_id": 5,
      "es_mio": false,
      "remitente": "Juan García",
      "leido": true,
      "created_at": "2026-01-06 10:00"
    }
  ]
}
```

#### Enviar mensaje
```http
POST /api/chats/{chatId}/mensajes
```
**Body:**
```json
{
  "mensaje": "Hola, está disponible el producto?"
}
```

---

## ⭐ REVIEWS / CALIFICACIONES

#### Ver reviews de un producto
```http
GET /api/productos/{productoId}/reviews
```
**Response:**
```json
{
  "reviews": [
    {
      "id": 1,
      "usuario": "María López",
      "calificacion": 4.5,
      "comentario": "Excelente producto",
      "fecha": "2026-01-05"
    }
  ],
  "promedio": 4.5,
  "total": 10
}
```

#### Crear o actualizar review
```http
POST /api/productos/{productoId}/reviews
```
**Body:**
```json
{
  "calificacion": 5.0,
  "comentario": "Producto de excelente calidad"
}
```

#### Eliminar mi review
```http
DELETE /api/productos/{productoId}/reviews
```

---

## 🔔 NOTIFICACIONES

#### Listar notificaciones
```http
GET /api/notificaciones
```
**Response:**
```json
{
  "notificaciones": [
    {
      "id": 1,
      "tipo": "pedido",
      "titulo": "Pedido actualizado",
      "mensaje": "Tu pedido #123 ha sido enviado",
      "data": {"pedido_id": 123},
      "leido": false,
      "fecha": "2026-01-06 10:30"
    }
  ]
}
```

#### Contar notificaciones no leídas
```http
GET /api/notificaciones/no-leidas
```

#### Marcar como leída
```http
PUT /api/notificaciones/{id}/leida
```

#### Marcar todas como leídas
```http
PUT /api/notificaciones/marcar-todas-leidas
```

#### Eliminar notificación
```http
DELETE /api/notificaciones/{id}
```

---

## �📊 Estados de Pedido

- **pendiente**: Pedido recién creado
- **procesando**: Productor está preparando el pedido
- **enviado**: Pedido en camino
- **entregado**: Pedido completado
- **cancelado**: Pedido cancelado

---

## 🗃️ Estructura de Base de Datos

### Tablas creadas:
1. **users** - Usuarios (productores, consumidores, administradores)
2. **productos** - Catálogo de productos
3. **carritos** - Items en el carrito de cada usuario
4. **pedidos** - Pedidos realizados
5. **pedido_items** - Detalle de cada pedido
6. **chats** - Conversaciones entre productores y consumidores
7. **mensajes** - Mensajes de cada chat
8. **reviews** - Calificaciones y comentarios de productos
9. **notificaciones** - Notificaciones para usuarios

---

## 🚀 Pasos para usar el backend

### 1. Ejecutar migraciones
```bash
cd laravel-backend
php artisan migrate
```

### 2. Iniciar servidor
```bash
php artisan serve
```

### 3. Configurar .env
Asegúrate de tener configurada tu base de datos en el archivo `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=agroconnect
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Conectar desde React Native
En tu app React Native, configura la URL base:
```javascript
const API_URL = 'http://tu-ip:8000/api';

// Ejemplo de login
const response = await fetch(`${API_URL}/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: email,
    password: password,
    role: role,
  }),
});

const data = await response.json();
// Guardar token para futuras peticiones
const token = data.token;
```

---

## 📝 Notas importantes

1. **Laravel Sanctum** está configurado para autenticación con tokens
2. Las rutas protegidas requieren el header `Authorization: Bearer {token}`
3. Los productores solo pueden editar/eliminar sus propios productos
4. Los pedidos actualizan automáticamente el stock de productos
5. El carrito es único por usuario y producto (no duplicados)

---

## 🔧 Próximos pasos sugeridos

- [ ] Implementar subida de imágenes reales (storage)
- [x] Sistema de calificaciones
- [x] Implementar chat entre productor-consumidor
- [ ] Agregar notificaciones push
- [ ] Sistema de reportes para administrador
- [ ] Integración con pasarelas de pago
- [ ] WebSockets para chat en tiempo real
