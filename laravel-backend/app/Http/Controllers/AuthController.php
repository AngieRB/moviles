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

        // Crear token de autenticación
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login exitoso',
            'user' => [
                'id' => $user->id,
                'nombre' => $user->nombre,
                'apellido' => $user->apellido,
                'email' => $user->email,
                'telefono' => $user->telefono,
                'role' => $user->role,
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
            'nombre' => 'required|string|max:255',
            'cedula' => 'required|string|unique:users,cedula',
            'telefono' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'nombre' => $request->nombre,
            'apellido' => '', // Puedes separar nombre completo si lo necesitas
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
                'nombre' => $user->nombre,
                'email' => $user->email,
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
            'nombre' => 'required|string|max:255',
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
            'nombre' => $request->nombre,
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
                'nombre' => $user->nombre,
                'email' => $user->email,
                'role' => $user->role,
                'roleData' => json_decode($user->role_data),
            ],
            'token' => $token,
        ], 201);
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada exitosamente',
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
                'nombre' => $user->nombre,
                'apellido' => $user->apellido,
                'email' => $user->email,
                'telefono' => $user->telefono,
                'cedula' => $user->cedula,
                'role' => $user->role,
                'roleData' => json_decode($user->role_data),
            ],
        ], 200);
    }
}
