<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('horario_acceso', function (Blueprint $table) {
            $table->increments('id_horario');
            $table->unsignedInteger('id_usuario');
            $table->tinyInteger('dia_semana')->check('dia_semana BETWEEN 1 AND 7');
            $table->time('hora_inicio')->nullable();
            $table->time('hora_fin')->nullable();
            $table->boolean('activo')->default(true);
            
            $table->foreign('id_usuario')
                ->references('id_usuario')
                ->on('usuario')
                ->onDelete('cascade')
                ->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('horario_acceso');
    }
};
