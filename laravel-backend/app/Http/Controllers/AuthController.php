<?php

namespace App\Http\Controllers;

use App\Models\User;
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
                'roleData' => $user->role_data,
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
            'name' => 'required|regex:/^[a-zA-Z\s]+$/',
            'apellido' => 'required|regex:/^[a-zA-Z\s]+$/',
            'cedula' => 'required|digits:10|unique:users,cedula',
            'telefono' => 'required|digits:10',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|regex:/^(?=.*[a-zA-Z])(?=.*\d).+$/',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'apellido' => $request->apellido,
            'cedula' => $request->cedula,
            'telefono' => $request->telefono,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'consumidor',
            'role_data' => json_encode(['direccion' => '']),
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
            'fotoCedula' => 'nullable|string', // Base64 o URL
            'fotoFinca' => 'nullable|string',  // Base64 o URL
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'apellido' => '',
            'cedula' => $request->cedula,
            'telefono' => $request->telefono,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'productor',
            'role_data' => json_encode([
                'nombreFinca' => $request->nombreFinca,
                'ubicacionGPS' => $request->ubicacionGPS,
                'tipoCultivos' => $request->tipoCultivos,
                'experiencia' => $request->experiencia,
                'areaCultivo' => $request->areaCultivo,
                'fotoCedula' => $request->fotoCedula,
                'fotoFinca' => $request->fotoFinca,
            ]),
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => '¡Cuenta de productor creada exitosamente!',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'roleData' => json_decode($user->role_data),
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
                'roleData' => json_decode($user->role_data),
            ],
        ], 200);
    }

    /**
     * Listar usuarios por rol
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
            
            if ($user->role === 'productor') {
                $roleData = [
                    'nombreFinca' => $user->nombre_finca,
                    'ubicacion' => $user->ubicacion_finca,
                ];
            } elseif ($user->role === 'consumidor') {
                $roleData = [
                    'direccion' => $user->direccion,
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
        // Verificar que el usuario autenticado es admin
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
        // Verificar que el usuario autenticado es admin
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
        // Verificar que el usuario autenticado es admin
        if ($request->user()->role !== 'administrador') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $usuario = User::find($id);

        if (!$usuario) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        // No permitir eliminar administradores
        if ($usuario->role === 'administrador') {
            return response()->json(['message' => 'No se puede eliminar un administrador'], 400);
        }

        $nombre = $usuario->name;
        $usuario->delete();

        return response()->json([
            'message' => "Usuario {$nombre} eliminado exitosamente",
        ], 200);
    }
}

