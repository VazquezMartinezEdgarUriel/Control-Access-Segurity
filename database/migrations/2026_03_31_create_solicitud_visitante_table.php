<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('solicitud_visitante', function (Blueprint $table) {
            $table->bigIncrements('id_solicitud');
            
            // Datos del solicitante
            $table->string('nombre_solicitante', 100);
            $table->string('apellido_solicitante', 100);
            $table->string('email_solicitante', 150)->nullable();
            $table->string('telefono_solicitante', 20)->nullable();
            
            // Datos del visitante
            $table->string('nombre_visitante', 100);
            $table->string('apellido_visitante', 100);
            $table->string('motivo', 255);
            $table->date('fecha_ingreso');
            $table->time('hora_inicio');
            $table->time('hora_fin');
            
            // Estado de la solicitud
            $table->enum('estado', ['pendiente', 'aprobada', 'denegada'])->default('pendiente');
            $table->dateTime('fecha_solicitud')->useCurrent();
            $table->text('motivo_denegacion')->nullable();
            
            // Datos de respuesta del administrador
            $table->integer('id_admin_responsable')->nullable();
            $table->dateTime('fecha_respuesta')->nullable();
            
            // Usuario temporal creado (si fue aprobada)
            $table->integer('id_usuario_temporal')->nullable();
            
            // Referencias
            $table->foreign('id_admin_responsable')
                ->references('id_usuario')
                ->on('usuario')
                ->onDelete('set null')
                ->onUpdate('cascade');
            
            $table->foreign('id_usuario_temporal')
                ->references('id_usuario')
                ->on('usuario')
                ->onDelete('set null')
                ->onUpdate('cascade');
            
            $table->index('estado');
            $table->index('fecha_solicitud');
            $table->index('id_admin_responsable');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('solicitud_visitante');
    }
};

