# ⚠️ CONFIGURACIÓN DE BASE DE DATOS

## Problema Actual

El servidor PostgreSQL en `10.82.23.101:5432` no está accesible. Necesitas configurar la conexión a la base de datos.

## Opciones de Configuración

### Opción 1: PostgreSQL Local (Recomendado para desarrollo)

#### Paso 1: Instalar PostgreSQL

Si no tienes PostgreSQL instalado:
1. Descarga desde: https://www.postgresql.org/download/windows/
2. Instala con contraseña: `password` (o la que prefieras)
3. Puerto por defecto: `5432`

#### Paso 2: Crear la base de datos

```powershell
# Abrir terminal de PostgreSQL (psql)
psql -U postgres

# Crear base de datos
CREATE DATABASE agroconnect;

# Salir
\q
```

#### Paso 3: Configurar Laravel

Edita el archivo `.env` en `laravel-backend/`:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=agroconnect
DB_USERNAME=postgres
DB_PASSWORD=password
```

#### Paso 4: Ejecutar migraciones

```powershell
cd laravel-backend
php artisan migrate:fresh --seed
```

---

### Opción 2: SQLite (Más simple, sin instalación)

#### Paso 1: Configurar Laravel para SQLite

Edita `.env` en `laravel-backend/`:

```env
DB_CONNECTION=sqlite
# Comenta o elimina las líneas DB_HOST, DB_PORT, etc.
```

#### Paso 2: Crear archivo de base de datos

```powershell
cd laravel-backend
New-Item -Path database/database.sqlite -ItemType File
```

#### Paso 3: Ejecutar migraciones

```powershell
php artisan migrate:fresh --seed
```

---

### Opción 3: Conectar al servidor remoto 10.82.23.101

Si el servidor PostgreSQL está en otra máquina:

#### Verificar conectividad:

```powershell
Test-NetConnection -ComputerName 10.82.23.101 -Port 5432
```

#### Si no conecta:

1. **En el servidor PostgreSQL**, edita `postgresql.conf`:
   ```
   listen_addresses = '*'
   ```

2. **Edita `pg_hba.conf`**, agrega:
   ```
   host    all    all    0.0.0.0/0    md5
   ```

3. **Reinicia PostgreSQL**

4. **Verifica firewall** permite puerto 5432

---

## 🚀 Inicio Rápido con SQLite

**La forma más rápida de empezar:**

```powershell
# 1. Ir a la carpeta del backend
cd laravel-backend

# 2. Cambiar a SQLite
Set-Content .env -Value (Get-Content .env | ForEach-Object { 
    if($_ -match "DB_CONNECTION=") { "DB_CONNECTION=sqlite" } 
    elseif($_ -match "DB_HOST=") { "# DB_HOST=127.0.0.1" }
    elseif($_ -match "DB_PORT=") { "# DB_PORT=5432" }
    elseif($_ -match "DB_DATABASE=") { "# DB_DATABASE=agroconnect" }
    elseif($_ -match "DB_USERNAME=") { "# DB_USERNAME=postgres" }
    elseif($_ -match "DB_PASSWORD=") { "# DB_PASSWORD=password" }
    else { $_ }
})

# 3. Crear archivo de base de datos
New-Item -Path database/database.sqlite -ItemType File -Force

# 4. Ejecutar migraciones y seeders
php artisan migrate:fresh --seed

# 5. Iniciar servidor
php artisan serve --host=0.0.0.0 --port=8000
```

---

## ✅ Verificar que funcionó

Deberías ver:

```
✅ Usuarios de prueba creados:
   - Productor: productor@test.com / 123456
   - Consumidor: consumidor@test.com / 123456
   - Administrador: admin@agroconnect.com / Admin123
```

---

## 🧪 Probar la API

Una vez que el servidor esté corriendo:

```powershell
# Probar login (PowerShell)
Invoke-RestMethod -Uri "http://localhost:8000/api/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"productor@test.com","password":"123456","role":"productor"}'
```

Deberías recibir:
```json
{
  "message": "Login exitoso",
  "user": { ... },
  "token": "1|..."
}
```

---

## 📱 Configurar Frontend

Una vez que la base de datos funcione y el servidor esté corriendo:

### Si usas localhost (emulador/SQLite):

Edita `miApp/src/services/apiClient.js`:

```javascript
const API_URL = "http://10.0.2.2:8000/api"; // Emulador Android
// o
const API_URL = "http://localhost:8000/api"; // iOS Simulator
```

### Si usas dispositivo físico:

1. Encuentra tu IP local:
   ```powershell
   ipconfig
   # Busca "Dirección IPv4" (ej: 192.168.1.10)
   ```

2. Edita `apiClient.js`:
   ```javascript
   const API_URL = "http://192.168.1.10:8000/api";
   ```

3. Asegúrate de que el backend esté escuchando en todas las interfaces:
   ```powershell
   php artisan serve --host=0.0.0.0 --port=8000
   ```

---

**Recomendación:** Usa SQLite para desarrollo local, es más simple y no requiere configuración adicional.
