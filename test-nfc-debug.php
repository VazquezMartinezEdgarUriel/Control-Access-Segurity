<?php
/**
 * Test rápido - Valida endpoint NFC sin bloqueos
 * Acceso: http://localhost:8000/test-nfc-debug.php?uid=A1:B2:C3:D4:E5:01
 */

header('Content-Type: application/json');
set_time_limit(15);

require 'bootstrap/app.php';

try {
    $app = require_once 'bootstrap/app.php';
    $kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);
    
    $uid = $_GET['uid'] ?? 'A1:B2:C3:D4:E5:01';
    
    echo json_encode([
        'timestamp' => date('Y-m-d H:i:s'),
        'test' => 'NFC Validation Debug',
        'requested_uid' => $uid,
        'steps' => []
    ]);
    
    // Prueba 1: Conectar DB
    try {
        $count = \Illuminate\Support\Facades\DB::table('credencial')->count();
        echo "\n✓ DB conectada. Total credenciales: $count";
    } catch (\Exception $e) {
        echo "\n✗ Error DB: " . $e->getMessage();
        exit;
    }
    
    // Prueba 2: Query simple
    try {
        $result = \Illuminate\Support\Facades\DB::table('credencial')
            ->select('id_credencial', 'uid_nfc', 'id_usuario')
            ->where('uid_nfc', $uid)
            ->first();
        echo "\n✓ Query básica OK. Resultado: " . ($result ? 'ENCONTRADA' : 'NO ENCONTRADA');
    } catch (\Exception $e) {
        echo "\n✗ Error query: " . $e->getMessage();
        exit;
    }
    
    // Prueba 3: Con relaciones
    try {
        $credencial = \App\Models\Credencial::with('usuario')
            ->where('uid_nfc', $uid)
            ->first();
        echo "\n✓ Query con usuario OK. Resultado: " . ($credencial ? 'ENCONTRADA' : 'NO ENCONTRADA');
    } catch (\Exception $e) {
        echo "\n✗ Error con relación usuario: " . $e->getMessage();
        exit;
    }
    
    // Prueba 4: Endpoint real simulado
    try {
        $controller = new \App\Http\Controllers\CredencialController();
        $request = new \Illuminate\Http\Request(['uid_nfc' => $uid]);
        $request->setMethod('POST');
        
        $response = $controller->validarNfc($request);
        echo "\n✓ Endpoint simulado OK";
        echo "\n" . $response->getContent();
    } catch (\Exception $e) {
        echo "\n✗ Error en endpoint: " . $e->getMessage();
    }
    
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}
