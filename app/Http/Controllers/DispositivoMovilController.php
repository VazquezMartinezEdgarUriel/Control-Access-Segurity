<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\Credencial;
use App\Models\DispositivoMovil;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DispositivoMovilController extends Controller
{
    /**
     * Registrar un nuevo dispositivo móvil
     */
    public function registrar(Request $request)
    {
        $validated = $request->validate([
            'id_usuario' => 'required|exists:usuario,id_usuario',
            'credencial_uid' => 'required|exists:credencial,uid_nfc',
            'nombre_dispositivo' => 'required|string|max:100',
            'uuid' => 'required|string|unique:dispositivos_moviles',
            'imei' => 'nullable|string|unique:dispositivos_moviles',
            'tipo_dispositivo' => 'required|in:android,ios,web',
            'so_version' => 'nullable|string',
            'tiene_nfc' => 'boolean',
            'metodo_autenticacion' => 'required|in:nfc_emulation,biometrico,pin,codigo_qr',
        ]);

        // Verificar que la credencial pertenece al usuario
        $credencial = Credencial::where('uid_nfc', $validated['credencial_uid'])
            ->where('id_usuario', $validated['id_usuario'])
            ->firstOrFail();

        // Generar UID Virtual HCE (identidad digital única para este dispositivo)
        $uidVirtualHCE = DispositivoMovil::generarUidVirtualHCE(
            $validated['uuid'],
            $validated['credencial_uid']
        );

        // Crear dispositivo
        $dispositivo = DispositivoMovil::create([
            'id_usuario' => $validated['id_usuario'],
            'id_credencial' => $credencial->id_credencial,
            'nombre_dispositivo' => $validated['nombre_dispositivo'],
            'uuid' => $validated['uuid'],
            'imei' => $validated['imei'] ?? null,
            'tipo_dispositivo' => $validated['tipo_dispositivo'],
            'so_version' => $validated['so_version'],
            'tiene_nfc' => $validated['tiene_nfc'] ?? false,
            'metodo_autenticacion' => $validated['metodo_autenticacion'],
            'uid_virtual_hce' => $uidVirtualHCE,
            'fecha_registro' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Dispositivo registrado correctamente',
            'dispositivo' => $dispositivo,
            'usuario' => $dispositivo->usuario,
            'hce_info' => [
                'uid_virtual' => $dispositivo->obtenerUidVirtualHCE(),
                'tipo' => 'HOST_CARD_EMULATION',
                'descripcion' => 'Identidad digital única del dispositivo (no es copia de la tarjeta)',
            ],
        ], 201);
    }

    /**
     * Obtener dispositivos de un usuario
     */
    public function obtenerDelUsuario($usuarioId)
    {
        $dispositivos = DispositivoMovil::where('id_usuario', $usuarioId)
            ->with(['usuario', 'credencial'])
            ->get();

        return response()->json($dispositivos);
    }

    /**
     * Obtener un dispositivo específico
     */
    public function obtener($dispositivoId)
    {
        $dispositivo = DispositivoMovil::with(['usuario', 'credencial'])
            ->findOrFail($dispositivoId);

        return response()->json($dispositivo);
    }

    /**
     * Actualizar dispositivo
     */
    public function actualizar(Request $request, $dispositivoId)
    {
        $dispositivo = DispositivoMovil::findOrFail($dispositivoId);

        $validated = $request->validate([
            'nombre_dispositivo' => 'string|max:100',
            'metodo_autenticacion' => 'in:nfc_emulation,biometrico,pin,codigo_qr',
            'tiene_nfc' => 'boolean',
            'estado' => 'in:activo,inactivo,bloqueado',
        ]);

        $dispositivo->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Dispositivo actualizado',
            'dispositivo' => $dispositivo,
        ]);
    }

    /**
     * Registrar acceso desde dispositivo
     */
    public function registrarAcceso(Request $request, $dispositivoId)
    {
        $dispositivo = DispositivoMovil::findOrFail($dispositivoId);

        if (!$dispositivo->estaActivo()) {
            return response()->json([
                'success' => false,
                'message' => 'Dispositivo no está activo',
            ], 403);
        }

        $ip = $request->ip();
        $ubicacion = $request->input('ubicacion');

        $dispositivo->registrarAcceso($ip, $ubicacion);

        return response()->json([
            'success' => true,
            'message' => 'Acceso registrado',
            'dispositivo' => $dispositivo,
        ]);
    }

    /**
     * Verificar credenciales del dispositivo
     */
    public function verificarCredencial(Request $request)
    {
        $validated = $request->validate([
            'uuid' => 'required|string',
            'pin' => 'nullable|string|max:10',
            'metodo' => 'nullable|in:nfc_emulation,biometrico,pin,codigo_qr',
        ]);

        $dispositivo = DispositivoMovil::where('uuid', $validated['uuid'])
            ->with(['usuario', 'credencial'])
            ->first();

        if (!$dispositivo) {
            return response()->json([
                'success' => false,
                'message' => 'Dispositivo no registrado',
            ], 404);
        }

        // Verificar si está bloqueado
        if ($dispositivo->estaBloqueado()) {
            return response()->json([
                'success' => false,
                'message' => 'Dispositivo bloqueado. Contacta al administrador.',
            ], 403);
        }

        // Verificar si está inactivo
        if (!$dispositivo->estaActivo()) {
            $dispositivo->incrementarIntentosFallidos();
            return response()->json([
                'success' => false,
                'message' => 'Dispositivo inactivo',
            ], 403);
        }

        // Validar método según configuración
        $metodo = $validated['metodo'] ?? $dispositivo->metodo_autenticacion;

        // Si el método requiere PIN
        if ($metodo === 'pin' || $dispositivo->metodo_autenticacion === 'pin') {
            if (!$validated['pin']) {
                $dispositivo->incrementarIntentosFallidos();
                return response()->json([
                    'success' => false,
                    'message' => 'PIN requerido',
                ], 400);
            }

            // Verificar PIN
            // NOTA: por ahora aceptamos cualquier PIN numérico de 5 dígitos
            // En producción, almacenar PIN hasheado y comparar aquí
            if (!preg_match('/^\d{5}$/', $validated['pin'])) {
                $dispositivo->incrementarIntentosFallidos();
                return response()->json([
                    'success' => false,
                    'message' => 'PIN inválido (debe ser 5 dígitos)',
                ], 400);
            }
        }

        // Registrar acceso exitoso
        $dispositivo->registrarAcceso($request->ip(), $request->input('ubicacion'));

        // Resetear intentos fallidos
        $dispositivo->update(['intentos_fallidos' => 0]);

        return response()->json([
            'success' => true,
            'message' => 'Credencial válida',
            'dispositivo' => $dispositivo,
            'usuario' => $dispositivo->usuario,
            'credencial' => $dispositivo->credencial,
            'uid' => $dispositivo->obtenerUidCredencial(),
            'hce' => [
                'uid_virtual' => $dispositivo->obtenerUidVirtualHCE(),
                'tipo' => 'HOST_CARD_EMULATION',
                'descripcion' => 'Identidad digital única del dispositivo',
                'info' => $dispositivo->obtenerInfoHCE(),
            ],
        ]);
    }

    /**
     * Bloquear dispositivo
     */
    public function bloquear($dispositivoId)
    {
        $dispositivo = DispositivoMovil::findOrFail($dispositivoId);
        $dispositivo->update(['estado' => 'bloqueado', 'fecha_bloqueo' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Dispositivo bloqueado',
        ]);
    }

    /**
     * Desbloquear dispositivo
     */
    public function desbloquear($dispositivoId)
    {
        $dispositivo = DispositivoMovil::findOrFail($dispositivoId);
        $dispositivo->desbloquear();

        return response()->json([
            'success' => true,
            'message' => 'Dispositivo desbloqueado',
        ]);
    }

    /**
     * Eliminar dispositivo
     */
    public function eliminar($dispositivoId)
    {
        $dispositivo = DispositivoMovil::findOrFail($dispositivoId);
        $dispositivo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Dispositivo eliminado',
        ]);
    }

    /**
     * Obtener QR de registro
     */
    public function generarQRRegistro(Request $request)
    {
        $validated = $request->validate([
            'id_usuario' => 'required|exists:usuario,id_usuario',
            'credencial_uid' => 'required|exists:credencial,uid_nfc',
        ]);

        // Generar código único
        $codigoRegistro = Str::random(16);

        // Datos del QR
        $datosQR = [
            'accion' => 'registrar_dispositivo',
            'usuario_id' => $validated['usuario_id'],
            'credencial_uid' => $validated['credencial_uid'],
            'codigo' => $codigoRegistro,
            'timestamp' => now()->toString(),
            'url_registro' => route('dispositivo.formulario-registro'),
        ];

        // En producción: generar QR actual y guardarlo
        // Por ahora retornamos los datos con instrucciones

        return response()->json([
            'success' => true,
            'codigo_registro' => $codigoRegistro,
            'datos_qr' => base64_encode(json_encode($datosQR)),
            'url_registro' => route('dispositivo.formulario-registro') . '?codigo=' . $codigoRegistro,
            'instrucciones' => 'Escanea este QR desde tu celular o abre la URL',
        ]);
    }
}
