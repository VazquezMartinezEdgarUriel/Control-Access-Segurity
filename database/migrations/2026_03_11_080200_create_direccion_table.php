<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('direccion', function (Blueprint $table) {
            $table->increments('id_direccion');
            $table->string('calle', 100);
            $table->string('numero_exterior', 10)->nullable();
            $table->string('numero_interior', 10)->nullable();
            $table->string('colonia', 100)->nullable();
            $table->string('ciudad', 50)->nullable();
            $table->string('estado', 50)->nullable();
            $table->string('codigo_postal', 10)->nullable();
            $table->string('pais', 50)->default('México');
            $table->timestamp('creado_en')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('direccion');
    }
};
