<?php
/**
 * SCRIPT DE PRUEBA - Sistema de Alertas
 * 
 * Ejecuta: php test-alertas-system.php
 * 
 * Verifica que el sistema de alertas está funcionando correctamente
 */

header('Content-Type: application/json');

require 'bootstrap/app.php';

$results = [
    'timestamp' => date('Y-m-d H:i:s'),
    'tests' => [],
    'errors' => []
];

// TEST 1: Verificar que AlertaController existe
echo "[TEST 1/7] Verificando AlertaController...\n";
try {
    if (class_exists(\App\Http\Controllers\AlertaController::class)) {
        $results['tests']['alerta_controller'] = [
            'status' => 'OK',
            'message' => 'AlertaController existe y está cargado'
        ];
        echo "✅ OK: AlertaController existe\n";
    } else {
        throw new Exception('AlertaController no encontrado');
    }
} catch (Exception $e) {
    $results['errors'][] = "AlertaController: " . $e->getMessage();
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

// TEST 2: Verificar que modelo Alerta existe
echo "[TEST 2/7] Verificando modelo Alerta...\n";
try {
    if (class_exists(\App\Models\Alerta::class)) {
        $results['tests']['alerta_model'] = [
            'status' => 'OK',
            'message' => 'Modelo Alerta existe'
        ];
        echo "✅ OK: Modelo Alerta existe\n";
    } else {
        throw new Exception('Modelo Alerta no encontrado');
    }
} catch (Exception $e) {
    $results['errors'][] = "Modelo Alerta: " . $e->getMessage();
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

// TEST 3: Verificar tabla alerta en BD
echo "[TEST 3/7] Verificando tabla alerta en BD...\n";
try {
    $count = \Illuminate\Support\Facades\DB::table('alerta')->count();
    $results['tests']['table_alerta'] = [
        'status' => 'OK',
        'message' => "Tabla alerta existe con $count registros",
        'record_count' => $count
    ];
    echo "✅ OK: Tabla alerta existe ($count registros)\n";
} catch (Exception $e) {
    $results['errors'][] = "Tabla alerta: " . $e->getMessage();
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

// TEST 4: Verificar que tipoalerta tiene los 5 tipos
echo "[TEST 4/7] Verificando tipos de alerta en BD...\n";
try {
    $tipos = \Illuminate\Support\Facades\DB::table('tipoalerta')->get();
    $count = count($tipos);
    
    if ($count >= 5) {
        $results['tests']['tipos_alerta'] = [
            'status' => 'OK',
            'message' => "Existen $count tipos de alerta (mínimo requerido: 5)",
            'tipos_count' => $count,
            'tipos' => $tipos->toArray()
        ];
        echo "✅ OK: Existen $count tipos de alerta\n";
        foreach ($tipos as $tipo) {
            echo "   - ID {$tipo->id_tipo_alerta}: {$tipo->nombre_tipo}\n";
        }
    } else {
        echo "⚠️  WARNING: Solo hay $count tipos, se esperaban al menos 5\n";
        echo "   Ejecuta el script para crear los tipos faltantes\n";
        $results['tests']['tipos_alerta'] = [
            'status' => 'WARNING',
            'message' => "Solo hay $count tipos de alerta (mínimo requerido: 5)",
            'tipos_count' => $count
        ];
    }
} catch (Exception $e) {
    $results['errors'][] = "Tipos alerta: " . $e->getMessage();
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

// TEST 5: Crear una alerta de prueba
echo "[TEST 5/7] Creando alerta de prueba...\n";
try {
    $alerta = \App\Models\Alerta::create([
        'id_tipo_alerta' => 1,
        'descripcion' => 'Alerta de prueba - Sistema de alertas funcionando correctamente',
        'fecha_hora' => now()
    ]);
    
    $results['tests']['create_alerta'] = [
        'status' => 'OK',
        'message' => 'Alerta creada exitosamente',
        'alerta_id' => $alerta->id_alerta,
        'alerta_data' => $alerta->toArray()
    ];
    echo "✅ OK: Alerta creada (ID: {$alerta->id_alerta})\n";
} catch (Exception $e) {
    $results['errors'][] = "Crear alerta: " . $e->getMessage();
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

// TEST 6: Obtener alertas no atendidas (como lo hace dashboard)
echo "[TEST 6/7] Obteniendo alertas no atendidas...\n";
try {
    $alertas = \App\Models\Alerta::where('atendida', false)
        ->with('tipoAlerta', 'usuario.persona')
        ->latest('fecha_hora')
        ->limit(10)
        ->get();
    
    $results['tests']['get_alertas'] = [
        'status' => 'OK',
        'message' => "Obtenidas " . count($alertas) . " alertas no atendidas",
        'count' => count($alertas),
        'alertas' => $alertas->toArray()
    ];
    echo "✅ OK: Obtenidas " . count($alertas) . " alertas no atendidas\n";
} catch (Exception $e) {
    $results['errors'][] = "Obtener alertas: " . $e->getMessage();
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

// TEST 7: Verificar que CredencialController importa Alerta
echo "[TEST 7/7] Verificando imports en controladores...\n";
try {
    $file = file_get_contents(__DIR__ . '/app/Http/Controllers/CredencialController.php');
    
    if (strpos($file, 'use App\Models\Alerta') !== false) {
        $results['tests']['imports'] = [
            'status' => 'OK',
            'message' => 'CredencialController importa correctamente Alerta'
        ];
        echo "✅ OK: CredencialController importa Alerta\n";
    } else {
        throw new Exception('CredencialController no importa Alerta');
    }
} catch (Exception $e) {
    $results['errors'][] = "Imports: " . $e->getMessage();
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

// RESUMEN
echo "\n";
echo "RESUMEN DE PRUEBAS\n";

$passCount = 0;
$failCount = 0;
foreach ($results['tests'] as $test => $result) {
    if ($result['status'] === 'OK') {
        echo "✅ PASS: $test\n";
        $passCount++;
    } else {
        echo "⚠️  WARNING: $test\n";
    }
}

if (!empty($results['errors'])) {
    echo "\n❌ ERRORES:\n";
    $failCount = count($results['errors']);
    foreach ($results['errors'] as $error) {
        echo "   - $error\n";
    }
}

echo "\n";
echo "RESULTADO FINAL: $passCount PASS, $failCount FAIL\n";

// Guardar resultados en archivo
file_put_contents(
    __DIR__ . '/storage/logs/alertas-test-' . date('Y-m-d-H-i-s') . '.json',
    json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
);

echo "\n✅ Archivo de resultados guardado en: storage/logs/alertas-test-*.json\n";

// Retornar JSON
echo "\n\nJSON RESULTS:\n";
echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

// INSTRUCCIONES SI FALLAN TESTS
if ($failCount > 0 || !empty($results['errors'])) {
    echo "\n\n";
    echo "⚠️ INSTRUCCIONES DE RESOLUCIÓN\n";
    echo "\n1. Verificar que AlertaController.php existe:\n";
    echo "   ls -la app/Http/Controllers/AlertaController.php\n";
    echo "\n2. Limpiar caché de Laravel:\n";
    echo "   php artisan cache:clear\n";
    echo "   php artisan config:cache\n";
    echo "\n3. Crear tipos de alerta faltantes:\n";
    echo "   Ejecutar: php crear-tipos-alerta.php\n";
    echo "\n4. Verificar BD:\n";
    echo "   SELECT * FROM alerta LIMIT 10;\n";
    echo "   SELECT * FROM tipoalerta;\n";
}

echo "\n✅ Pruebas completadas a las " . date('H:i:s') . "\n";
?>
