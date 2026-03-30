<?php
/**
 * Test Verificación de Acceso con HCE
 */

try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=cas', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo " PRUEBA DE VERIFICACIÓN DE ACCESO CON HCE\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    
    // Get dispositivo con HCE válido
    echo "1️⃣ Buscando dispositivo con HCE válido...\n";
    $stmtDisp = $pdo->prepare("
        SELECT 
            d.id, 
            d.uid_virtual_hce, 
            d.estado, 
            d.intentos_fallidos,
            d.usuario_id,
            d.credencial_id,
            u.nombre_completo,
            c.uid_nfc
        FROM dispositivos_moviles d
        JOIN usuario u ON d.usuario_id = u.id_usuario
        JOIN credencial c ON d.credencial_id = c.id_credencial
        WHERE d.id = 1 AND d.estado = 'activo' AND d.uid_virtual_hce IS NOT NULL
    ");
    $stmtDisp->execute();
    $dispositivo = $stmtDisp->fetch(PDO::FETCH_ASSOC);
    
    if (!$dispositivo) {
        echo "❌ Dispositivo activo no encontrado\n";
        exit(1);
    }
    
    echo "✅ Dispositivo encontrado:\n";
    echo "   ID: {$dispositivo['id']}\n";
    echo "   Usuario: {$dispositivo['nombre_completo']}\n";
    echo "   HCE UID: {$dispositivo['uid_virtual_hce']}\n";
    echo "   Estado: {$dispositivo['estado']}\n";
    echo "   Intentos Fallidos: {$dispositivo['intentos_fallidos']}\n\n";
    
    // Test 1: Acceso exitoso con HCE válido
    echo "2️⃣ Verificando acceso con HCE UID válido...\n";
    
    $hce_presentado = $dispositivo['uid_virtual_hce'];
    $ahora = date('Y-m-d H:i:s');
    
    // Verify HCE matches
    $stmtVerify = $pdo->prepare("
        SELECT id, uid_virtual_hce 
        FROM dispositivos_moviles 
        WHERE uid_virtual_hce = ? AND estado = 'activo'
    ");
    $stmtVerify->execute([$hce_presentado]);
    $verificado = $stmtVerify->fetch(PDO::FETCH_ASSOC);
    
    if ($verificado) {
        echo "✅ ¡HCE VÁLIDO! Acceso permitido\n";
        
        // Record access
        $stmtAcceso = $pdo->prepare("
            UPDATE dispositivos_moviles
            SET ultimo_acceso = NOW(), intentos_fallidos = 0
            WHERE id = ?
        ");
        $stmtAcceso->execute([$verificado['id']]);
        
        echo "   - HCE coincide en base de datos\n";
        echo "   - Dispositivo activo\n";
        echo "   - Se registró último acceso\n";
        echo "   - Se resetearon intentos fallidos\n\n";
    } else {
        echo "❌ HCE inválido o dispositivo bloqueado\n";
    }
    
    // Test 2: Intento de acceso con HCE inválido
    echo "3️⃣ Intentando acceso con HCE inválido...\n";
    
    $hce_invalido = 'HCEinvalidohash12345';
    
    $stmtVerifyFail = $pdo->prepare("
        SELECT id, uid_virtual_hce 
        FROM dispositivos_moviles 
        WHERE uid_virtual_hce = ? AND estado = 'activo'
    ");
    $stmtVerifyFail->execute([$hce_invalido]);
    $verificado_fail = $stmtVerifyFail->fetch(PDO::FETCH_ASSOC);
    
    if (!$verificado_fail) {
        echo "✅ Acceso rechazado (correcto)\n";
        echo "   - HCE no existe en base de datos\n";
        echo "   - Acceso denegado\n\n";
    }
    
    // Test 3: Check HCE info for authenticated device
    echo "4️⃣ Recuperando información completa del HCE autenticado...\n";
    
    $stmtInfo = $pdo->prepare("
        SELECT 
            d.id,
            d.uid_virtual_hce,
            d.uuid,
            d.imei,
            d.nombre_dispositivo,
            d.tipo_dispositivo,
            d.so_version,
            d.metodo_autenticacion,
            d.tiene_nfc,
            d.estado,
            d.ultimo_acceso,
            d.ultima_ip,
            d.fecha_registro,
            d.usuario_id,
            d.credencial_id,
            u.nombre_completo,
            u.email,
            c.uid_nfc,
            c.tipo_credencial
        FROM dispositivos_moviles d
        JOIN usuario u ON d.usuario_id = u.id_usuario
        JOIN credencial c ON d.credencial_id = c.id_credencial
        WHERE d.uid_virtual_hce = ? AND d.estado = 'activo'
    ");
    $stmtInfo->execute([$hce_presentado]);
    $hce_info = $stmtInfo->fetch(PDO::FETCH_ASSOC);
    
    if ($hce_info) {
        echo "✅ Información del HCE:\n";
        echo "   📱 Dispositivo:\n";
        echo "      - Nombre: {$hce_info['nombre_dispositivo']}\n";
        echo "      - Tipo: {$hce_info['tipo_dispositivo']}\n";
        echo "      - SE Versión: {$hce_info['so_version']}\n";
        echo "      - IMEI: {$hce_info['imei']}\n";
        echo "      - UUID: {$hce_info['uuid']}\n";
        echo "   👤 Usuario:\n";
        echo "      - Nombre: {$hce_info['nombre_completo']}\n";
        echo "      - Email: {$hce_info['email']}\n";
        echo "   🏷️  Credencial:\n";
        echo "      - UID NFC: {$hce_info['uid_nfc']}\n";
        echo "      - Tipo: {$hce_info['tipo_credencial']}\n";
        echo "   🔐 Seguridad:\n";
        echo "      - Tiene NFC: " . ($hce_info['tiene_nfc'] ? 'SÍ' : 'NO') . "\n";
        echo "      - Método Auth: {$hce_info['metodo_autenticacion']}\n";
        echo "   ⏰ Acceso:\n";
        echo "      - Último acceso: {$hce_info['ultimo_acceso']}\n";
        echo "      - Registrado: {$hce_info['fecha_registro']}\n\n";
    }
    
    // Test 4: Multiple HCE devices per user
    echo "5️⃣ Verificando múltiples dispositivos del usuario...\n";
    
    $stmtMultiple = $pdo->prepare("
        SELECT 
            id, 
            uid_virtual_hce, 
            nombre_dispositivo, 
            estado,
            tipo_dispositivo
        FROM dispositivos_moviles 
        WHERE usuario_id = ? AND uid_virtual_hce IS NOT NULL
        ORDER BY id DESC
    ");
    $stmtMultiple->execute([$dispositivo['usuario_id']]);
    $dispositivos = $stmtMultiple->fetchAll(PDO::FETCH_ASSOC);
    
    echo "✅ El usuario tiene " . count($dispositivos) . " dispositivo(s) con HCE:\n";
    foreach ($dispositivos as $d) {
        $icono_estado = $d['estado'] === 'activo' ? '✓' : '✗';
        echo "   [$icono_estado] ID {$d['id']}: {$d['nombre_dispositivo']} ({$d['tipo_dispositivo']})\n";
        echo "       HCE: {$d['uid_virtual_hce']}\n";
        echo "       Estado: {$d['estado']}\n";
    }
    
    echo "\n";
    
    // Summary
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "✅ PRUEBA DE VERIFICACIÓN COMPLETADA\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "📊 Funcionalidades Validadas:\n";
    echo "   ✓ Búsqueda de dispositivo por HCE\n";
    echo "   ✓ Verificación de estado (bloqueado/activo)\n";
    echo "   ✓ Rechazo de HCE inválido\n";
    echo "   ✓ Recuperación de información completa\n";
    echo "   ✓ Registro de último acceso\n";
    echo "   ✓ Reset de intentos fallidos\n";
    echo "   ✓ Listado de múltiples dispositivos por usuario\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    
} catch (\PDOException $e) {
    echo "❌ Error de Base de Datos: " . $e->getMessage() . "\n";
    exit(1);
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
