<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\CredencialController;
use App\Http\Controllers\VehiculoController;
use App\Http\Controllers\AccesoPeatonalController;
use App\Http\Controllers\AccesoVehicularController;
use App\Http\Controllers\HorarioAccesoController;
use App\Http\Controllers\VisitanteController;
use App\Http\Controllers\DispositivoMovilController;
use App\Http\Controllers\SolicitudVisitanteController;
use App\Http\Controllers\AlertaController;

// ==========================================
// ALERTAS
// ==========================================
Route::get('alertas', [AlertaController::class, 'index']);
Route::get('alertas/no-atendidas', [AlertaController::class, 'noAtendidas']);
Route::get('alertas/estadisticas', [AlertaController::class, 'estadisticas']);
Route::get('alertas/{id}', [AlertaController::class, 'show']);
Route::post('alertas', [AlertaController::class, 'store']);
Route::post('alertas/{id}/atender', [AlertaController::class, 'atender']);
Route::delete('alertas/{id}', [AlertaController::class, 'destroy']);
Route::get('alertas/usuario/{usuarioId}', [AlertaController::class, 'porUsuario']);
Route::get('alertas/tipo/{tipoId}', [AlertaController::class, 'porTipo']);
Route::get('alertas/fecha/{fechaInicio}/{fechaFin}', [AlertaController::class, 'porFecha']);

// ==========================================
// USUARIOS
// ==========================================
Route::apiResource('usuarios', UsuarioController::class);

// ==========================================
// CREDENCIALES NFC
// ==========================================
Route::post('credenciales/validar-nfc', [CredencialController::class, 'validarNfc']);
Route::apiResource('credenciales', CredencialController::class);
Route::get('credenciales/usuario/{usuarioId}', [CredencialController::class, 'porUsuario']);

// ==========================================
// DISPOSITIVOS MÓVILES
// ==========================================
Route::post('dispositivos-moviles/registrar', [DispositivoMovilController::class, 'registrar']);
Route::get('dispositivos-moviles/usuario/{usuarioId}', [DispositivoMovilController::class, 'obtenerDelUsuario']);
Route::get('dispositivos-moviles/{dispositivoId}', [DispositivoMovilController::class, 'obtener']);
Route::put('dispositivos-moviles/{dispositivoId}', [DispositivoMovilController::class, 'actualizar']);
Route::post('dispositivos-moviles/{dispositivoId}/acceso', [DispositivoMovilController::class, 'registrarAcceso']);
Route::post('dispositivos-moviles/verificar-credencial', [DispositivoMovilController::class, 'verificarCredencial']);
Route::patch('dispositivos-moviles/{dispositivoId}/bloquear', [DispositivoMovilController::class, 'bloquear']);
Route::patch('dispositivos-moviles/{dispositivoId}/desbloquear', [DispositivoMovilController::class, 'desbloquear']);
Route::delete('dispositivos-moviles/{dispositivoId}', [DispositivoMovilController::class, 'eliminar']);
Route::post('dispositivos-moviles/generar-qr-registro', [DispositivoMovilController::class, 'generarQRRegistro']);

// ==========================================
// VEHICULOS
// ==========================================
Route::apiResource('vehiculos', VehiculoController::class);
Route::get('vehiculos/usuario/{usuarioId}', [VehiculoController::class, 'porUsuario']);
Route::get('vehiculos/placa/{placa}', [VehiculoController::class, 'porPlaca']);

// ==========================================
// ACCESO PEATONAL
// ==========================================
Route::get('acceso-peatonal', [AccesoPeatonalController::class, 'index']);
Route::get('acceso-peatonal/{id}', [AccesoPeatonalController::class, 'show']);
Route::post('acceso-peatonal/entrada', [AccesoPeatonalController::class, 'registrarEntrada']);
Route::patch('acceso-peatonal/{id}/salida', [AccesoPeatonalController::class, 'registrarSalida']);
Route::get('acceso-peatonal/usuario/{usuarioId}', [AccesoPeatonalController::class, 'porUsuario']);
Route::get('acceso-peatonal/fecha/{fecha}', [AccesoPeatonalController::class, 'porFecha']);

// ==========================================
// ACCESO VEHICULAR
// ==========================================
Route::get('acceso-vehicular', [AccesoVehicularController::class, 'index']);
Route::get('acceso-vehicular/{id}', [AccesoVehicularController::class, 'show']);
Route::post('acceso-vehicular/entrada', [AccesoVehicularController::class, 'registrarEntrada']);
Route::get('acceso-vehicular/placa/{placa}', [AccesoVehicularController::class, 'porPlaca']);
Route::get('acceso-vehicular/fecha/{fecha}', [AccesoVehicularController::class, 'porFecha']);
Route::get('acceso-vehicular/denegados', [AccesoVehicularController::class, 'denegados']);

// ==========================================
// HORARIOS DE ACCESO
// ==========================================
Route::apiResource('horarios', HorarioAccesoController::class);
Route::get('horarios/usuario/{usuarioId}', [HorarioAccesoController::class, 'porUsuario']);
Route::patch('horarios/{id}/toggle', [HorarioAccesoController::class, 'toggle']);

// ==========================================
// VISITANTES
// ==========================================
Route::apiResource('visitantes', VisitanteController::class);

// ==========================================
// SOLICITUDES DE VISITANTES
// ==========================================
Route::post('solicitud-visitante/crear', [SolicitudVisitanteController::class, 'crearSolicitud']);
Route::get('solicitudes-visitante/pendientes', [SolicitudVisitanteController::class, 'obtenerSolicitudesPendientes']);
Route::get('solicitudes-visitante', [SolicitudVisitanteController::class, 'obtenerSolicitudes']);
Route::get('solicitudes-visitante/{id}', [SolicitudVisitanteController::class, 'obtenerSolicitud']);
Route::post('solicitudes-visitante/{id}/aprobar', [SolicitudVisitanteController::class, 'aprobarSolicitud']);
Route::post('solicitudes-visitante/{id}/negar', [SolicitudVisitanteController::class, 'negarSolicitud']);
Route::get('solicitudes-visitante/estadisticas/general', [SolicitudVisitanteController::class, 'obtenerEstadisticas']);

