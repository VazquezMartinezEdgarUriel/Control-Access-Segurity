<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alerta', function (Blueprint $table) {
            $table->bigIncrements('id_alerta');
            $table->enum('tipo_alerta', ['acceso_no_autorizado', 'discrepancia_placa', 'credencial_vencida', 'otro']);
            $table->text('descripcion')->nullable();
            $table->dateTime('fecha_hora')->useCurrent();
            $table->unsignedInteger('id_usuario')->nullable();
            $table->unsignedBigInteger('id_acceso_peatonal')->nullable();
            $table->unsignedBigInteger('id_acceso_vehicular')->nullable();
            $table->boolean('atendida')->default(false);
            $table->unsignedInteger('atendida_por')->nullable();
            $table->dateTime('fecha_atencion')->nullable();
            
            $table->foreign('id_usuario')
                ->references('id_usuario')
                ->on('usuario')
                ->onDelete('set null')
                ->onUpdate('cascade');
            
            $table->foreign('id_acceso_peatonal')
                ->references('id_acceso_peatonal')
                ->on('acceso_peatonal')
                ->onDelete('set null')
                ->onUpdate('cascade');
            
            $table->foreign('id_acceso_vehicular')
                ->references('id_acceso_vehicular')
                ->on('acceso_vehicular')
                ->onDelete('set null')
                ->onUpdate('cascade');
            
            $table->foreign('atendida_por')
                ->references('id_usuario')
                ->on('usuario')
                ->onDelete('set null')
                ->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alerta');
    }
};
