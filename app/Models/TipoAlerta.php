<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoAlerta extends Model
{
    protected $table = 'tipoalerta';
    protected $primaryKey = 'id_tipo_alerta';
    public $timestamps = false;

    protected $fillable = [
        'nombre_tipo',
        'descripcion'
    ];

    public function alertas()
    {
        return $this->hasMany(Alerta::class, 'id_tipo_alerta', 'id_tipo_alerta');
    }
}
