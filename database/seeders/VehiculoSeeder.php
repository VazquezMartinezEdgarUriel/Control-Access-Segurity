<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VehiculoSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('vehiculo')->insert([
            [
                'id_usuario' => 1,
                'placa' => 'UBR-123',
                'marca' => 'Toyota',
                'modelo' => 'Corolla',
                'color' => 'Blanco',
                'activo' => true,
            ],
            [
                'id_usuario' => 2,
                'placa' => 'XYZ-456',
                'marca' => 'Honda',
                'modelo' => 'Civic',
                'color' => 'Negro',
                'activo' => true,
            ],
            [
                'id_usuario' => 4,
                'placa' => 'ABC-789',
                'marca' => 'Nissan',
                'modelo' => 'Sentra',
                'color' => 'Gris',
                'activo' => true,
            ],
            [
                'id_usuario' => 5,
                'placa' => 'DEF-012',
                'marca' => 'Chevrolet',
                'modelo' => 'Trax',
                'color' => 'Rojo',
                'activo' => true,
            ],
        ]);
    }
}
