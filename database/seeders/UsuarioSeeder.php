<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('usuario')->insert([
            [
                'nombre_completo' => 'Edgar Uriel Vazquez',
                'tipo_usuario' => 'empleado',
                'email' => 'edgar.vazquez@empresa.com',
                'telefono' => '5541234567',
                'vigencia_inicio' => '2026-01-01',
                'vigencia_fin' => '2027-12-31',
                'activo' => true,
            ],
            [
                'nombre_completo' => 'Rosa María Luna López',
                'tipo_usuario' => 'docente',
                'email' => 'rosa.luna@empresa.com',
                'telefono' => '5542345678',
                'vigencia_inicio' => '2026-01-01',
                'vigencia_fin' => '2027-12-31',
                'activo' => true,
            ],
            [
                'nombre_completo' => 'Juan Carlos Sánchez Rivera',
                'tipo_usuario' => 'alumno',
                'email' => 'juan.sanchez@estudiante.com',
                'telefono' => '5543456789',
                'vigencia_inicio' => '2026-01-01',
                'vigencia_fin' => '2026-12-31',
                'activo' => true,
            ],
            [
                'nombre_completo' => 'María González Torres',
                'tipo_usuario' => 'empleado',
                'email' => 'maria.gonzalez@empresa.com',
                'telefono' => '5544567890',
                'vigencia_inicio' => '2026-01-01',
                'vigencia_fin' => '2027-12-31',
                'activo' => true,
            ],
            [
                'nombre_completo' => 'Carlos Alberto Ruiz',
                'tipo_usuario' => 'proveedor',
                'email' => 'carlos.ruiz@proveedor.com',
                'telefono' => '5545678901',
                'vigencia_inicio' => '2026-03-01',
                'vigencia_fin' => '2026-06-30',
                'activo' => true,
            ],
            [
                'nombre_completo' => 'Ana Patricia Medina',
                'tipo_usuario' => 'visitante',
                'email' => 'ana.medina@visitante.com',
                'telefono' => '5546789012',
                'vigencia_inicio' => '2026-03-11',
                'vigencia_fin' => '2026-03-11',
                'activo' => true,
            ],
        ]);
    }
}
