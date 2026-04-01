<?php

namespace App\Http\Controllers;

use App\Models\AccesoPeatonal;
use App\Models\Credencial;
use App\Models\Alerta;
use Illuminate\Http\Request;

class AccesoPeatonalController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->get('limit', 50);
        $accesos = AccesoPeatonal::with('usuario.persona', 'credencial', 'lector')->latest('fecha_hora')->limit($limit)->get();
        return response()->json($accesos);
    }

    public function show($id)
    {
        $acceso = AccesoPeatonal::with('usuario.persona', 'credencial', 'lector')->find($id);
        return $acceso ? response()->json($acceso) : response()->json(['error' => 'No encontrado'], 404);
    }

    public function registrarEntrada(Request $request)
    {
        $validated = $request->validate([
            'uid_nfc' => 'required|string',
            'id_lector' => 'required|exists:lector,id_lector'
        ]);

        $credencial = Credencial::where('uid_nfc', $validated['uid_nfc'])->first();
        
        if (!$credencial) {
            // Crear alerta de acceso denegado
            Alerta::create([
                'id_tipo_alerta' => 1,
                'descripcion' => "Intento de acceso peatonal denegado: Credencial no registrada ($validated[uid_nfc])",
                'fecha_hora' => now()
            ]);

            return response()->json(['resultado' => 'denegado', 'motivo' => 'Credencial no registrada'], 403);
        }

        $acceso = AccesoPeatonal::create([
            'id_credencial' => $credencial->id_credencial,
            'id_usuario' => $credencial->id_usuario,
            'tipo' => 'entrada',
            'resultado' => 'autorizado',
            'id_lector' => $validated['id_lector']
        ]);

        return response()->json($acceso, 201);
    }

    public function registrarSalida(Request $request, $id)
    {
        $acceso = AccesoPeatonal::find($id);
        if (!$acceso) return response()->json(['error' => 'No encontrado'], 404);

        $acceso->update(['tipo' => 'salida']);
        return response()->json($acceso);
    }

    public function porUsuario($usuarioId)
    {
        $accesos = AccesoPeatonal::where('id_usuario', $usuarioId)->latest('fecha_hora')->get();
        return response()->json($accesos);
    }

    public function porFecha($fecha)
    {
        $accesos = AccesoPeatonal::whereDate('fecha_hora', $fecha)->latest('fecha_hora')->get();
        return response()->json($accesos);
    }
}
