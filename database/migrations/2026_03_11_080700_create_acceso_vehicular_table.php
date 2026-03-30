<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('acceso_vehicular', function (Blueprint $table) {
            $table->bigIncrements('id_acceso_vehicular');
            $table->unsignedInteger('id_usuario')->nullable();
            $table->unsignedInteger('id_vehiculo')->nullable();
            $table->string('placa_leida', 20);
            $table->dateTime('fecha_hora')->useCurrent();
            $table->enum('resultado', ['autorizado', 'denegado']);
            $table->unsignedTinyInteger('id_motivo_denegacion')->nullable();
            $table->string('imagen_placa', 255)->nullable();
            $table->unsignedSmallInteger('id_lector');
            
            $table->foreign('id_usuario')
                ->references('id_usuario')
                ->on('usuario')
                ->onDelete('set null')
                ->onUpdate('cascade');
            
            $table->foreign('id_vehiculo')
                ->references('id_vehiculo')
                ->on('vehiculo')
                ->onDelete('set null')
                ->onUpdate('cascade');
            
            $table->foreign('id_motivo_denegacion')
                ->references('id_motivo')
                ->on('motivo_denegacion')
                ->onDelete('set null')
                ->onUpdate('cascade');
            
            $table->foreign('id_lector')
                ->references('id_lector')
                ->on('lector')
                ->onDelete('restrict')
                ->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('acceso_vehicular');
    }
};
