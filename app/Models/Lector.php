<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lector extends Model
{
    protected $table = 'lector';
    protected $primaryKey = 'id_lector';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'ubicacion',
        'id_tipo_acceso'
    ];

    public function tipoAcceso()
    {
        return $this->belongsTo(TipoAcceso::class, 'id_tipo_acceso', 'id_tipo_acceso');
    }

    public function accesosPeatonales()
    {
        return $this->hasMany(AccesoPeatonal::class, 'id_lector', 'id_lector');
    }

    public function accesosVehiculares()
    {
        return $this->hasMany(AccesoVehicular::class, 'id_lector', 'id_lector');
    }
}
