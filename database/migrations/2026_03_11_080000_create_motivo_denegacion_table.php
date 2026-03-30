<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('motivo_denegacion', function (Blueprint $table) {
            $table->tinyIncrements('id_motivo');
            $table->string('codigo', 30)->unique();
            $table->string('descripcion', 100);
            $table->boolean('aplica_peatonal')->default(true);
            $table->boolean('aplica_vehicular')->default(true);
            $table->timestamp('creado_en')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('motivo_denegacion');
    }
};
