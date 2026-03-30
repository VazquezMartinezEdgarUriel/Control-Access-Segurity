<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=cas', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Verificar
    $cols = $pdo->query('DESCRIBE credencial')->fetchAll(PDO::FETCH_OBJ);
    foreach ($cols as $col) {
        echo $col->Field . ' | ' . $col->Type . ' | ' . $col->Null . ' | ' . $col->Default . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
