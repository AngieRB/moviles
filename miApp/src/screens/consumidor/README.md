# Interfaces del Consumidor - AgroConnect

## Estructura de Pantallas

El módulo de consumidor cuenta con las siguientes interfaces:

### 1. **ProductosScreen** (`ProductosScreen.js`)
   - **Propósito**: Mostrar catálogo de productos disponibles
   - **Características**:
     - Búsqueda en tiempo real
     - Filtrado por categorías (Todos, Vegetales, Frutas, Lácteos, Granos)
     - Visualización de tarjetas de productos
     - Calificaciones de productores
     - Disponibilidad en stock
     - Botón para agregar rápidamente al carrito

### 2. **DetalleProductoScreen** (`DetalleProductoScreen.js`)
   - **Propósito**: Mostrar información detallada de un producto
   - **Características**:
     - Imagen grande del producto
     - Información del productor
     - Calificaciones y reseñas
     - Selector de cantidad
     - Cálculo automático de total
     - Descripción y características del producto
     - Botón para agregar al carrito

### 3. **CarritoScreen** (`CarritoScreen.js`)
   - **Propósito**: Gestionar productos en el carrito de compras
   - **Características**:
     - Listado de productos agregados
     - Ajuste de cantidades (aumentar/disminuir)
     - Cálculo de subtotal, envío y total
     - Descuento de envío (gratis en compras > $20)
     - Opción para eliminar productos
     - Botón para proceder al pago

### 4. **MisPedidosScreen** (`MisPedidosScreen.js`)
   - **Propósito**: Mostrar historial de pedidos realizados
   - **Características**:
     - Listado de todos los pedidos
     - Estados: Confirmado, En camino, Entregado
     - Información de cantidad de artículos
     - Fecha y monto de cada pedido
     - Acceso al detalle de cada pedido

### 5. **DetallePedidoScreen** (`DetallePedidoScreen.js`)
   - **Propósito**: Mostrar información completa de un pedido
   - **Características**:
     - Estado actual del pedido
     - Timeline/progreso del pedido
     - Información de entrega
     - Listado detallado de productos
     - Desglose de costos
     - Opciones de rastreo y contacto con soporte

## Navegación

```
ConsumidorDashboard (Tab Navigator)
├── Inicio (InicioScreen)
├── Productos (Stack Navigator)
│   ├── ProductosScreen
│   └── DetalleProductoScreen
├── Carrito (CarritoScreen)
├── Pedidos (Stack Navigator)
│   ├── MisPedidosScreen
│   └── DetallePedidoScreen
├── Perfil (PerfilScreen)
└── Configuración (ConfiguracionScreen)
```

## Flujo de Compra

1. **Exploración**: Usuario navega a **Productos**
2. **Búsqueda**: Utiliza búsqueda y filtros por categoría
3. **Detalle**: Selecciona un producto para ver detalles
4. **Carrito**: Agrega productos al carrito
5. **Revisión**: Va a **Carrito** para revisar y confirmar
6. **Pago**: Realiza el pago
7. **Seguimiento**: Accede a **Mis Pedidos** para rastrear

## Colores y Estilos

- **Color primario (Consumidor)**: `#4A90E2` (Azul)
- **Color de éxito**: `#4CAF50` (Verde)
- **Color de advertencia**: `#FF9800` (Naranja)
- **Color de información**: `#2196F3` (Azul claro)
- **Color de error**: `#E74C3C` (Rojo)

## Datos de Ejemplo

Todas las pantallas incluyen datos de ejemplo (hardcoded) para demostración. 
En producción, estos deben ser reemplazados por llamadas a API.

### Puntos de integración API:
- `ProductosScreen`: GET /api/productos
- `CarritoScreen`: POST /api/carrito/agregar
- `MisPedidosScreen`: GET /api/pedidos/usuario
- `DetallePedidoScreen`: GET /api/pedidos/:id

## Componentes Utilizados

- **React Native Paper**: UI Components (Card, Text, Button, etc.)
- **React Navigation**: Navegación (Bottom Tab Navigator, Native Stack Navigator)
- **Material Community Icons**: Iconografía

## Notas Importantes

1. Las pantallas de Stack Navigator (Productos y Pedidos) mantienen sus propios headers
2. El Tab Navigator principal no muestra headers para evitar duplicados
3. Todos los estilos están internos (StyleSheet)
4. Se usa el hook `useTheme` de React Native Paper para tema consistente

