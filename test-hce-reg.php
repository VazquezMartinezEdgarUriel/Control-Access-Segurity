<?php
// Script para registrar dispositivo con HCE de prueba
require_once __DIR__ . '/vendor/autoload.php';

try {
    // Cargar Laravel
    $app = require_once __DIR__ . '/bootstrap/app.php';
    
    // Crear kernel
    $kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);
    
    // Obtener usuario
    $usuario = \App\Models\Usuario::find(1);
    if (!$usuario) {
        echo "❌ Usuario ID 1 no encontrado\n";
        exit(1);
    }
    
    // Obtener credencial
    $credencial = \App\Models\Credencial::find(1);
    if (!$credencial) {
        echo "❌ Credencial ID 1 no encontrada\n";
        exit(1);
    }
    
    echo "✅ Usuario encontrado: {$usuario->nombre}\n";
    echo "✅ Credencial encontrada: {$credencial->uid_nfc}\n\n";
    
    // Generar UID Virtual HCE
    $uuid = "550e8400-e29b-41d4-a716-446655440000";
    $uidVirtualHCE = \App\Models\DispositivoMovil::generarUidVirtualHCE($uuid, $credencial->uid_nfc);
    
    echo "📱 Generando UID Virtual HCE...\n";
    echo "   Entrada: UUID={$uuid}\n";
    echo "   Entrada: Credencial UID={$credencial->uid_nfc}\n";
    echo "   ✅ UID Virtual HCE Generado: {$uidVirtualHCE}\n\n";
    
    // Crear dispositivo
    $dispositivo = \App\Models\DispositivoMovil::create([
        'usuario_id' => 1,
        'credencial_id' => 1,
        'nombre_dispositivo' => 'Test iPhone HCE',
        'uuid' => $uuid,
        'uid_virtual_hce' => $uidVirtualHCE,
        'tipo_dispositivo' => 'ios',
        'so_version' => '17.2',
        'tiene_nfc' => true,
        'metodo_autenticacion' => 'biometrico',
        'estado' => 'activo',
        'fecha_registro' => now(),
    ]);
    
    echo "📋 Dispositivo Registrado:\n";
    echo "   ID: {$dispositivo->id}\n";
    echo "   Nombre: {$dispositivo->nombre_dispositivo}\n";
    echo "   UUID: {$dispositivo->uuid}\n";
    echo "   UID Virtual HCE: {$dispositivo->uid_virtual_hce}\n";
    echo "   Estado: {$dispositivo->estado}\n\n";
    
    // Validación final
    $dispositivoVerificado = \App\Models\DispositivoMovil::where('uid_virtual_hce', $uidVirtualHCE)->first();
    if ($dispositivoVerificado) {
        echo "✅ ¡ÉXITO! Dispositivo registrado con identidad digital HCE\n";
        echo "   UID Virtual único y auditable en BD\n\n";
        
        // Mostrar información HCE
        $hceInfo = $dispositivo->obtenerInfoHCE();
        echo "📡 Información HCE:\n";
        echo "   Tipo: " . $hceInfo['type'] . "\n";
        echo "   UID Virtual: " . $hceInfo['uid_virtual'] . "\n";
        echo "   Dispositivo: " . $hceInfo['dispositivo'] . "\n";
        echo "   Usuario ID: " . $hceInfo['usuario_id'] . "\n";
        echo "   Credencial Original: " . $hceInfo['credencial_original'] . "\n";
        echo "   Estado: " . $hceInfo['estado'] . "\n";
        echo "   Fecha Creación: " . $hceInfo['fecha_creacion'] . "\n";
    } else {
        echo "❌ Error: Dispositivo no encontrado en BD\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo $e->getFile() . ":" . $e->getLine() . "\n";
    exit(1);
}
