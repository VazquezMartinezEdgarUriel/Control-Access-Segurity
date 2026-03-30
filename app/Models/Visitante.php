<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Visitante extends Model
{
    protected $table = 'visitante';
    protected $primaryKey = 'id_visitante';
    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'empresa',
        'motivo_visita',
        'id_autorizado_por',
        'fecha_entrada_estimada',
        'fecha_salida_estimada'
    ];

    protected $casts = [
        'fecha_entrada_estimada' => 'datetime',
        'fecha_salida_estimada' => 'datetime'
    ];

    protected $appends = ['motivo', 'autorizado_por'];

    // Accessor: motivo mapea a motivo_visita (compatibilidad frontend)
    public function getMotivoAttribute()
    {
        return $this->motivo_visita;
    }

    // Accessor: autorizado_por devuelve nombre del usuario que autorizó
    public function getAutorizadoPorAttribute()
    {
        if ($this->id_autorizado_por) {
            $auth = $this->usuarioAutorizador;
            return $auth && $auth->persona ? $auth->persona->nombre_completo : null;
        }
        return null;
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    // Renombrado para evitar conflicto con accessor getAutorizadoPorAttribute
    public function usuarioAutorizador()
    {
        return $this->belongsTo(Usuario::class, 'id_autorizado_por', 'id_usuario');
    }
}
