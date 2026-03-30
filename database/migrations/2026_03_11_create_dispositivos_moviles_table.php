<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('dispositivos_moviles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->onDelete('cascade');
            $table->foreignId('credencial_id')->constrained('credenciales')->onDelete('cascade');
            $table->string('nombre_dispositivo'); // ej: "iPhone de Juan", "Samsung de María"
            $table->string('uuid')->unique(); // Identificador único del dispositivo
            $table->string('uid_virtual_hce')->unique()->nullable(); // UID Virtual HCE (Host Card Emulation) - Identidad digital única
            $table->string('imei')->nullable()->unique(); // IMEI del celular (opcional)
            $table->enum('tipo_dispositivo', ['android', 'ios', 'web'])->default('android');
            $table->string('so_version')->nullable(); // Versión del SO
            $table->enum('metodo_autenticacion', ['nfc_emulation', 'biometrico', 'pin', 'codigo_qr'])->default('biometrico');
            $table->boolean('tiene_nfc')->default(false);
            $table->enum('estado', ['activo', 'inactivo', 'bloqueado'])->default('activo');
            $table->timestamp('fecha_registro');
            $table->timestamp('ultimo_acceso')->nullable();
            $table->ipAddress('ultima_ip')->nullable();
            $table->text('ubicacion_gps')->nullable(); // JSON con lat/lng
            $table->integer('intentos_fallidos')->default(0);
            $table->timestamp('fecha_bloqueo')->nullable();
            $table->text('notas')->nullable();
            $table->timestamps();
            
            // Índices
            $table->index(['usuario_id', 'estado']);
            $table->index('uuid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dispositivos_moviles');
    }
};
