<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CredencialSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('credencial')->insert([
            [
                'id_usuario' => 1,
                'uid_nfc' => '04:1C:E8:72:A1:14:80',
                'tipo_credencial' => 'fisica',
                'activa' => true,
                'observaciones' => 'Credencial principal empleado',
            ],
            [
                'id_usuario' => 2,
                'uid_nfc' => '04:3B:F5:A2:28:20:1D',
                'tipo_credencial' => 'fisica',
                'activa' => true,
                'observaciones' => 'Credencial docente',
            ],
            [
                'id_usuario' => 3,
                'uid_nfc' => '08:FD:E4:B1:55:A0:7C',
                'tipo_credencial' => 'movil',
                'activa' => true,
                'observaciones' => 'Credencial estudiante por móvil',
            ],
            [
                'id_usuario' => 4,
                'uid_nfc' => '04:67:F2:18:9A:34:E5',
                'tipo_credencial' => 'fisica',
                'activa' => true,
                'observaciones' => 'Credencial empleado',
            ],
            [
                'id_usuario' => 5,
                'uid_nfc' => '04:9E:C3:42:BB:75:12',
                'tipo_credencial' => 'fisica',
                'activa' => true,
                'observaciones' => 'Credencial proveedor temporal',
            ],
            [
                'id_usuario' => 6,
                'uid_nfc' => '04:5F:D1:87:66:19:43',
                'tipo_credencial' => 'fisica',
                'activa' => true,
                'observaciones' => 'Credencial visitante día',
            ],
        ]);
    }
}
