<?php

namespace App\Http\Controllers;

use App\Models\AccesoVehicular;
use App\Models\Vehiculo;
use Illuminate\Http\Request;

class AccesoVehicularController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->get('limit', 50);
        $accesos = AccesoVehicular::with('usuario.persona', 'vehiculo', 'lector')->latest('fecha_hora')->limit($limit)->get();
        return response()->json($accesos);
    }

    public function show($id)
    {
        $acceso = AccesoVehicular::with('usuario.persona', 'vehiculo', 'lector')->find($id);
        return $acceso ? response()->json($acceso) : response()->json(['error' => 'No encontrado'], 404);
    }

    public function registrarEntrada(Request $request)
    {
        $validated = $request->validate([
            'placa_leida' => 'required|string',
            'id_lector' => 'required|exists:lector,id_lector'
        ]);

        $vehiculo = Vehiculo::where('placa', $validated['placa_leida'])->first();
        
        $resultado = $vehiculo ? 'autorizado' : 'denegado';
        
        $acceso = AccesoVehicular::create([
            'placa_leida' => $validated['placa_leida'],
            'id_vehiculo' => $vehiculo?->id_vehiculo,
            'id_usuario' => $vehiculo?->id_usuario,
            'resultado' => $resultado,
            'id_lector' => $validated['id_lector']
        ]);

        return response()->json($acceso, 201);
    }

    public function porPlaca($placa)
    {
        $accesos = AccesoVehicular::where('placa_leida', $placa)->latest('fecha_hora')->get();
        return response()->json($accesos);
    }

    public function porFecha($fecha)
    {
        $accesos = AccesoVehicular::whereDate('fecha_hora', $fecha)->latest('fecha_hora')->get();
        return response()->json($accesos);
    }

    public function denegados()
    {
        $accesos = AccesoVehicular::where('resultado', 'denegado')->latest('fecha_hora')->paginate(50);
        return response()->json($accesos);
    }
}
