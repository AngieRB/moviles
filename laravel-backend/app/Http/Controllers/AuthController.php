<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login de usuario (Productor, Consumidor, Administrador)
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
            'role' => 'required|in:productor,consumidor,administrador',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)
                    ->where('role', $request->role)
                    ->first();


        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        // Si es productor y no está verificado, bloquear login
        if ($user->role === 'productor' && !$user->verificado) {
            return response()->json([
                'message' => 'Tu cuenta de productor aún no ha sido verificada por un administrador. Por favor espera la confirmación.',
            ], 403);
        }

        // Crear token de autenticación
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login exitoso',
            'user' => [
                'id' => $user->id,
                'nombre' => $user->name,
                'apellido' => $user->apellido,
                'email' => $user->email,
                'telefono' => $user->telefono,
                'role' => $user->role,
                'cedula' => $user->cedula,
                'foto_perfil' => $user->foto_perfil,
                'roleData' => $user->role_data, // Ya es un array gracias a 'casts'
            ],
            'token' => $token,
        ], 200);
    }

    /**
     * Registro de Consumidor
     */
    public function registerConsumidor(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/u',
            'apellido' => 'required|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/u',
            'cedula' => 'required|digits:10|unique:users,cedula',
            'telefono' => 'required|digits:10',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|regex:/^(?=.*[a-zA-Z])(?=.*\d).+$/',
            'foto_perfil' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Procesar foto de perfil si existe
        $rutaFoto = null;
        if ($request->hasFile('foto_perfil')) {
            $imagen = $request->file('foto_perfil');
            if (ImageService::validarImagen($imagen)) {
                $rutaFoto = ImageService::guardarFotoUsuario($imagen, $request->cedula, 'consumidor');
            }
        }

        $user = User::create([
            'name' => $request->name,
            'apellido' => $request->apellido,
            'cedula' => $request->cedula,
            'telefono' => $request->telefono,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'consumidor',
            'foto_perfil' => $rutaFoto,
            // Pasamos un array directo, el Modelo lo convertirá a JSON solo
            'role_data' => ['direccion' => ''],
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => '¡Cuenta de consumidor creada exitosamente!',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'apellido' => $user->apellido,
                'email' => $user->email,
                'telefono' => $user->telefono,
                'role' => $user->role,
            ],
            'token' => $token,
        ], 201);
    }

    /**
     * Registro de Productor
     */
    public function registerProductor(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'cedula' => 'required|string|unique:users,cedula',
            'telefono' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
            'nombreFinca' => 'required|string',
            'ubicacionGPS' => 'nullable|string',
            'tipoCultivos' => 'required|array',
            'experiencia' => 'nullable|string',
            'areaCultivo' => 'nullable|string',
            'fotoCedula' => 'nullable|string',
            'fotoFinca' => 'nullable|string',
            'foto_perfil' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Procesar foto de perfil si existe
        $rutaFoto = null;
        if ($request->hasFile('foto_perfil')) {
            $imagen = $request->file('foto_perfil');
            if (ImageService::validarImagen($imagen)) {
                $rutaFoto = ImageService::guardarFotoUsuario($imagen, $request->cedula, 'productor');
            }
        }

        $user = User::create([
            'name' => $request->name,
            'apellido' => '',
            'cedula' => $request->cedula,
            'telefono' => $request->telefono,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'productor',
            'foto_perfil' => $rutaFoto,
            // Pasamos ARRAY directo. Laravel lo guarda como JSON gracias al cast.
            'role_data' => [
                'nombreFinca' => $request->nombreFinca,
                'ubicacionGPS' => $request->ubicacionGPS,
                'tipoCultivos' => $request->tipoCultivos,
                'experiencia' => $request->experiencia,
                'areaCultivo' => $request->areaCultivo,
                'fotoCedula' => $request->fotoCedula,
                'fotoFinca' => $request->fotoFinca,
            ],
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => '¡Cuenta de productor creada exitosamente!',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'roleData' => $user->role_data, // Ya viene como array
            ],
            'token' => $token,
        ], 201);
    }

    /**
     * Logout de usuario
     */
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logout exitoso',
        ], 200);
    }

    /**
     * Obtener usuario actual
     */
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'nombre' => $user->name,
                'apellido' => $user->apellido,
                'email' => $user->email,
                'telefono' => $user->telefono,
                'cedula' => $user->cedula,
                'role' => $user->role,
                'roleData' => $user->role_data, // Ya viene como array
            ],
        ], 200);
    }

    /**
     * Listar usuarios por rol (CORREGIDO)
     */
    public function listarUsuarios(Request $request)
    {
        $role = $request->query('role');

        $query = User::query();

        if ($role) {
            $query->where('role', $role);
        }

        $usuarios = $query->orderBy('name')->get()->map(function ($user) {
            $roleData = null;

            // Accedemos a role_data como ARRAY (gracias al cast en User.php)
            // Usamos ?? para evitar errores si el campo no existe

            if ($user->role === 'productor') {
                $roleData = [
                    'nombreFinca' => $user->role_data['nombreFinca'] ?? 'N/A',
                    'ubicacion' => $user->role_data['ubicacionGPS'] ?? 'N/A',
                ];
            } elseif ($user->role === 'consumidor') {
                $roleData = [
                    'direccion' => $user->role_data['direccion'] ?? 'N/A',
                ];
            }

            return [
                'id' => $user->id,
                'nombre' => $user->name,
                'apellido' => $user->apellido,
                'email' => $user->email,
                'telefono' => $user->telefono,
                'cedula' => $user->cedula,
                'role' => $user->role,
                'verificado' => (bool) $user->verificado,
                'fecha_verificacion' => $user->fecha_verificacion,
                'role_data' => $roleData,
                'created_at' => $user->created_at,
            ];
        });

        return response()->json([
            'usuarios' => $usuarios,
        ], 200);
    }

    /**
     * Verificar un productor (solo admin)
     */
    public function verificarUsuario(Request $request, $id)
    {
        if ($request->user()->role !== 'administrador') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $usuario = User::find($id);

        if (!$usuario) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        $usuario->verificado = true;
        $usuario->fecha_verificacion = now();
        $usuario->save();

        return response()->json([
            'message' => 'Usuario verificado exitosamente',
            'usuario' => [
                'id' => $usuario->id,
                'nombre' => $usuario->name,
                'verificado' => $usuario->verificado,
            ],
        ], 200);
    }

    /**
     * Rechazar/Desverificar un usuario (solo admin)
     */
    public function rechazarUsuario(Request $request, $id)
    {
        if ($request->user()->role !== 'administrador') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $usuario = User::find($id);

        if (!$usuario) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        $usuario->verificado = false;
        $usuario->fecha_verificacion = null;
        $usuario->save();

        return response()->json([
            'message' => 'Usuario rechazado/desverificado',
            'usuario' => [
                'id' => $usuario->id,
                'nombre' => $usuario->name,
                'verificado' => $usuario->verificado,
            ],
        ], 200);
    }

    /**
     * Eliminar un usuario (solo admin)
     */
    public function eliminarUsuario(Request $request, $id)
    {
        if ($request->user()->role !== 'administrador') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $usuario = User::find($id);

        if (!$usuario) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        if ($usuario->role === 'administrador') {
            return response()->json(['message' => 'No se puede eliminar un administrador'], 400);
        }

        // Eliminar foto de perfil si existe
        if ($usuario->foto_perfil) {
            ImageService::eliminarFotoUsuario($usuario->foto_perfil);
        }

        $nombre = $usuario->name;
        $usuario->delete();

        return response()->json([
            'message' => "Usuario {$nombre} eliminado exitosamente",
        ], 200);
    }

    /**
     * Actualizar foto de perfil del usuario autenticado
     */
    public function actualizarFotoPerfil(Request $request)
    {
        \Log::info('Iniciando actualización de foto de perfil');
        \Log::info('Usuario autenticado: ' . $request->user()->id);
        \Log::info('Archivo recibido: ' . ($request->hasFile('foto_perfil') ? 'SI' : 'NO'));
        
        $validator = Validator::make($request->all(), [
            'foto_perfil' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        if ($validator->fails()) {
            \Log::error('Validación fallida: ' . json_encode($validator->errors()));
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        if (!$user->cedula) {
            return response()->json(['message' => 'El usuario no tiene cédula registrada'], 400);
        }

        try {
            $imagen = $request->file('foto_perfil');
            
            if (!ImageService::validarImagen($imagen)) {
                return response()->json(['message' => 'Imagen inválida o muy grande (máx 5MB)'], 400);
            }

            // Eliminar foto anterior si existe
            if ($user->foto_perfil) {
                ImageService::eliminarFotoUsuario($user->foto_perfil);
            }

            // Guardar nueva foto
            $rutaFoto = ImageService::guardarFotoUsuario($imagen, $user->cedula, $user->role);

            if (!$rutaFoto) {
                \Log::error('Error: ImageService no pudo guardar la foto');
                return response()->json(['message' => 'Error al guardar la imagen'], 500);
            }

            \Log::info('Foto guardada en: ' . $rutaFoto);

            $user->foto_perfil = $rutaFoto;
            $user->save();

            \Log::info('Usuario actualizado en BD. foto_perfil: ' . $user->foto_perfil);

            return response()->json([
                'message' => 'Foto de perfil actualizada exitosamente',
                'foto_perfil' => $rutaFoto,
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Error actualizando foto de perfil: ' . $e->getMessage());
            return response()->json(['message' => 'Error al actualizar foto de perfil'], 500);
        }
    }
}
