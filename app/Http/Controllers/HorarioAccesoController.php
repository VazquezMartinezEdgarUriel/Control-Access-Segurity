<?php

namespace App\Http\Controllers;

use App\Models\HorarioAcceso;
use Illuminate\Http\Request;

class HorarioAccesoController extends Controller
{
    public function index()
    {
        return response()->json(HorarioAcceso::with('usuario')->get());
    }

    public function show($id)
    {
        $horario = HorarioAcceso::with('usuario')->find($id);
        return $horario ? response()->json($horario) : response()->json(['error' => 'No encontrado'], 404);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_usuario' => 'required|exists:usuario,id_usuario',
            'dia_semana' => 'required|integer|between:1,7',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i'
        ]);

        $horario = HorarioAcceso::create($validated);
        return response()->json($horario, 201);
    }

    public function update(Request $request, $id)
    {
        $horario = HorarioAcceso::find($id);
        if (!$horario) return response()->json(['error' => 'No encontrado'], 404);

        $horario->update($request->only('dia_semana', 'hora_inicio', 'hora_fin', 'activo'));
        return response()->json($horario);
    }

    public function destroy($id)
    {
        HorarioAcceso::find($id)?->delete();
        return response()->json(['success' => true]);
    }

    public function porUsuario($usuarioId)
    {
        $horarios = HorarioAcceso::where('id_usuario', $usuarioId)->get();
        return response()->json($horarios);
    }

    public function toggle($id)
    {
        $horario = HorarioAcceso::find($id);
        if (!$horario) return response()->json(['error' => 'No encontrado'], 404);

        $horario->update(['activo' => !$horario->activo]);
        return response()->json($horario);
    }
}
