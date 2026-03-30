<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('credencial', function (Blueprint $table) {
            $table->increments('id_credencial');
            $table->unsignedInteger('id_usuario');
            $table->string('uid_nfc', 50)->unique();
            $table->enum('tipo_credencial', ['fisica', 'movil']);
            $table->dateTime('fecha_asignacion')->useCurrent();
            $table->boolean('activa')->default(true);
            $table->text('observaciones')->nullable();
            
            $table->foreign('id_usuario')
                ->references('id_usuario')
                ->on('usuario')
                ->onDelete('cascade')
                ->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credencial');
    }
};
