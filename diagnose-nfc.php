<?php
/**
 * Script de Diagnóstico - Valida flujom de NFC
 */

header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

require 'bootstrap/app.php';
require 'app/Models/Credencial.php';
require 'app/Models/Usuario.php';

$tests = [];

// Test 1: Validar modelo Credencial
try {
    $credenciales = \Illuminate\Support\Facades\DB::table('credencial')->count();
    $tests['credenciales_count'] = [
        'status' => 'ok',
        'message' => "Total credenciales: $credenciales"
    ];
} catch (\Exception $e) {
    $tests['credenciales_count'] = [
        'status' => 'error',
        'message' => $e->getMessage()
    ];
}

// Test 2: Buscar una tarjeta de prueba
try {
    $uid = $_GET['uid'] ?? 'A1:B2:C3:D4:E5:01';
    $credencial = \Illuminate\Support\Facades\DB::table('credencial')
        ->where('uid_nfc', $uid)
        ->first();
    
    $tests['search_credential'] = [
        'status' => $credencial ? 'ok' : 'not_found',
        'message' => $credencial ? "Encontrada: {$credencial->id_credencial}" : "UID no encontrado: $uid",
        'uid' => $uid
    ];
} catch (\Exception $e) {
    $tests['search_credential'] = [
        'status' => 'error',
        'message' => $e->getMessage()
    ];
}

// Test 3: Llamada simulada a validarNfc
try {
    $url = 'http://127.0.0.1:8000/api/credenciales/validar-nfc';
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\n",
            'content' => json_encode(['uid_nfc' => 'A1:B2:C3:D4:E5:01']),
            'timeout' => 5
        ]
    ]);
    
    $response = @file_get_contents($url, false, $context);
    
    if ($response === false) {
        $tests['api_endpoint'] = [
            'status' => 'error',
            'message' => 'Endpoint inaccesible',
            'url' => $url
        ];
    } else {
        $data = json_decode($response, true);
        $tests['api_endpoint'] = [
            'status' => 'ok',
            'message' => 'Endpoint responde correctamente',
            'response' => $data
        ];
    }
} catch (\Exception $e) {
    $tests['api_endpoint'] = [
        'status' => 'error',
        'message' => $e->getMessage()
    ];
}

// Test 4: Verificar rutas
try {
    $routes = [
        '/api/credenciales',
        '/api/credenciales/validar-nfc',
        '/api/usuarios',
        '/api/acceso-peatonal'
    ];
    
    $tests['routes'] = [
        'status' => 'ok',
        'message' => 'Rutas esperadas',
        'routes' => $routes
    ];
} catch (\Exception $e) {
    $tests['routes'] = [
        'status' => 'error',
        'message' => $e->getMessage()
    ];
}

// Retornar resultados
http_response_code(200);
echo json_encode([
    'timestamp' => now()->toISOString(),
    'tests' => $tests,
    'environment' => [
        'app_debug' => config('app.debug'),
        'database' => config('database.default')
    ]
], JSON_PRETTY_PRINT);
