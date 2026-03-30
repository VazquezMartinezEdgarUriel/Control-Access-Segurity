<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AccesoVehicularSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();
        
        DB::table('acceso_vehicular')->insert([
            [
                'id_usuario' => 1,
                'id_vehiculo' => 1,
                'placa_leida' => 'UBR-123',
                'fecha_hora' => $now->copy()->subMinutes(50),
                'resultado' => 'autorizado',
                'id_lector' => 4,
            ],
            [
                'id_usuario' => 2,
                'id_vehiculo' => 2,
                'placa_leida' => 'XYZ-456',
                'fecha_hora' => $now->copy()->subMinutes(42),
                'resultado' => 'autorizado',
                'id_lector' => 4,
            ],
            [
                'id_usuario' => null,
                'id_vehiculo' => null,
                'placa_leida' => 'QWE-999',
                'fecha_hora' => $now->copy()->subMinutes(35),
                'resultado' => 'denegado',
                'id_lector' => 4,
            ],
            [
                'id_usuario' => 4,
                'id_vehiculo' => 3,
                'placa_leida' => 'ABC-789',
                'fecha_hora' => $now->copy()->subMinutes(25),
                'resultado' => 'autorizado',
                'id_lector' => 4,
            ],
            [
                'id_usuario' => 5,
                'id_vehiculo' => 4,
                'placa_leida' => 'DEF-012',
                'fecha_hora' => $now->copy()->subMinutes(12),
                'resultado' => 'autorizado',
                'id_lector' => 5,
            ],
            [
                'id_usuario' => 1,
                'id_vehiculo' => 1,
                'placa_leida' => 'UBR-123',
                'fecha_hora' => $now->copy()->subMinutes(2),
                'resultado' => 'autorizado',
                'id_lector' => 5,
            ],
        ]);
    }
}
