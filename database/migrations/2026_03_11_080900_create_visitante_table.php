<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visitante', function (Blueprint $table) {
            $table->increments('id_visitante');
            $table->unsignedInteger('id_usuario')->unique();
            $table->string('empresa', 100)->nullable();
            $table->string('motivo', 255)->nullable();
            $table->string('autorizado_por', 100)->nullable();
            $table->dateTime('fecha_entrada_estimada')->nullable();
            $table->dateTime('fecha_salida_estimada')->nullable();
            
            $table->foreign('id_usuario')
                ->references('id_usuario')
                ->on('usuario')
                ->onDelete('cascade')
                ->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visitante');
    }
};
