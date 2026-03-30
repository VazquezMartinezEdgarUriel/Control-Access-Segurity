<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Alerta extends Model
{
    protected $table = 'alerta';
    protected $primaryKey = 'id_alerta';
    public $timestamps = false;

    protected $fillable = [
        'id_tipo_alerta',
        'descripcion',
        'id_usuario',
        'id_acceso_peatonal',
        'id_acceso_vehicular',
        'atendida',
        'id_usuario_atencion',
        'fecha_atencion'
    ];

    protected $casts = [
        'atendida' => 'boolean',
        'fecha_hora' => 'datetime',
        'fecha_atencion' => 'datetime'
    ];

    public function tipoAlerta()
    {
        return $this->belongsTo(TipoAlerta::class, 'id_tipo_alerta', 'id_tipo_alerta');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    public function usuarioAtencion()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario_atencion', 'id_usuario');
    }

    public function accesoPeatonal()
    {
        return $this->belongsTo(AccesoPeatonal::class, 'id_acceso_peatonal', 'id_acceso_peatonal');
    }

    public function accesoVehicular()
    {
        return $this->belongsTo(AccesoVehicular::class, 'id_acceso_vehicular', 'id_acceso_vehicular');
    }
}
