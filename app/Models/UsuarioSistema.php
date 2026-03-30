<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;

class UsuarioSistema extends Model
{
    protected $table = 'UsuarioSistema';
    protected $primaryKey = 'id_usuario_sistema';
    public $timestamps = false;

    protected $fillable = [
        'username',
        'password_hash',
        'id_usuario',
        'rol',
        'activo'
    ];

    protected $hidden = ['password_hash'];

    protected $casts = [
        'activo' => 'boolean',
        'fecha_creacion' => 'datetime'
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    public function setPasswordHashAttribute($value)
    {
        $this->attributes['password_hash'] = Hash::make($value);
    }
}
