<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DispositivoMovil extends Model
{
    use HasFactory;

    protected $table = 'dispositivos_moviles';

    protected $fillable = [
        'id_usuario',
        'id_credencial',
        'nombre_dispositivo',
        'uuid',
        'imei',
        'tipo_dispositivo',
        'so_version',
        'metodo_autenticacion',
        'tiene_nfc',
        'uid_virtual_hce',
        'estado',
        'fecha_registro',
        'ultimo_acceso',
        'ultima_ip',
        'ubicacion_gps',
        'intentos_fallidos',
        'fecha_bloqueo',
        'notas'
    ];

    protected $casts = [
        'fecha_registro' => 'datetime',
        'ultimo_acceso' => 'datetime',
        'fecha_bloqueo' => 'datetime',
        'tiene_nfc' => 'boolean',
    ];

    // Relaciones
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    public function credencial()
    {
        return $this->belongsTo(Credencial::class, 'id_credencial', 'id_credencial');
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('estado', 'activo');
    }

    public function scopeDelUsuario($query, $usuarioId)
    {
        return $query->where('id_usuario', $usuarioId);
    }

    public function scopeConNFC($query)
    {
        return $query->where('tiene_nfc', true);
    }

    // Métodos
    public function registrarAcceso($ip, $ubicacion = null)
    {
        $this->ultimo_acceso = now();
        $this->ultima_ip = $ip;
        if ($ubicacion) {
            $this->ubicacion_gps = json_encode($ubicacion);
        }
        $this->intentos_fallidos = 0;
        $this->save();
    }

    public function incrementarIntentosFallidos()
    {
        $this->intentos_fallidos++;
        
        // Bloquear después de 5 intentos fallidos
        if ($this->intentos_fallidos >= 5) {
            $this->estado = 'bloqueado';
            $this->fecha_bloqueo = now();
        }
        
        $this->save();
    }

    public function desbloquear()
    {
        $this->estado = 'activo';
        $this->intentos_fallidos = 0;
        $this->fecha_bloqueo = null;
        $this->save();
    }

    public function obtenerUidCredencial()
    {
        return $this->credencial->uid_nfc ?? null;
    }

    /**
     * Obtener UID Virtual HCE del dispositivo
     * Este es el identificador digital único creado para este dispositivo específico
     * No es una copia de la tarjeta física, sino una identidad digital nueva
     */
    public function obtenerUidVirtualHCE()
    {
        return $this->uid_virtual_hce;
    }

    /**
     * Generar UID Virtual HCE único para el dispositivo
     * Basado en: UUID + Credencial + Timestamp
     * Formato: HCE[8 caracteres] - UID único para emulación NFC
     */
    public static function generarUidVirtualHCE($uuid, $credencialUid)
    {
        // Generar UID virtual único basado en datos del dispositivo
        // Formato: HCE + 16 caracteres hexadecimales
        $datos = $uuid . $credencialUid . now()->timestamp;
        $hash = substr(hash('sha256', $datos), 0, 16);
        return 'HCE' . strtoupper($hash);
    }

    /**
     * Información de la identidad digital (HCE) para lectura NFC
     */
    public function obtenerInfoHCE()
    {
        return [
            'type' => 'HOST_CARD_EMULATION',
            'uid_virtual' => $this->uid_virtual_hce,
            'dispositivo_id' => $this->id,
            'usuario_id' => $this->id_usuario,
            'credencial_original' => $this->obtenerUidCredencial(),
            'dispositivo' => $this->nombre_dispositivo,
            'tipo_dispositivo' => $this->tipo_dispositivo,
            'estado' => $this->estado,
            'fecha_creacion' => $this->created_at,
        ];
    }

    public function estaActivo()
    {
        return $this->estado === 'activo';
    }

    public function estaBloqueado()
    {
        return $this->estado === 'bloqueado';
    }
}
