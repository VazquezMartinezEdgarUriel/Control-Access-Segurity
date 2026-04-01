<?php

namespace App\Http\Controllers;

use App\Models\SolicitudVisitante;
use App\Models\Usuario;
use App\Models\Persona;
use App\Models\TipoUsuario;
use App\Models\Credencial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SolicitudVisitanteController extends Controller
{
    /**
     * Crear nueva solicitud de visitante (formulario público)
     */
    public function crearSolicitud(Request $request)
    {
        $validated = $request->validate([
            'nombre_solicitante' => 'required|string|max:100',
            'apellido_solicitante' => 'required|string|max:100',
            'email_solicitante' => 'required|email|max:150',
            'telefono_solicitante' => 'nullable|string|max:20',
            'nombre_visitante' => 'required|string|max:100',
            'apellido_visitante' => 'required|string|max:100',
            'motivo' => 'required|string|max:255',
            'fecha_ingreso' => 'required|date|after_or_equal:today',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
        ]);

        DB::beginTransaction();
        try {
            $solicitud = SolicitudVisitante::create($validated);
            
            // Aquí iría lógica de notificación al administrador
            $this->notificarAdministrador($solicitud);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Solicitud enviada correctamente',
                'id_solicitud' => $solicitud->id_solicitud,
                'estado' => $solicitud->estado
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'error' => 'Error al crear solicitud: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener solicitudes pendientes (para administrador)
     */
    public function obtenerSolicitudesPendientes()
    {
        $solicitudes = SolicitudVisitante::pendientes()
            ->orderBy('fecha_solicitud', 'desc')
            ->get()
            ->map(fn($s) => $this->formatearSolicitud($s));

        return response()->json([
            'success' => true,
            'total' => $solicitudes->count(),
            'solicitudes' => $solicitudes
        ]);
    }

    /**
     * Obtener todas las solicitudes con filtros
     */
    public function obtenerSolicitudes(Request $request)
    {
        $query = SolicitudVisitante::query();

        // Filtros
        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->has('desde')) {
            $query->whereDate('fecha_solicitud', '>=', $request->desde);
        }

        if ($request->has('hasta')) {
            $query->whereDate('fecha_solicitud', '<=', $request->hasta);
        }

        if ($request->has('buscar')) {
            $buscar = $request->buscar;
            $query->where(function($q) use ($buscar) {
                $q->where('nombre_solicitante', 'like', "%$buscar%")
                  ->orWhere('apellido_solicitante', 'like', "%$buscar%")
                  ->orWhere('nombre_visitante', 'like', "%$buscar%")
                  ->orWhere('apellido_visitante', 'like', "%$buscar%")
                  ->orWhere('email_solicitante', 'like', "%$buscar%");
            });
        }

        $solicitudes = $query->orderBy('fecha_solicitud', 'desc')
            ->paginate(20)
            ->through(fn($s) => $this->formatearSolicitud($s));

        return response()->json([
            'success' => true,
            'data' => $solicitudes
        ]);
    }

    /**
     * Obtener detalle de una solicitud
     */
    public function obtenerSolicitud($id)
    {
        $solicitud = SolicitudVisitante::with([
            'adminResponsable.persona',
            'usuarioTemporal.persona'
        ])->find($id);

        if (!$solicitud) {
            return response()->json([
                'success' => false,
                'error' => 'Solicitud no encontrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'solicitud' => $this->formatearSolicitud($solicitud)
        ]);
    }

    /**
     * Aprobar solicitud (crear usuario temporal)
     */
    public function aprobarSolicitud(Request $request, $id)
    {
        $solicitud = SolicitudVisitante::find($id);

        if (!$solicitud) {
            return response()->json([
                'success' => false,
                'error' => 'Solicitud no encontrada'
            ], 404);
        }

        if ($solicitud->estado !== 'pendiente') {
            return response()->json([
                'success' => false,
                'error' => 'Esta solicitud ya ha sido procesada'
            ], 400);
        }

        DB::beginTransaction();
        try {
            // 1. Crear persona
            $persona = Persona::create([
                'nombre_completo' => "{$solicitud->nombre_visitante} {$solicitud->apellido_visitante}",
                'email' => $solicitud->email_solicitante,
                'telefono' => $solicitud->telefono_solicitante,
                'numero_documento' => null,
            ]);

            // 2. Crear tipo de usuario (si no existe visitante temporal)
            $tipoVisitante = TipoUsuario::where('descripcion', 'VISITANTE TEMPORAL')->first();
            if (!$tipoVisitante) {
                $tipoVisitante = TipoUsuario::create([
                    'descripcion' => 'VISITANTE TEMPORAL',
                ]);
            }

            // 3. Crear usuario temporal
            $usuario = Usuario::create([
                'id_persona' => $persona->id_persona,
                'id_tipo_usuario' => $tipoVisitante->id_tipo_usuario,
                'activo' => true,
                'observaciones_usuario' => "Visitante temporal: {$solicitud->motivo}"
            ]);

            // 4. Crear credencial temporal (opcional)
            $credencial = Credencial::create([
                'id_usuario' => $usuario->id_usuario,
                'uid_nfc' => $this->generarUIDTemporal(),
                'activo' => true,
                'fecha_asignacion' => now(),
                'fecha_vencimiento' => Carbon::createFromDate($solicitud->fecha_ingreso)
                    ->setTime($solicitud->hora_fin[0], $solicitud->hora_fin[1])
                    ->addDay(),
            ]);

            // 5. Crear horario de acceso (opcional)
            $horario = \App\Models\HorarioAcceso::create([
                'id_usuario' => $usuario->id_usuario,
                'dia_semana' => Carbon::createFromDate($solicitud->fecha_ingreso)->dayOfWeek,
                'hora_inicio' => $solicitud->hora_inicio,
                'hora_fin' => $solicitud->hora_fin,
                'activo' => true,
            ]);

            // 6. Registrar en visitante
            \App\Models\Visitante::create([
                'id_usuario' => $usuario->id_usuario,
                'empresa' => 'Visitante Externo',
                'motivo' => $solicitud->motivo,
                'autorizado_por' => auth()->user()?->persona->nombre_completo ?? 'Sistema',
                'fecha_entrada_estimada' => Carbon::createFromDateTime(
                    $solicitud->fecha_ingreso,
                    $solicitud->hora_inicio
                ),
                'fecha_salida_estimada' => Carbon::createFromDateTime(
                    $solicitud->fecha_ingreso,
                    $solicitud->hora_fin
                ),
            ]);

            // 7. Actualizar solicitud
            $solicitud->update([
                'estado' => 'aprobada',
                'id_admin_responsable' => auth()->id(),
                'id_usuario_temporal' => $usuario->id_usuario,
                'fecha_respuesta' => now(),
            ]);

            // 8. Notificar solicitante
            $this->notificarAprobacion($solicitud);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Solicitud aprobada correctamente',
                'usuario_temporal' => [
                    'id' => $usuario->id_usuario,
                    'nombre' => $usuario->persona->nombre_completo,
                    'uid_nfc' => $credencial->uid_nfc,
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'error' => 'Error al aprobar solicitud: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Denegar solicitud
     */
    public function negarSolicitud(Request $request, $id)
    {
        $validated = $request->validate([
            'motivo_denegacion' => 'required|string|max:500',
        ]);

        $solicitud = SolicitudVisitante::find($id);

        if (!$solicitud) {
            return response()->json([
                'success' => false,
                'error' => 'Solicitud no encontrada'
            ], 404);
        }

        if ($solicitud->estado !== 'pendiente') {
            return response()->json([
                'success' => false,
                'error' => 'Esta solicitud ya ha sido procesada'
            ], 400);
        }

        DB::beginTransaction();
        try {
            $solicitud->update([
                'estado' => 'denegada',
                'motivo_denegacion' => $validated['motivo_denegacion'],
                'id_admin_responsable' => auth()->id(),
                'fecha_respuesta' => now(),
            ]);

            $this->notificarDenegacion($solicitud);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Solicitud denegada correctamente'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'error' => 'Error al denegar solicitud: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de solicitudes
     */
    public function obtenerEstadisticas()
    {
        $total = SolicitudVisitante::count();
        $pendientes = SolicitudVisitante::pendientes()->count();
        $aprobadas = SolicitudVisitante::aprobadas()->count();
        $denegadas = SolicitudVisitante::denegadas()->count();

        return response()->json([
            'success' => true,
            'estadisticas' => [
                'total' => $total,
                'pendientes' => $pendientes,
                'aprobadas' => $aprobadas,
                'denegadas' => $denegadas,
            ]
        ]);
    }

    /**
     * Métodos privados
     */

    private function formatearSolicitud($solicitud)
    {
        return [
            'id_solicitud' => $solicitud->id_solicitud,
            'solicitante' => $solicitud->nombre_completo_solicitante,
            'email' => $solicitud->email_solicitante,
            'telefono' => $solicitud->telefono_solicitante,
            'visitante' => $solicitud->nombre_completo_visitante,
            'motivo' => $solicitud->motivo,
            'fecha_ingreso' => $solicitud->fecha_ingreso->format('d/m/Y'),
            'hora_inicio' => $solicitud->hora_inicio,
            'hora_fin' => $solicitud->hora_fin,
            'estado' => $solicitud->estado_label,
            'estado_color' => $solicitud->estado_color,
            'fecha_solicitud' => $solicitud->fecha_solicitud->format('d/m/Y H:i'),
            'fecha_respuesta' => $solicitud->fecha_respuesta?->format('d/m/Y H:i'),
            'admin_responsable' => $solicitud->adminResponsable?->persona->nombre_completo,
            'motivo_denegacion' => $solicitud->motivo_denegacion,
        ];
    }

    private function notificarAdministrador($solicitud)
    {
        // Aquí irían notificaciones mediante email, WebSocket o base de datos
        \Log::info("Nueva solicitud de visitante: {$solicitud->nombre_completo_solicitante}");
    }

    private function notificarAprobacion($solicitud)
    {
        // Notificación al solicitante de aprobación
        \Log::info("Solicitud aprobada: {$solicitud->email_solicitante}");
    }

    private function notificarDenegacion($solicitud)
    {
        // Notificación al solicitante de denegación
        \Log::info("Solicitud denegada: {$solicitud->email_solicitante}");
    }

    private function generarUIDTemporal()
    {
        $timestamp = substr(time(), -4);
        $random = str_pad(rand(0, 999), 3, '0', STR_PAD_LEFT);
        return strtoupper(bin2hex(random_bytes(4))) . ":TEMP-{$timestamp}-{$random}";
    }
}
