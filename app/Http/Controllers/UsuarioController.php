<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\Persona;
use App\Models\TipoUsuario;
use App\Models\VigenciaUsuario;
use Illuminate\Http\Request;

class UsuarioController extends Controller
{
    public function index()
    {
        return response()->json(Usuario::with('persona', 'tipoDeUsuario', 'credenciales', 'vehiculos', 'vigencias')->get());
    }

    public function show($id)
    {
        $usuario = Usuario::with('persona', 'tipoDeUsuario', 'credenciales', 'vehiculos', 'vigencias')->find($id);
        return $usuario ? response()->json($usuario) : response()->json(['error' => 'No encontrado'], 404);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre_completo' => 'required|string',
            'tipo_usuario' => 'nullable|string',
            'id_tipo_usuario' => 'nullable|exists:tipousuario,id_tipo_usuario',
            'email' => 'nullable|email|unique:persona,email',
            'telefono' => 'nullable|string',
            'id_direccion' => 'nullable|exists:direccion,id_direccion',
            'vigencia_inicio' => 'nullable|date',
            'vigencia_fin' => 'nullable|date',
            'observaciones_usuario' => 'nullable|string'
        ]);

        // Resolver tipo de usuario: por id o por nombre
        $idTipoUsuario = $validated['id_tipo_usuario'] ?? null;
        if (!$idTipoUsuario && !empty($validated['tipo_usuario'])) {
            $tipo = TipoUsuario::where('nombre_tipo', $validated['tipo_usuario'])->first();
            $idTipoUsuario = $tipo ? $tipo->id_tipo_usuario : 1;
        }
        $idTipoUsuario = $idTipoUsuario ?: 1;

        // Crear persona
        $persona = Persona::create([
            'nombre_completo' => $validated['nombre_completo'],
            'email' => $validated['email'] ?? null,
            'telefono' => $validated['telefono'] ?? null,
            'id_direccion' => $validated['id_direccion'] ?? null,
        ]);

        // Crear usuario
        $usuario = Usuario::create([
            'id_persona' => $persona->id_persona,
            'id_tipo_usuario' => $idTipoUsuario,
            'activo' => true,
            'observaciones_usuario' => $validated['observaciones_usuario'] ?? null,
        ]);

        // Crear vigencia si se proporcionó
        if (!empty($validated['vigencia_inicio'])) {
            VigenciaUsuario::create([
                'id_usuario' => $usuario->id_usuario,
                'vigencia_inicio' => $validated['vigencia_inicio'],
                'vigencia_fin' => $validated['vigencia_fin'] ?? null,
                'activo' => true,
            ]);
        }

        return response()->json($usuario->load('persona', 'tipoDeUsuario', 'vigencias'), 201);
    }

    public function update(Request $request, $id)
    {
        $usuario = Usuario::with('persona')->find($id);
        if (!$usuario) return response()->json(['error' => 'No encontrado'], 404);

        // Actualizar persona si se envían datos personales
        if ($request->hasAny(['nombre_completo', 'email', 'telefono', 'id_direccion'])) {
            $usuario->persona->update($request->only('nombre_completo', 'email', 'telefono', 'id_direccion'));
        }

        // Resolver tipo_usuario por nombre si se envía
        $updateData = $request->only('id_tipo_usuario', 'activo', 'observaciones_usuario');
        if ($request->has('tipo_usuario') && !$request->has('id_tipo_usuario')) {
            $tipo = TipoUsuario::where('nombre_tipo', $request->tipo_usuario)->first();
            if ($tipo) {
                $updateData['id_tipo_usuario'] = $tipo->id_tipo_usuario;
            }
        }

        // Actualizar usuario
        $usuario->update($updateData);
        return response()->json($usuario->load('persona', 'tipoDeUsuario'));
    }

    public function destroy($id)
    {
        $usuario = Usuario::find($id);
        if ($usuario) {
            $usuario->delete();
        }
        return response()->json(['success' => true]);
    }
}
