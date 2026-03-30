<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccesoVehicular extends Model
{
    protected $table = 'accesovehicular';
    protected $primaryKey = 'id_acceso_vehicular';
    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'id_vehiculo',
        'placa_leida',
        'resultado',
        'id_motivo_denegacion',
        'imagen_placa',
        'id_lector'
    ];

    protected $casts = [
        'fecha_hora' => 'datetime'
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class, 'id_vehiculo', 'id_vehiculo');
    }

    public function motivoDenegacion()
    {
        return $this->belongsTo(MotivoDenegacion::class, 'id_motivo_denegacion', 'id_motivo');
    }

    public function lector()
    {
        return $this->belongsTo(Lector::class, 'id_lector', 'id_lector');
    }
}
