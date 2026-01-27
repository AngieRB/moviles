# Sistema de Reportes Bidireccional

## Descripción General

Sistema completo de reportes donde **consumidores pueden reportar proveedores** y viceversa. Los reportes incluyen evidencias fotográficas, son categorizados por prioridad y gestionados por administradores con acciones específicas (advertencias, bloqueos, reembolsos).

---

## 🚀 Características Implementadas

### Backend (Laravel)

#### 1. **Migración Actualizada**
- ✅ Nueva migración: `2026_01_27_000002_add_admin_actions_to_reports.php`
- Campos agregados:
  - `accion_admin`: Tipo de acción (advertencia, bloqueo temporal, bloqueo permanente, reembolso, cancelación)
  - `historial_acciones`: JSON con auditoría completa de todas las acciones
  - `prioridad`: 0=baja, 1=media, 2=alta (calculada automáticamente según motivo)
- Motivos actualizados:
  ```
  Para Consumidores reportando Proveedores:
  - producto_defectuoso
  - cobro_indebido
  - incumplimiento_entrega
  - producto_diferente
  - comportamiento_inadecuado
  - fraude_proveedor
  
  Para Proveedores reportando Consumidores:
  - pedido_fraudulento
  - pago_no_realizado
  - devolucion_injustificada
  - abuso_consumidor
  
  Generales:
  - informacion_falsa
  - otro
  ```

#### 2. **ReportController Mejorado**
- **Sistema de prioridades automático**:
  - Alta (2): fraude_proveedor, pedido_fraudulento, cobro_indebido
  - Media (1): producto_defectuoso, incumplimiento_entrega, pago_no_realizado
  - Baja (0): resto de motivos

- **Gestión de evidencias**:
  - Almacenamiento organizado: `public/reportes/{cedula}/`
  - Hasta 5 fotos por reporte
  - Validación de tipo y tamaño (5MB max)

- **Acciones administrativas**:
  - `advertencia`: Registra en historial del usuario
  - `bloqueo_temporal`: 7 días por defecto
  - `bloqueo_permanente`: Sin fecha de desbloqueo
  - `reembolso`: Registro para procesamiento
  - `cancelacion_pedido`: Actualiza estado del pedido

- **Auditoría completa**:
  - Cada acción se registra en `historial_acciones` con:
    - admin_id y admin_nombre
    - accion y estado
    - respuesta admin
    - fecha exacta

#### 3. **WhatsAppService**
- Notificaciones automáticas para:
  - **Nuevo reporte**: Alerta al admin con prioridad, reportador, reportado y descripción
  - **Actualización de reporte**: Notifica al reportador sobre cambios de estado
  - **Acción administrativa**: Notifica al reportado sobre advertencias/bloqueos

- Configuración en `.env`:
  ```env
  WHATSAPP_API_URL=https://graph.facebook.com/v18.0
  WHATSAPP_API_KEY=tu_api_key_aqui
  WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id
  ADMIN_WHATSAPP_NUMBER=593999999999
  ```

#### 4. **Modelo Report Actualizado**
- Campos fillable agregados: `accion_admin`, `historial_acciones`, `prioridad`
- Cast automático de arrays para `historial_acciones`

---

### Frontend (React Native)

#### 1. **CrearReporteScreen.js**
Pantalla completa para crear reportes con:
- Selección de tipo (Usuario/Producto/Pedido)
- 12 motivos categorizados con iconos
- Editor de descripción (mínimo 20 caracteres, máximo 1000)
- **Evidencias fotográficas**:
  - Tomar foto con cámara
  - Seleccionar de galería
  - Preview de imágenes
  - Eliminar evidencias
  - Límite: 5 fotos
- Validaciones antes de enviar
- Confirmación si no hay evidencias

**Características UX**:
- SegmentedButtons para tipo de reporte
- Chips seleccionables para motivos
- Contador de caracteres en tiempo real
- Grid de evidencias con preview
- Botón flotante deshabilitado hasta cumplir validaciones

#### 2. **MisReportesScreen.js**
Pantalla para ver reportes propios con:
- **Filtros sticky** por estado:
  - Todos
  - Pendientes
  - En revisión
  - Resueltos
  - Rechazados
- Badges de colores según estado
- Preview de descripción (2 líneas)
- Contador de evidencias adjuntas
- Respuesta del admin (si existe)
- Pull-to-refresh
- Botón flotante para nuevo reporte

**Características UX**:
- Cards con elevación y sombras
- Chips compactos para tipo de reporte
- Dividers para separar secciones
- Empty state con llamada a la acción
- Formato de fechas localizadas (español)

---

## 📋 Rutas API

```php
// Crear reporte
POST /api/reportes
Headers: Authorization: Bearer {token}
Body (multipart/form-data):
  - reportado_id: integer (requerido)
  - tipo_reportado: enum (usuario|producto|pedido)
  - motivo: enum (ver lista arriba)
  - descripcion: string (20-1000 caracteres)
  - producto_id: integer (opcional)
  - pedido_id: integer (opcional)
  - evidencias[]: array de imágenes (máx 5)

// Listar reportes (Admin)
GET /api/reportes
Headers: Authorization: Bearer {token}
Query params:
  - estado: pendiente|en_revision|resuelto|rechazado
  - tipo_reportado: usuario|producto|pedido
  - motivo: string
  - prioridad: 0|1|2

// Ver detalle de reporte
GET /api/reportes/{id}
Headers: Authorization: Bearer {token}

// Actualizar estado (Admin)
PUT /api/reportes/{id}/estado
Headers: Authorization: Bearer {token}
Body:
  - estado: enum (pendiente|en_revision|resuelto|rechazado)
  - respuesta_admin: string (opcional)
  - accion_admin: enum (ninguna|advertencia|bloqueo_temporal|bloqueo_permanente|reembolso|cancelacion_pedido)

// Mis reportes
GET /api/reportes/mis-reportes
Headers: Authorization: Bearer {token}

// Bloquear/Desbloquear usuario (Admin)
POST /api/reportes/usuarios/{userId}/bloqueo
Headers: Authorization: Bearer {token}
Body:
  - bloquear: boolean
  - tipo_bloqueo: temporal|permanente (si bloquear=true)
  - motivo_bloqueo: string (si bloquear=true)
  - dias_bloqueo: integer (si tipo_bloqueo=temporal)
```

---

## 🔧 Instalación

### 1. Ejecutar migración
```bash
cd laravel-backend
php artisan migrate
```

Esto creará:
- Columna `accion_admin` en `reports`
- Columna `historial_acciones` en `reports`
- Columna `prioridad` en `reports`
- Actualización de enum `motivo` con nuevas opciones

### 2. Configurar WhatsApp (Opcional)
Agregar en `.env`:
```env
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_API_KEY=tu_api_key_de_meta
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id
ADMIN_WHATSAPP_NUMBER=593999999999
```

**Obtener credenciales**:
1. Ir a [Meta for Developers](https://developers.facebook.com/)
2. Crear app de WhatsApp Business
3. Obtener API Key y Phone Number ID
4. Configurar webhook para recibir mensajes

### 3. Verificar directorios de evidencias
```bash
cd laravel-backend/public
mkdir -p reportes
chmod 775 reportes
```

### 4. Instalar dependencias React Native (si no están)
```bash
cd miApp
npm install date-fns expo-image-picker
```

---

## 🎯 Flujo de Uso

### Para Consumidores/Proveedores

1. **Crear Reporte**:
   - Navegar a "Crear Reporte" desde cualquier parte de la app
   - Seleccionar usuario/producto/pedido a reportar
   - Elegir motivo específico
   - Escribir descripción detallada (mín. 20 caracteres)
   - Agregar evidencias fotográficas (recomendado)
   - Enviar reporte

2. **Seguimiento**:
   - Ver "Mis Reportes"
   - Filtrar por estado
   - Ver respuesta del admin
   - Recibir notificaciones WhatsApp sobre cambios

### Para Administradores

1. **Revisar Reportes**:
   - Acceder a panel de reportes
   - Ver prioridad (🔴 Alta, 🟡 Media, 🟢 Baja)
   - Revisar evidencias adjuntas
   - Contactar partes involucradas

2. **Tomar Acción**:
   - Cambiar estado: `en_revision` → `resuelto`/`rechazado`
   - Seleccionar acción administrativa:
     - **Advertencia**: Registro en historial del usuario
     - **Bloqueo temporal**: Usuario no puede acceder 7 días
     - **Bloqueo permanente**: Cuenta cerrada definitivamente
     - **Reembolso**: Procesar devolución de dinero
     - **Cancelación de pedido**: Anular transacción
   - Escribir respuesta para el reportador
   - Guardar (notificaciones automáticas por WhatsApp)

3. **Auditoría**:
   - Cada acción queda registrada en `historial_acciones`
   - Ver quién, cuándo y qué acción tomó
   - Trazabilidad completa

---

## 📊 Sistema de Prioridades

El sistema calcula automáticamente la prioridad según el motivo:

| Prioridad | Motivos | Color |
|-----------|---------|-------|
| 🔴 Alta (2) | fraude_proveedor, pedido_fraudulento, cobro_indebido | Rojo |
| 🟡 Media (1) | producto_defectuoso, incumplimiento_entrega, pago_no_realizado | Amarillo |
| 🟢 Baja (0) | Resto de motivos | Verde |

Los reportes de alta prioridad aparecen primero en el panel del admin.

---

## 🔔 Notificaciones WhatsApp

### Mensajes Automáticos

1. **Nuevo Reporte al Admin**:
```
🚨 NUEVO REPORTE #123

⚠️ Prioridad: 🔴 ALTA

👤 Reportador: Juan Pérez (1234567890)
🎯 Reportado: María García (0987654321)
📋 Motivo: Fraude del proveedor
📝 Tipo: pedido

Descripción:
[Descripción del usuario]

📎 Evidencias: 3 archivo(s)

Revisa el reporte en el panel de administración.
```

2. **Actualización al Reportador**:
```
📢 ACTUALIZACIÓN DE REPORTE #123

Estado: RESUELTO

✅ Tu reporte ha sido resuelto.

Respuesta del administrador:
[Respuesta del admin]

Acción tomada: Bloqueo temporal de cuenta

Gracias por ayudarnos a mantener una comunidad segura.
```

3. **Acción al Reportado**:
```
⚠️ NOTIFICACIÓN ADMINISTRATIVA

Has recibido una advertencia oficial.

Motivo:
[Motivo especificado por el admin]

Por favor, ten en cuenta nuestras políticas de uso para evitar futuras sanciones.
```

---

## 🛡️ Seguridad y Validaciones

### Backend
- ✅ Autenticación obligatoria (Sanctum)
- ✅ Rol de admin verificado para acciones sensibles
- ✅ Validación de tipos de archivo (solo imágenes)
- ✅ Límite de tamaño: 5MB por imagen
- ✅ Sanitización de inputs
- ✅ Prevención de SQL injection (Eloquent)

### Frontend
- ✅ Validación de campos obligatorios
- ✅ Mínimo 20 caracteres en descripción
- ✅ Máximo 5 evidencias
- ✅ Confirmación antes de enviar sin evidencias
- ✅ Manejo de errores de red
- ✅ Loading states durante operaciones

---

## 📱 Navegación React Native

Agregar a tu stack de navegación:

```javascript
// En tu Navigator principal
import CrearReporteScreen from './src/screens/CrearReporteScreen';
import MisReportesScreen from './src/screens/MisReportesScreen';

// En Stack.Navigator
<Stack.Screen 
  name="CrearReporte" 
  component={CrearReporteScreen}
  options={{ title: 'Crear Reporte' }}
/>
<Stack.Screen 
  name="MisReportes" 
  component={MisReportesScreen}
  options={{ title: 'Mis Reportes' }}
/>
```

**Navegación desde otras pantallas**:
```javascript
// Reportar un usuario
navigation.navigate('CrearReporte', {
  reportadoId: usuario.id,
  reportadoNombre: usuario.nombre
});

// Reportar un producto
navigation.navigate('CrearReporte', {
  reportadoId: proveedor.id,
  reportadoNombre: proveedor.nombre,
  productoId: producto.id
});

// Reportar un pedido
navigation.navigate('CrearReporte', {
  reportadoId: proveedor.id,
  reportadoNombre: proveedor.nombre,
  pedidoId: pedido.id
});

// Ver mis reportes
navigation.navigate('MisReportes');
```

---

## 🧪 Testing

### Probar creación de reporte (Postman/Thunder Client)

```bash
POST http://localhost:8000/api/reportes
Authorization: Bearer {tu_token}
Content-Type: multipart/form-data

Body:
  reportado_id: 5
  tipo_reportado: usuario
  motivo: fraude_proveedor
  descripcion: "Este proveedor me envió productos en mal estado y no responde mis mensajes. Tengo fotos como prueba."
  evidencias[0]: [archivo imagen 1]
  evidencias[1]: [archivo imagen 2]
```

### Probar actualización de estado (Admin)

```bash
PUT http://localhost:8000/api/reportes/1/estado
Authorization: Bearer {admin_token}
Content-Type: application/json

Body:
{
  "estado": "resuelto",
  "respuesta_admin": "Hemos revisado tu caso y procedimos a bloquear temporalmente al proveedor.",
  "accion_admin": "bloqueo_temporal"
}
```

---

## 📄 Archivos Modificados/Creados

### Backend
- ✅ `database/migrations/2026_01_27_000002_add_admin_actions_to_reports.php` (nuevo)
- ✅ `app/Http/Controllers/ReportController.php` (modificado)
- ✅ `app/Models/Report.php` (modificado)
- ✅ `app/Services/WhatsAppService.php` (nuevo)

### Frontend
- ✅ `miApp/src/screens/CrearReporteScreen.js` (nuevo)
- ✅ `miApp/src/screens/MisReportesScreen.js` (nuevo)

---

## 🚨 Troubleshooting

### Problema: Evidencias no se suben
**Solución**: Verificar permisos del directorio
```bash
cd laravel-backend/public
chmod -R 775 reportes
chown -R www-data:www-data reportes
```

### Problema: Notificaciones WhatsApp no se envían
**Solución**: 
1. Verificar `.env` con credenciales correctas
2. Ver logs: `tail -f storage/logs/laravel.log`
3. Probar manualmente la API de WhatsApp

### Problema: Migración falla
**Solución**:
```bash
php artisan migrate:rollback --step=1
php artisan migrate
```

### Problema: Error al seleccionar imágenes en React Native
**Solución**: Verificar permisos en `app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "La app necesita acceso a tus fotos para subir evidencias."
        }
      ]
    ]
  }
}
```

---

## 🎓 Próximas Mejoras (Opcional)

- [ ] Dashboard de reportes con gráficas
- [ ] Exportar reportes a PDF
- [ ] Sistema de tickets con mensajería
- [ ] Reportes anónimos
- [ ] Integración con Stripe para reembolsos automáticos
- [ ] Notificaciones push además de WhatsApp
- [ ] Ratings de usuarios según historial de reportes

---

## 📞 Soporte

Si tienes problemas con la implementación, revisa:
1. Logs de Laravel: `storage/logs/laravel.log`
2. Consola de React Native: `npx react-native log-android` o `npx react-native log-ios`
3. Variables de entorno en `.env`

---

## 📜 Licencia

Este sistema es parte del proyecto de gestión de frutas y verduras.
