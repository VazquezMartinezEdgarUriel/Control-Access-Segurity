<?php

namespace App\Http\Controllers;

use App\Models\Credencial;
use App\Models\Alerta;
use Illuminate\Http\Request;

class CredencialController extends Controller
{
    public function index()
    {
        return response()->json(Credencial::with('usuario.persona')->get());
    }

    public function show($id)
    {
        $credencial = Credencial::with('usuario.persona')->find($id);
        return $credencial ? response()->json($credencial) : response()->json(['error' => 'No encontrado'], 404);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_usuario' => 'required|exists:usuario,id_usuario',
            'uid_nfc' => 'required|unique:credencial',
            'activa' => 'boolean',
            'fecha_expiracion' => 'nullable|date',
            'observaciones_credencial' => 'nullable|string',
            'observaciones' => 'nullable|string'
        ]);

        // Mapear observaciones → observaciones_credencial si viene del frontend
        if (empty($validated['observaciones_credencial']) && !empty($validated['observaciones'])) {
            $validated['observaciones_credencial'] = $validated['observaciones'];
        }
        unset($validated['observaciones']);

        $credencial = Credencial::create($validated);
        return response()->json($credencial->load('usuario'), 201);
    }

    public function update(Request $request, $id)
    {
        $credencial = Credencial::find($id);
        if (!$credencial) return response()->json(['error' => 'No encontrado'], 404);

        $data = $request->only('uid_nfc', 'activa', 'fecha_expiracion', 'observaciones_credencial');
        // Mapear observaciones → observaciones_credencial
        if ($request->has('observaciones') && !$request->has('observaciones_credencial')) {
            $data['observaciones_credencial'] = $request->input('observaciones');
        }

        $credencial->update($data);
        return response()->json($credencial);
    }

    public function destroy($id)
    {
        Credencial::find($id)?->delete();
        return response()->json(['success' => true]);
    }

    public function porUsuario($usuarioId)
    {
        $credenciales = Credencial::where('id_usuario', $usuarioId)->get();
        return response()->json($credenciales);
    }

    /**
     * Valida una tarjeta NFC por su UID.
     * Devuelve datos del usuario, estado de credencial y vigencia.
     */
    public function validarNfc(Request $request)
    {
        $request->validate(['uid_nfc' => 'required|string']);

        $credencial = Credencial::with('usuario.persona', 'usuario.vigencias')
            ->where('uid_nfc', $request->uid_nfc)
            ->first();

        if (!$credencial) {
            // Crear alerta de tarjeta no registrada
            Alerta::create([
                'id_tipo_alerta' => 1,  // Credencial no registrada
                'descripcion' => "Intento de validación: Tarjeta NFC no registrada ($request->uid_nfc)",
                'fecha_hora' => now()
            ]);

            return response()->json([
                'validacion' => 'denegado',
                'mensaje' => 'Tarjeta no registrada en el sistema',
                'uid_nfc' => $request->uid_nfc,
                'timestamp' => now()->toISOString()
            ], 200);
        }

        if (!$credencial->activa) {
            // Crear alerta de credencial desactivada
            Alerta::create([
                'id_tipo_alerta' => 2,  // Credencial desactivada
                'descripcion' => "Intento de validación: Credencial desactivada del usuario " . ($credencial->usuario?->persona?->nombre_completo ?? 'Desconocido'),
                'id_usuario' => $credencial->id_usuario,
                'fecha_hora' => now()
            ]);

            return response()->json([
                'validacion' => 'denegado',
                'mensaje' => 'Credencial desactivada',
                'uid_nfc' => $request->uid_nfc,
                'usuario' => $credencial->usuario?->persona?->nombre_completo,
                'timestamp' => now()->toISOString()
            ], 200);
        }

        if ($credencial->fecha_expiracion && $credencial->fecha_expiracion->isPast()) {
            // Crear alerta de credencial expirada
            Alerta::create([
                'id_tipo_alerta' => 3,  // Credencial expirada
                'descripcion' => "Intento de validación: Credencial expirada el " . $credencial->fecha_expiracion->format('d/m/Y') . " - Usuario: " . ($credencial->usuario?->persona?->nombre_completo ?? 'Desconocido'),
                'id_usuario' => $credencial->id_usuario,
                'fecha_hora' => now()
            ]);

            return response()->json([
                'validacion' => 'denegado',
                'mensaje' => 'Credencial expirada (venció el ' . $credencial->fecha_expiracion->format('d/m/Y') . ')',
                'uid_nfc' => $request->uid_nfc,
            // Crear alerta de usuario inactivo
            Alerta::create([
                'id_tipo_alerta' => 4,  // Usuario inactivo
                'descripcion' => "Intento de validación: Usuario inactivo - " . ($usuario?->persona?->nombre_completo ?? 'Desconocido'),
                'id_usuario' => $usuario?->id_usuario,
                'fecha_hora' => now()
            ]);

                'usuario' => $credencial->usuario?->persona?->nombre_completo,
                'fecha_expiracion' => $credencial->fecha_expiracion->toDateString(),
                'timestamp' => now()->toISOString()
            ], 200);
        }

        $usuario = $credencial->usuario;
        if (!$usuario || !$usuario->activo) {
            return response()->json([
                'validacion' => 'denegado',
                'mensaje' => 'Usuario inactivo',
                'uid_nfc' => $request->uid_nfc,
                'usuario' => $usuario?->persona?->nombre_completo,
                'timestamp' => now()->toISOString()
            ], 200);
        }

        // Verificar vigencia activa
        $vigencia = $usuario->vigencias()
            ->where('activo', true)
            ->orderBy('vigencia_fin', 'desc')
            ->first();

        $vigenciaExpirada = false;
        $vigenciaInfo = null;
        if ($vigencia) {
            $vigenciaInfo = [
                'inicio' => $vigencia->vigencia_inicio,
        // Si la vigencia expiró, crear una alerta
        if ($vigenciaExpirada) {
            Alerta::create([
                'id_tipo_alerta' => 5,  // Vigencia expirada
                'descripcion' => "Alerta: Vigencia expirada del usuario " . ($usuario->persona?->nombre_completo ?? 'Desconocido') . " expiró el " . $vigencia->vigencia_fin->format('d/m/Y'),
                'id_usuario' => $usuario->id_usuario,
                'fecha_hora' => now()
            ]);
        }

                'fin' => $vigencia->vigencia_fin,
                'activa' => $vigencia->activo
            ];
            if ($vigencia->vigencia_fin && $vigencia->vigencia_fin->isPast()) {
                $vigenciaExpirada = true;
            }
        }

        return response()->json([
            'validacion' => $vigenciaExpirada ? 'advertencia' : 'autorizado',
            'mensaje' => $vigenciaExpirada
                ? 'Acceso autorizado - Vigencia expirada'
                : 'Acceso autorizado',
            'uid_nfc' => $request->uid_nfc,
            'usuario' => $usuario->persona?->nombre_completo,
            'email' => $usuario->persona?->email,
            'telefono' => $usuario->persona?->telefono,
            'tipo_usuario' => $usuario->tipo_usuario,
            'credencial_activa' => $credencial->activa,
            'fecha_asignacion' => $credencial->fecha_asignacion,
            'fecha_expiracion' => $credencial->fecha_expiracion,
            'vigencia' => $vigenciaInfo,
            'timestamp' => now()->toISOString()
        ], 200);
    }
}
