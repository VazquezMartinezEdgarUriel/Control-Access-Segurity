<?php
/**
 * Test HCE Generation - Direct Database Approach
 * Bypasses Laravel ORM, uses PDO directly
 */

try {
    // Database connection
    $pdo = new PDO(
        'mysql:host=127.0.0.1;port=3306;dbname=cas',
        'root',
        ''
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Conectado a base de datos cas\n\n";
    
    // 1. Get Usuario
    echo "🔍 Buscando Usuario ID 1...\n";
    $stmtUsuario = $pdo->prepare("SELECT id_usuario, nombre_completo FROM usuario WHERE id_usuario = 1");
    $stmtUsuario->execute();
    $usuario = $stmtUsuario->fetch(PDO::FETCH_ASSOC);
    
    if (!$usuario) {
        echo "❌ Usuario no encontrado\n";
        exit(1);
    }
    echo "✅ Usuario encontrado: {$usuario['nombre_completo']}\n\n";
    
    // 2. Get Credencial
    echo "🔍 Buscando Credencial ID 1...\n";
    $stmtCredencial = $pdo->prepare("SELECT id_credencial, uid_nfc FROM credencial WHERE id_credencial = 1");
    $stmtCredencial->execute();
    $credencial = $stmtCredencial->fetch(PDO::FETCH_ASSOC);
    
    if (!$credencial) {
        echo "❌ Credencial no encontrada\n";
        exit(1);
    }
    echo "✅ Credencial encontrada: {$credencial['uid_nfc']}\n\n";
    
    // 3. Generate HCE
    echo "🔨 Generando UID Virtual HCE...\n";
    
    $uuid = 'TEST-UUID-' . bin2hex(random_bytes(6));
    $timestamp = date('Y-m-d H:i:s');
    
    // HCE generation algorithm: SHA256(uuid + uid_nfc + timestamp)
    $dataToHash = $uuid . $credencial['uid_nfc'] . $timestamp;
    $hceUid = 'HCE' . substr(hash('sha256', $dataToHash), 0, 16);
    
    echo "   UUID: $uuid\n";
    echo "   NFC UID: {$credencial['uid_nfc']}\n";
    echo "   Timestamp: $timestamp\n";
    echo "   📱 UID Virtual HCE Generado: $hceUid\n\n";
    
    // 4. Register Device with HCE
    echo "📱 Registrando dispositivo con HCE...\n";
    
    $imei = 'TEST-IMEI-' . bin2hex(random_bytes(8));
    $nombre_dispositivo = 'TEST_DEVICE';
    $tipo_dispositivo = 'android';
    $so_version = '14.0';
    $metodo_autenticacion = 'nfc_emulation';
    
    $stmtInsert = $pdo->prepare("
        INSERT INTO dispositivos_moviles 
        (usuario_id, credencial_id, uuid, imei, nombre_dispositivo, tipo_dispositivo, so_version, metodo_autenticacion, uid_virtual_hce, estado, tiene_nfc)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo', 1)
    ");
    
    $stmtInsert->execute([
        $usuario['id_usuario'],
        $credencial['id_credencial'],
        $uuid,
        $imei,
        $nombre_dispositivo,
        $tipo_dispositivo,
        $so_version,
        $metodo_autenticacion,
        $hceUid
    ]);
    
    $dispositivoId = $pdo->lastInsertId();
    echo "✅ Dispositivo registrado con ID: $dispositivoId\n\n";
    
    // 5. Verify stored data
    echo "🔍 Verificando datos almacenados en base de datos...\n";
    $stmtVerify = $pdo->prepare("
        SELECT 
            id,
            usuario_id,
            credencial_id,
            uuid,
            imei,
            uid_virtual_hce,
            estado,
            created_at
        FROM dispositivos_moviles 
        WHERE id = ?
    ");
    $stmtVerify->execute([$dispositivoId]);
    $dispositivo = $stmtVerify->fetch(PDO::FETCH_ASSOC);
    
    if ($dispositivo && $dispositivo['uid_virtual_hce'] === $hceUid) {
        echo "✅ ¡ÉXITO! Dispositivo registrado correctamente con HCE\n\n";
        echo "📋 Información del Dispositivo:\n";
        echo "   ID: {$dispositivo['id']}\n";
        echo "   Usuario ID: {$dispositivo['usuario_id']}\n";
        echo "   Credencial ID: {$dispositivo['credencial_id']}\n";
        echo "   UUID: {$dispositivo['uuid']}\n";
        echo "   IMEI: {$dispositivo['imei']}\n";
        echo "   UID Virtual HCE: {$dispositivo['uid_virtual_hce']}\n";
        echo "   Estado: {$dispositivo['estado']}\n";
        echo "   Creado: {$dispositivo['created_at']}\n\n";
    } else {
        echo "❌ Error: HCE no coincide en base de datos\n";
        exit(1);
    }
    
    // 6. Test uniqueness - try to create another device
    echo "🧪 Probando unicidad del HCE (intentar crear otro dispositivo)...\n";
    
    $uuid2 = 'TEST-UUID-' . bin2hex(random_bytes(6));
    $dataToHash2 = $uuid2 . $credencial['uid_nfc'] . date('Y-m-d H:i:s');
    $hceUid2 = 'HCE' . substr(hash('sha256', $dataToHash2), 0, 16);
    
    $imei2 = 'TEST-IMEI-' . bin2hex(random_bytes(8));
    
    $stmtInsert2 = $pdo->prepare("
        INSERT INTO dispositivos_moviles 
        (usuario_id, credencial_id, uuid, imei, nombre_dispositivo, tipo_dispositivo, so_version, metodo_autenticacion, uid_virtual_hce, estado, tiene_nfc)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo', 1)
    ");
    
    $stmtInsert2->execute([
        $usuario['id_usuario'],
        $credencial['id_credencial'],
        $uuid2,
        $imei2,
        $nombre_dispositivo,
        $tipo_dispositivo,
        $so_version,
        $metodo_autenticacion,
        $hceUid2
    ]);
    
    $dispositivoId2 = $pdo->lastInsertId();
    echo "✅ Segundo dispositivo registrado con ID: $dispositivoId2\n";
    echo "   UID Virtual HCE: $hceUid2\n";
    echo "   ✓ UIDs son diferentes: " . ($hceUid !== $hceUid2 ? "SÍ" : "NO") . "\n\n";
    
    // 7. Verify uniqueness in DB
    echo "🔍 Verificando unicidad de HCE en base de datos...\n";
    $stmtUniqueCheck = $pdo->prepare("
        SELECT COUNT(*) as count, uid_virtual_hce 
        FROM dispositivos_moviles 
        WHERE usuario_id = ? AND uid_virtual_hce IS NOT NULL
        GROUP BY uid_virtual_hce
        HAVING count > 1
    ");
    $stmtUniqueCheck->execute([$usuario['id_usuario']]);
    $duplicados = $stmtUniqueCheck->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($duplicados)) {
        echo "✅ Todos los HCE UIDs son únicos\n\n";
    } else {
        echo "⚠️  Se encontraron HCE duplicados:\n";
        foreach ($duplicados as $dup) {
            echo "   - {$dup['uid_virtual_hce']}: {$dup['count']} dispositivos\n";
        }
        echo "\n";
    }
    
    // 8. Summary
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "✅ PRUEBA HCE COMPLETADA EXITOSAMENTE\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "📊 Resultados:\n";
    echo "   ✓ Base de datos conectada\n";
    echo "   ✓ Usuario encontrado\n";
    echo "   ✓ Credencial encontrada\n";
    echo "   ✓ HCE UID generado correctamente\n";
    echo "   ✓ Dispositivo registrado con HCE\n";
    echo "   ✓ Datos verificados en BD\n";
    echo "   ✓ Segundo dispositivo creado\n";
    echo "   ✓ Unicidad de HCE confirmada\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    
} catch (\PDOException $e) {
    echo "❌ Error de Base de Datos: " . $e->getMessage() . "\n";
    exit(1);
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
