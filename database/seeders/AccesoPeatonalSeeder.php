<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AccesoPeatonalSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();
        
        DB::table('acceso_peatonal')->insert([
            [
                'id_usuario' => 1,
                'id_credencial' => 1,
                'fecha_hora' => $now->copy()->subMinutes(45),
                'tipo' => 'entrada',
                'resultado' => 'autorizado',
                'id_lector' => 1,
            ],
            [
                'id_usuario' => 2,
                'id_credencial' => 2,
                'fecha_hora' => $now->copy()->subMinutes(38),
                'tipo' => 'entrada',
                'resultado' => 'autorizado',
                'id_lector' => 1,
            ],
            [
                'id_usuario' => 3,
                'id_credencial' => 3,
                'fecha_hora' => $now->copy()->subMinutes(32),
                'tipo' => 'entrada',
                'resultado' => 'autorizado',
                'id_lector' => 2,
            ],
            [
                'id_usuario' => 4,
                'id_credencial' => 4,
                'fecha_hora' => $now->copy()->subMinutes(28),
                'tipo' => 'entrada',
                'resultado' => 'autorizado',
                'id_lector' => 1,
            ],
            [
                'id_usuario' => 1,
                'id_credencial' => 1,
                'fecha_hora' => $now->copy()->subMinutes(20),
                'tipo' => 'salida',
                'resultado' => 'autorizado',
                'id_lector' => 3,
            ],
            [
                'id_usuario' => 1,
                'id_credencial' => 1,
                'fecha_hora' => $now->copy()->subMinutes(15),
                'tipo' => 'entrada',
                'resultado' => 'autorizado',
                'id_lector' => 1,
            ],
            [
                'id_usuario' => 6,
                'id_credencial' => 6,
                'fecha_hora' => $now->copy()->subMinutes(10),
                'tipo' => 'entrada',
                'resultado' => 'autorizado',
                'id_lector' => 2,
            ],
            [
                'id_usuario' => 5,
                'id_credencial' => 5,
                'fecha_hora' => $now->copy()->subMinutes(5),
                'tipo' => 'entrada',
                'resultado' => 'autorizado',
                'id_lector' => 1,
            ],
            [
                'id_usuario' => 2,
                'id_credencial' => 2,
                'fecha_hora' => $now->copy()->subMinutes(3),
                'tipo' => 'salida',
                'resultado' => 'autorizado',
                'id_lector' => 3,
            ],
        ]);
    }
}
