<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Credencial extends Model
{
    protected $table = 'credencial';
    protected $primaryKey = 'id_credencial';
    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'uid_nfc',
        'activa',
        'fecha_expiracion',
        'observaciones_credencial'
    ];

    protected $casts = [
        'activa' => 'boolean',
        'fecha_asignacion' => 'datetime',
        'fecha_expiracion' => 'date'
    ];

    protected $appends = ['tipo_credencial', 'observaciones'];

    // Accessor: tipo_credencial siempre es 'fisica' (dispositivos moviles estan en otra tabla)
    public function getTipoCredencialAttribute()
    {
        return 'fisica';
    }

    // Accessor: observaciones mapea a observaciones_credencial
    public function getObservacionesAttribute()
    {
        return $this->observaciones_credencial;
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    public function accesosPeatonales()
    {
        return $this->hasMany(AccesoPeatonal::class, 'id_credencial', 'id_credencial');
    }
}
