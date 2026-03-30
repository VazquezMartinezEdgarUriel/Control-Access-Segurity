<?php

namespace App\Http\Controllers;

use App\Models\Visitante;
use App\Models\Usuario;
use App\Models\Persona;
use App\Models\TipoUsuario;
use Illuminate\Http\Request;

class VisitanteController extends Controller
{
    public function index()
    {
        return response()->json(Visitante::with('usuario.persona', 'usuarioAutorizador.persona')->get());
    }

    public function show($id)
    {
        $visitante = Visitante::with('usuario.persona', 'usuarioAutorizador.persona')->find($id);
        return $visitante ? response()->json($visitante) : response()->json(['error' => 'No encontrado'], 404);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre_completo' => 'nullable|string',
            'id_usuario' => 'nullable|exists:usuario,id_usuario',
            'email' => 'nullable|email',
            'telefono' => 'nullable|string',
            'empresa' => 'nullable|string',
            'motivo_visita' => 'nullable|string',
            'motivo' => 'nullable|string',
            'id_autorizado_por' => 'nullable|exists:usuario,id_usuario',
            'autorizado_por' => 'nullable|string',
            'fecha_entrada_estimada' => 'nullable|date',
            'fecha_salida_estimada' => 'nullable|date'
        ]);

        // Si viene id_usuario directo, usarlo; si no, crear persona+usuario
        if (!empty($validated['id_usuario'])) {
            $usuarioId = $validated['id_usuario'];
        } else {
            $persona = Persona::create([
                'nombre_completo' => $validated['nombre_completo'] ?? 'Visitante',
                'email' => $validated['email'] ?? null,
                'telefono' => $validated['telefono'] ?? null,
            ]);

            $tipoVisitante = TipoUsuario::where('nombre_tipo', 'visitante')->first();

            $usuario = Usuario::create([
                'id_persona' => $persona->id_persona,
                'id_tipo_usuario' => $tipoVisitante ? $tipoVisitante->id_tipo_usuario : 1,
                'activo' => true,
            ]);
            $usuarioId = $usuario->id_usuario;
        }

        // Resolver autorizado_por: si viene como nombre, buscar el usuario
        $idAutorizadoPor = $validated['id_autorizado_por'] ?? null;
        if (!$idAutorizadoPor && !empty($validated['autorizado_por'])) {
            $auth = Persona::where('nombre_completo', 'like', '%' . $validated['autorizado_por'] . '%')->first();
            if ($auth && $auth->usuario) {
                $idAutorizadoPor = $auth->usuario->id_usuario;
            }
        }

        $visitante = Visitante::create([
            'id_usuario' => $usuarioId,
            'empresa' => $validated['empresa'] ?? null,
            'motivo_visita' => $validated['motivo_visita'] ?? $validated['motivo'] ?? null,
            'id_autorizado_por' => $idAutorizadoPor,
            'fecha_entrada_estimada' => $validated['fecha_entrada_estimada'] ?? null,
            'fecha_salida_estimada' => $validated['fecha_salida_estimada'] ?? null,
        ]);

        return response()->json($visitante->load('usuario.persona', 'autorizadoPor.persona'), 201);
    }

    public function update(Request $request, $id)
    {
        $visitante = Visitante::find($id);
        if (!$visitante) return response()->json(['error' => 'No encontrado'], 404);

        $visitante->update($request->only('empresa', 'motivo_visita', 'id_autorizado_por', 'fecha_entrada_estimada', 'fecha_salida_estimada'));
        return response()->json($visitante->load('autorizadoPor.persona'));
    }

    public function destroy($id)
    {
        $visitante = Visitante::find($id);
        if ($visitante) {
            $usuario = Usuario::find($visitante->id_usuario);
            if ($usuario) {
                $usuario->delete();
            }
            $visitante->delete();
        }
        return response()->json(['success' => true]);
    }
}
