<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=cas', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check usuario table
    echo "Estructura de tabla 'usuario':\n";
    $desc = $pdo->query("DESCRIBE usuario")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($desc as $col) {
        echo "  - {$col['Field']}: {$col['Type']}\n";
    }
    
    echo "\nEstructura de tabla 'credencial':\n";
    $desc = $pdo->query("DESCRIBE credencial")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($desc as $col) {
        echo "  - {$col['Field']}: {$col['Type']}\n";
    }
    
    echo "\nEstructura de tabla 'dispositivos_moviles':\n";
    $desc = $pdo->query("DESCRIBE dispositivos_moviles")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($desc as $col) {
        echo "  - {$col['Field']}: {$col['Type']}\n";
    }
    
    echo "\nDatos en usuario tabla (primeros 3):\n";
    $usuarios = $pdo->query("SELECT * FROM usuario LIMIT 3")->fetchAll(PDO::FETCH_ASSOC);
    print_r($usuarios);
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
