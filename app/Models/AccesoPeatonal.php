<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccesoPeatonal extends Model
{
    protected $table = 'accesopeatonal';
    protected $primaryKey = 'id_acceso_peatonal';
    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'id_credencial',
        'tipo',
        'resultado',
        'id_motivo_denegacion',
        'id_lector'
    ];

    protected $casts = [
        'fecha_hora' => 'datetime'
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    public function credencial()
    {
        return $this->belongsTo(Credencial::class, 'id_credencial', 'id_credencial');
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
