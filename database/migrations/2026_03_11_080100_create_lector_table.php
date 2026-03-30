<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lector', function (Blueprint $table) {
            $table->smallIncrements('id_lector')->nullable(false);
            $table->string('nombre', 50)->nullable(false);
            $table->string('ubicacion', 100)->nullable();
            $table->enum('tipo_acceso', ['peatonal', 'vehicular'])->nullable(false);
            $table->boolean('activo')->default(true)->nullable(false);
            $table->timestamp('creado_en')->useCurrent()->nullable(false);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lector');
    }
};
