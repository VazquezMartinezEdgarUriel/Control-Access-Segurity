<?php

namespace App\Http\Controllers;

use App\Models\Vehiculo;
use Illuminate\Http\Request;

class VehiculoController extends Controller
{
    public function index()
    {
        return response()->json(Vehiculo::with('usuario')->get());
    }

    public function show($id)
    {
        $vehiculo = Vehiculo::with('usuario')->find($id);
        return $vehiculo ? response()->json($vehiculo) : response()->json(['error' => 'No encontrado'], 404);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_usuario' => 'required|exists:usuario,id_usuario',
            'placa' => 'required|unique:vehiculo',
            'marca' => 'nullable|string',
            'modelo' => 'nullable|string',
            'color' => 'nullable|string'
        ]);

        $vehiculo = Vehiculo::create($validated);
        return response()->json($vehiculo, 201);
    }

    public function update(Request $request, $id)
    {
        $vehiculo = Vehiculo::find($id);
        if (!$vehiculo) return response()->json(['error' => 'No encontrado'], 404);

        $vehiculo->update($request->only('placa', 'marca', 'modelo', 'color', 'activo'));
        return response()->json($vehiculo);
    }

    public function destroy($id)
    {
        Vehiculo::find($id)?->delete();
        return response()->json(['success' => true]);
    }

    public function porUsuario($usuarioId)
    {
        $vehiculos = Vehiculo::where('id_usuario', $usuarioId)->get();
        return response()->json($vehiculos);
    }

    public function porPlaca($placa)
    {
        $vehiculo = Vehiculo::where('placa', $placa)->first();
        return $vehiculo ? response()->json($vehiculo) : response()->json(['error' => 'No encontrado'], 404);
    }
}
