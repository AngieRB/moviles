# 🚀 INICIO RÁPIDO - AgroConnect

## ⚡ Configuración en 5 Minutos

### 1️⃣ Configurar Base de Datos (SQLite - Opción más simple)

```powershell
# En la carpeta del proyecto
cd laravel-backend

# Crear archivo de base de datos
New-Item -Path database/database.sqlite -ItemType File -Force

# Editar .env para usar SQLite
notepad .env
```

**En .env, cambia estas líneas:**
```env
DB_CONNECTION=sqlite
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=agroconnect
# DB_USERNAME=postgres
# DB_PASSWORD=password
```

### 2️⃣ Crear Base de Datos y Usuarios

```powershell
# Ejecutar migraciones y seeders
php artisan migrate:fresh --seed
```

**✅ Deberías ver:**
```
✅ Usuarios de prueba creados:
   - Productor: productor@test.com / 123456
   - Consumidor: consumidor@test.com / 123456
   - Administrador: admin@agroconnect.com / Admin123
```

### 3️⃣ Iniciar Backend

```powershell
# En laravel-backend/
php artisan serve --host=0.0.0.0 --port=8000
```

**✅ Deberías ver:**
```
Server running on [http://0.0.0.0:8000]
```

### 4️⃣ Configurar IP del Frontend

**Si usas EMULADOR Android:**

Edita `miApp/src/services/apiClient.js`:
```javascript
const API_URL = "http://10.0.2.2:8000/api";
```

**Si usas DISPOSITIVO FÍSICO:**

1. Encuentra tu IP local:
```powershell
ipconfig
# Busca "Dirección IPv4" - ejemplo: 192.168.1.10
```

2. Edita `miApp/src/services/apiClient.js`:
```javascript
const API_URL = "http://192.168.1.10:8000/api";
```

### 5️⃣ Iniciar Frontend

```powershell
# En miApp/
npm start
```

Luego presiona:
- `a` para Android
- `i` para iOS

---

## 🧪 Probar el Login

1. En la app, selecciona "Productor"
2. Ingresa:
   - Email: `productor@test.com`
   - Contraseña: `123456`
3. ✅ Deberías entrar al dashboard

---

## ✅ Checklist de Verificación

- [ ] PostgreSQL/SQLite configurado
- [ ] Migraciones ejecutadas (`php artisan migrate:fresh --seed`)
- [ ] Backend corriendo (`php artisan serve`)
- [ ] IP configurada en `apiClient.js`
- [ ] Frontend corriendo (`npm start`)
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Sesión persiste al reiniciar app

---

## 🆘 Si algo no funciona

### Backend no inicia:
```powershell
# Verificar extensiones PHP
php -m | Select-String -Pattern "pdo|sqlite|pgsql"

# Si falta SQLite:
# Editar php.ini y descomentar: extension=pdo_sqlite
```

### Frontend no conecta:
```powershell
# Verificar que backend esté corriendo
curl http://localhost:8000/api/productos

# Verificar IP en apiClient.js
cat miApp/src/services/apiClient.js | Select-String "API_URL"
```

### Error de credenciales:
```powershell
# Recrear usuarios
cd laravel-backend
php artisan migrate:fresh --seed
```

---

## 📱 Usuarios de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| 👨‍🌾 **Productor** | productor@test.com | 123456 |
| 🛒 **Consumidor** | consumidor@test.com | 123456 |
| ⚙️ **Administrador** | admin@agroconnect.com | Admin123 |

---

## 📚 Más Información

- `RESUMEN_IMPLEMENTACION.md` - Resumen completo de cambios
- `CONEXION_BACKEND_FRONTEND.md` - Guía detallada
- `CONFIGURACION_BASE_DATOS.md` - Opciones de base de datos

---

**¡Listo para empezar! 🚀**
