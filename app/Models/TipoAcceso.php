<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoAcceso extends Model
{
    protected $table = 'tipoacceso';
    protected $primaryKey = 'id_tipo_acceso';
    public $timestamps = false;

    protected $fillable = [
        'nombre_tipo'
    ];

    public function lectores()
    {
        return $this->hasMany(Lector::class, 'id_tipo_acceso', 'id_tipo_acceso');
    }
}
