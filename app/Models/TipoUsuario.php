<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoUsuario extends Model
{
    protected $table = 'tipousuario';
    protected $primaryKey = 'id_tipo_usuario';
    public $timestamps = false;

    protected $fillable = [
        'nombre_tipo',
        'descripcion'
    ];

    public function usuarios()
    {
        return $this->hasMany(Usuario::class, 'id_tipo_usuario', 'id_tipo_usuario');
    }
}
