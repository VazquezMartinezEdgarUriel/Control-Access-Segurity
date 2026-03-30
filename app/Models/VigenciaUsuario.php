<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VigenciaUsuario extends Model
{
    protected $table = 'vigenciausuario';
    protected $primaryKey = 'id_vigencia';
    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'vigencia_inicio',
        'vigencia_fin',
        'activo',
        'fecha_registro'
    ];

    protected $casts = [
        'vigencia_inicio' => 'date',
        'vigencia_fin' => 'date',
        'activo' => 'boolean',
        'fecha_registro' => 'datetime'
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }
}
