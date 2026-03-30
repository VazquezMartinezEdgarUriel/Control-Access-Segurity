<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuario', function (Blueprint $table) {
            $table->increments('id_usuario');
            $table->string('nombre_completo', 100);
            $table->enum('tipo_usuario', ['alumno', 'docente', 'empleado', 'visitante', 'proveedor', 'otro']);
            $table->string('email', 100)->unique()->nullable();
            $table->string('telefono', 20)->nullable();
            $table->dateTime('fecha_registro')->useCurrent();
            $table->date('vigencia_inicio')->nullable();
            $table->date('vigencia_fin')->nullable();
            $table->boolean('activo')->default(true);
            $table->unsignedInteger('id_direccion')->nullable();
            
            $table->foreign('id_direccion')
                ->references('id_direccion')
                ->on('direccion')
                ->onDelete('set null')
                ->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuario');
    }
};
