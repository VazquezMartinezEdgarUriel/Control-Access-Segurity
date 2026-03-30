<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehiculo extends Model
{
    protected $table = 'vehiculo';
    protected $primaryKey = 'id_vehiculo';
    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'placa',
        'marca',
        'modelo',
        'color',
        'activo'
    ];

    protected $casts = [
        'activo' => 'boolean'
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    public function accesosVehiculares()
    {
        return $this->hasMany(AccesoVehicular::class, 'id_vehiculo', 'id_vehiculo');
    }
}
