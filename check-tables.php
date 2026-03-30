<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=cas', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $tables = $pdo->query("SHOW TABLES;")->fetchAll(PDO::FETCH_COLUMN);
    
    echo "Tablas en cas:\n";
    foreach ($tables as $table) {
        echo "  - $table\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
