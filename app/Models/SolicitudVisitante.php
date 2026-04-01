<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SolicitudVisitante extends Model
{
    protected $table = 'solicitud_visitante';
    protected $primaryKey = 'id_solicitud';
    public $timestamps = false;

    protected $fillable = [
        'nombre_solicitante',
        'apellido_solicitante',
        'email_solicitante',
        'telefono_solicitante',
        'nombre_visitante',
        'apellido_visitante',
        'motivo',
        'fecha_ingreso',
        'hora_inicio',
        'hora_fin',
        'estado',
        'motivo_denegacion',
        'id_admin_responsable',
        'id_usuario_temporal',
    ];

    protected $casts = [
        'fecha_solicitud' => 'datetime',
        'fecha_respuesta' => 'datetime',
        'fecha_ingreso' => 'date',
    ];

    // Relaciones
    public function adminResponsable()
    {
        return $this->belongsTo(Usuario::class, 'id_admin_responsable', 'id_usuario');
    }

    public function usuarioTemporal()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario_temporal', 'id_usuario');
    }

    // Scopes
    public function scopePendientes($query)
    {
        return $query->where('estado', 'pendiente');
    }

    public function scopeAprobadas($query)
    {
        return $query->where('estado', 'aprobada');
    }

    public function scopeDenegadas($query)
    {
        return $query->where('estado', 'denegada');
    }

    // Atributos derivados
    public function getNombreCompletoSolicitanteAttribute()
    {
        return "{$this->nombre_solicitante} {$this->apellido_solicitante}";
    }

    public function getNombreCompletoVisitanteAttribute()
    {
        return "{$this->nombre_visitante} {$this->apellido_visitante}";
    }

    public function getEstadoColorAttribute()
    {
        return match($this->estado) {
            'pendiente' => 'warning',
            'aprobada' => 'success',
            'denegada' => 'danger',
            default => 'secondary'
        };
    }

    public function getEstadoLabelAttribute()
    {
        return match($this->estado) {
            'pendiente' => 'Pendiente',
            'aprobada' => 'Aprobada',
            'denegada' => 'Denegada',
            default => 'Desconocido'
        };
    }
}
