<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            LectorSeeder::class,
            UsuarioSeeder::class,
            CredencialSeeder::class,
            VehiculoSeeder::class,
            AccesoPeatonalSeeder::class,
            AccesoVehicularSeeder::class,
        ]);
    }
}
