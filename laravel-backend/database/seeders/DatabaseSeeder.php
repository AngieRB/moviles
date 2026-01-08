<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Crear usuario Productor de prueba
        User::create([
            'nombre' => 'Juan',
            'apellido' => 'Pérez',
            'cedula' => '1234567890',
            'telefono' => '0987654321',
            'email' => 'productor@test.com',
            'password' => Hash::make('123456'),
            'role' => 'productor',
            'role_data' => json_encode([
                'nombreFinca' => 'Finca El Paraíso',
                'tipoProductos' => 'Frutas y Vegetales',
                'ubicacion' => 'Manabí, Ecuador'
            ]),
        ]);

        // Crear usuario Consumidor de prueba
        User::create([
            'nombre' => 'María',
            'apellido' => 'González',
            'cedula' => '0987654321',
            'telefono' => '0991234567',
            'email' => 'consumidor@test.com',
            'password' => Hash::make('123456'),
            'role' => 'consumidor',
            'role_data' => json_encode([
                'direccion' => 'Av. Principal 123, Manta',
                'preferencias' => 'Productos orgánicos'
            ]),
        ]);

        // Crear usuario Administrador de prueba
        User::create([
            'nombre' => 'Admin',
            'apellido' => 'Sistema',
            'cedula' => '0000000000',
            'telefono' => 'N/A',
            'email' => 'admin@agroconnect.com',
            'password' => Hash::make('Admin123'),
            'role' => 'administrador',
            'role_data' => null,
        ]);

        echo "✅ Usuarios de prueba creados:\n";
        echo "   - Productor: productor@test.com / 123456\n";
        echo "   - Consumidor: consumidor@test.com / 123456\n";
        echo "   - Administrador: admin@agroconnect.com / Admin123\n";
    }
}

