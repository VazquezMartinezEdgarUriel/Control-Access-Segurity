<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Usuario extends Model
{
    protected $table = 'usuario';
    protected $primaryKey = 'id_usuario';
    public $timestamps = false;
    
    protected $fillable = [
        'id_persona',
        'id_tipo_usuario',
        'activo',
        'observaciones_usuario'
    ];

    protected $casts = [
        'activo' => 'boolean'
    ];

    protected $appends = [
        'nombre_completo',
        'email',
        'telefono',
        'tipo_usuario',
        'vigencia_inicio',
        'vigencia_fin'
    ];

    // Accessors para compatibilidad con frontend
    public function getNombreCompletoAttribute()
    {
        return $this->persona?->nombre_completo;
    }

    public function getEmailAttribute()
    {
        return $this->persona?->email;
    }

    public function getTelefonoAttribute()
    {
        return $this->persona?->telefono;
    }

    public function getTipoUsuarioAttribute()
    {
        return $this->tipoDeUsuario?->nombre_tipo;
    }

    public function getVigenciaInicioAttribute()
    {
        $vigencia = $this->vigencias()->where('activo', true)->latest('id_vigencia')->first();
        return $vigencia?->vigencia_inicio;
    }

    public function getVigenciaFinAttribute()
    {
        $vigencia = $this->vigencias()->where('activo', true)->latest('id_vigencia')->first();
        return $vigencia?->vigencia_fin;
    }

    public function persona()
    {
        return $this->belongsTo(Persona::class, 'id_persona', 'id_persona');
    }

    public function tipoDeUsuario()
    {
        return $this->belongsTo(TipoUsuario::class, 'id_tipo_usuario', 'id_tipo_usuario');
    }

    public function vigencias()
    {
        return $this->hasMany(VigenciaUsuario::class, 'id_usuario', 'id_usuario');
    }

    public function credenciales()
    {
        return $this->hasMany(Credencial::class, 'id_usuario', 'id_usuario');
    }

    public function vehiculos()
    {
        return $this->hasMany(Vehiculo::class, 'id_usuario', 'id_usuario');
    }

    public function accesosPeatonales()
    {
        return $this->hasMany(AccesoPeatonal::class, 'id_usuario', 'id_usuario');
    }

    public function accesosVehiculares()
    {
        return $this->hasMany(AccesoVehicular::class, 'id_usuario', 'id_usuario');
    }

    public function horarios()
    {
        return $this->hasMany(HorarioAcceso::class, 'id_usuario', 'id_usuario');
    }

    public function visitante()
    {
        return $this->hasOne(Visitante::class, 'id_usuario', 'id_usuario');
    }

    public function alertas()
    {
        return $this->hasMany(Alerta::class, 'id_usuario', 'id_usuario');
    }

    public function dispositivosMoviles()
    {
        return $this->hasMany(DispositivoMovil::class, 'id_usuario', 'id_usuario');
    }
}
