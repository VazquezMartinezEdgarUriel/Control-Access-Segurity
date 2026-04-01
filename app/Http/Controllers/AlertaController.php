<?php

namespace App\Http\Controllers;

use App\Models\Alerta;
use Illuminate\Http\Request;

class AlertaController extends Controller
{
    /**
     * Obtiene todas las alertas
     */
    public function index(Request $request)
    {
        $limit = $request->get('limit', 50);
        $alertas = Alerta::with('tipoAlerta', 'usuario.persona', 'accesoPeatonal', 'accesoVehicular')
            ->latest('fecha_hora')
            ->limit($limit)
            ->get();
        return response()->json($alertas);
    }

    /**
     * Obtiene solo las alertas NO ATENDIDAS (para el dashboard)
     */
    public function noAtendidas(Request $request)
    {
        $limit = $request->get('limit', 20);
        $alertas = Alerta::with('tipoAlerta', 'usuario.persona', 'accesoPeatonal', 'accesoVehicular')
            ->where('atendida', false)
            ->latest('fecha_hora')
            ->limit($limit)
            ->get();
        return response()->json($alertas);
    }

    /**
     * Obtiene una alerta específica
     */
    public function show($id)
    {
        $alerta = Alerta::with('tipoAlerta', 'usuario.persona', 'accesoPeatonal', 'accesoVehicular')->find($id);
        return $alerta ? response()->json($alerta) : response()->json(['error' => 'Alerta no encontrada'], 404);
    }

    /**
     * Crea una nueva alerta
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_tipo_alerta' => 'required|exists:tipoalerta,id_tipo_alerta',
            'descripcion' => 'required|string',
            'id_usuario' => 'nullable|exists:usuario,id_usuario',
            'id_acceso_peatonal' => 'nullable|exists:accesopeatonal,id_acceso_peatonal',
            'id_acceso_vehicular' => 'nullable|exists:accesovehicular,id_acceso_vehicular'
        ]);

        $alerta = Alerta::create($validated);
        return response()->json($alerta->load('tipoAlerta', 'usuario.persona'), 201);
    }

    /**
     * Marca una alerta como atendida
     */
    public function atender(Request $request, $id)
    {
        $alerta = Alerta::find($id);
        if (!$alerta) {
            return response()->json(['error' => 'Alerta no encontrada'], 404);
        }

        $alerta->update([
            'atendida' => true,
            'id_usuario_atencion' => auth()->id() ?? 1,  // ID del usuario que atiende (o 1 por defecto)
            'fecha_atencion' => now()
        ]);

        return response()->json($alerta->load('tipoAlerta', 'usuario.persona', 'usuarioAtencion.persona'));
    }

    /**
     * Elimina una alerta
     */
    public function destroy($id)
    {
        $alerta = Alerta::find($id);
        if (!$alerta) {
            return response()->json(['error' => 'Alerta no encontrada'], 404);
        }

        $alerta->delete();
        return response()->json(['success' => true, 'message' => 'Alerta eliminada']);
    }

    /**
     * Obtiene alertas por usuario
     */
    public function porUsuario($usuarioId, Request $request)
    {
        $limit = $request->get('limit', 50);
        $alertas = Alerta::where('id_usuario', $usuarioId)
            ->with('tipoAlerta', 'usuario.persona')
            ->latest('fecha_hora')
            ->limit($limit)
            ->get();
        return response()->json($alertas);
    }

    /**
     * Obtiene alertas por tipo
     */
    public function porTipo($tipoId, Request $request)
    {
        $limit = $request->get('limit', 50);
        $alertas = Alerta::where('id_tipo_alerta', $tipoId)
            ->with('tipoAlerta', 'usuario.persona')
            ->latest('fecha_hora')
            ->limit($limit)
            ->get();
        return response()->json($alertas);
    }

    /**
     * Obtiene alertas por rango de fechas
     */
    public function porFecha($fechaInicio, $fechaFin, Request $request)
    {
        $limit = $request->get('limit', 50);
        $alertas = Alerta::whereBetween('fecha_hora', [$fechaInicio, $fechaFin])
            ->with('tipoAlerta', 'usuario.persona')
            ->latest('fecha_hora')
            ->limit($limit)
            ->get();
        return response()->json($alertas);
    }

    /**
     * Obtiene estadísticas de alertas
     */
    public function estadisticas()
    {
        return response()->json([
            'total' => Alerta::count(),
            'no_atendidas' => Alerta::where('atendida', false)->count(),
            'atendidas' => Alerta::where('atendida', true)->count(),
            'por_tipo' => Alerta::selectRaw('id_tipo_alerta, COUNT(*) as cantidad')
                ->groupBy('id_tipo_alerta')
                ->with('tipoAlerta')
                ->get()
        ]);
    }
}
