<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HorarioAcceso extends Model
{
    protected $table = 'horarioacceso';
    protected $primaryKey = 'id_horario';
    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'dia_semana',
        'hora_inicio',
        'hora_fin',
        'activo'
    ];

    protected $casts = [
        'activo' => 'boolean'
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }
}
