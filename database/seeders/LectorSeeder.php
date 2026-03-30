<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LectorSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('lector')->insert([
            [
                'nombre' => 'Lector Entrada Principal',
                'ubicacion' => 'Puerta Principal - Peatonal',
                'tipo_acceso' => 'peatonal',
                'activo' => true,
            ],
            [
                'nombre' => 'Lector Escaleras',
                'ubicacion' => 'Escaleras B - Peatonal',
                'tipo_acceso' => 'peatonal',
                'activo' => true,
            ],
            [
                'nombre' => 'Lector Ascensor',
                'ubicacion' => 'Pasillo 2do Piso - Peatonal',
                'tipo_acceso' => 'peatonal',
                'activo' => true,
            ],
            [
                'nombre' => 'Lector Parqueadero',
                'ubicacion' => 'Entrada Parqueadero - Vehicular',
                'tipo_acceso' => 'vehicular',
                'activo' => true,
            ],
            [
                'nombre' => 'Lector Salida Parqueadero',
                'ubicacion' => 'Salida Parqueadero - Vehicular',
                'tipo_acceso' => 'vehicular',
                'activo' => true,
            ],
        ]);
    }
}
