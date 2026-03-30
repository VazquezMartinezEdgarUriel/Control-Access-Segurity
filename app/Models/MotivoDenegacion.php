<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MotivoDenegacion extends Model
{
    protected $table = 'motivodenegacion';
    protected $primaryKey = 'id_motivo';
    public $timestamps = false;

    protected $fillable = [
        'codigo',
        'descripcion',
        'aplica_peatonal',
        'aplica_vehicular'
    ];

    protected $casts = [
        'aplica_peatonal' => 'boolean',
        'aplica_vehicular' => 'boolean'
    ];
}
