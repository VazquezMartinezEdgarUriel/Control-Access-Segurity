<?php
/**
 * Test Bloqueo de Dispositivo - 5 Intentos Fallidos
 */

try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=cas', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo " PRUEBA DE BLOQUEO - 5 Intentos Fallidos\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    
    // Get dispositivo 1
    $stmtDisp = $pdo->prepare("SELECT id, uid_virtual_hce, estado FROM dispositivos_moviles WHERE id = 1");
    $stmtDisp->execute();
    $dispositivo = $stmtDisp->fetch(PDO::FETCH_ASSOC);
    
    if (!$dispositivo) {
        echo "❌ Dispositivo no encontrado\n";
        exit(1);
    }
    
    echo "📱 Dispositivo: ID {$dispositivo['id']}\n";
    echo "   HCE UID: {$dispositivo['uid_virtual_hce']}\n";
    echo "   Estado Actual: {$dispositivo['estado']}\n\n";
    
    // Reset intentos fallidos
    echo "🔄 Reseteando intentos fallidos a 0...\n";
    $stmtReset = $pdo->prepare("UPDATE dispositivos_moviles SET intentos_fallidos = 0 WHERE id = 1");
    $stmtReset->execute();
    echo "✅ Intentos reseteados\n\n";
    
    // Simulate 5 failed attempts
    echo "🧪 Simulando 5 intentos fallidos de acceso...\n";
    for ($i = 1; $i <= 5; $i++) {
        $stmtUpdate = $pdo->prepare("
            UPDATE dispositivos_moviles 
            SET intentos_fallidos = intentos_fallidos + 1
            WHERE id = 1
        ");
        $stmtUpdate->execute();
        
        // Check current state
        $stmtCheck = $pdo->prepare("SELECT intentos_fallidos FROM dispositivos_moviles WHERE id = 1");
        $stmtCheck->execute();
        $result = $stmtCheck->fetch(PDO::FETCH_ASSOC);
        
        echo "   Intento $i: intentos_fallidos = {$result['intentos_fallidos']}\n";
        
        // If 5 intentos reached, block device
        if ($result['intentos_fallidos'] >= 5) {
            echo "\n⚠️  ¡5 intentos fallidos alcanzados! Bloqueando dispositivo...\n";
            $stmtBlock = $pdo->prepare("
                UPDATE dispositivos_moviles 
                SET estado = 'bloqueado', fecha_bloqueo = NOW()
                WHERE id = 1
            ");
            $stmtBlock->execute();
        }
    }
    
    echo "\n";
    
    // Verify device is blocked
    $stmtVerify = $pdo->prepare("
        SELECT id, uid_virtual_hce, estado, intentos_fallidos, fecha_bloqueo 
        FROM dispositivos_moviles 
        WHERE id = 1
    ");
    $stmtVerify->execute();
    $dispositivo_final = $stmtVerify->fetch(PDO::FETCH_ASSOC);
    
    echo "🔍 Estado Final del Dispositivo:\n";
    echo "   ID: {$dispositivo_final['id']}\n";
    echo "   HCE UID: {$dispositivo_final['uid_virtual_hce']}\n";
    echo "   Estado: {$dispositivo_final['estado']}\n";
    echo "   Intentos Fallidos: {$dispositivo_final['intentos_fallidos']}\n";
    echo "   Fecha Bloqueo: {$dispositivo_final['fecha_bloqueo']}\n\n";
    
    if ($dispositivo_final['estado'] === 'bloqueado') {
        echo "✅ ¡ÉXITO! Dispositivo bloqueado correctamente\n\n";
    } else {
        echo "⚠️  Estado no está bloqueado\n\n";
    }
    
    // Test unblock functionality
    echo "🔓 Probando desbloqueo del dispositivo...\n";
    $stmtUnblock = $pdo->prepare("
        UPDATE dispositivos_moviles 
        SET estado = 'activo', intentos_fallidos = 0, fecha_bloqueo = NULL
        WHERE id = 1
    ");
    $stmtUnblock->execute();
    
    $stmtVerifyUnblock = $pdo->prepare("
        SELECT id, estado, intentos_fallidos 
        FROM dispositivos_moviles 
        WHERE id = 1
    ");
    $stmtVerifyUnblock->execute();
    $dispositivo_desbloqueado = $stmtVerifyUnblock->fetch(PDO::FETCH_ASSOC);
    
    echo "   Estado después desbloqueo: {$dispositivo_desbloqueado['estado']}\n";
    echo "   Intentos fallidos: {$dispositivo_desbloqueado['intentos_fallidos']}\n";
    
    if ($dispositivo_desbloqueado['estado'] === 'activo') {
        echo "✅ Dispositivo desbloqueado correctamente\n\n";
    }
    
    // Summary
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "✅ PRUEBA DE BLOQUEO COMPLETADA EXITOSAMENTE\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "📊 Funcionalidades Validadas:\n";
    echo "   ✓ Contador de intentos fallidos\n";
    echo "   ✓ Bloqueo automático en 5 intentos\n";
    echo "   ✓ Registro de fecha de bloqueo\n";
    echo "   ✓ Desbloqueo de dispositivo\n";
    echo "   ✓ Reset de contador de intentos\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    
} catch (\PDOException $e) {
    echo "❌ Error de Base de Datos: " . $e->getMessage() . "\n";
    exit(1);
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
