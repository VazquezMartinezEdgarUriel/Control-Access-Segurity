<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

DB::statement('SET FOREIGN_KEY_CHECKS=0');

$tables = DB::select('SHOW TABLES');
foreach ($tables as $table) {
    $t = (array)$table;
    $table_name = array_values($t)[0];
    if ($table_name !== 'migrations') {
        echo "Dropping $table_name..." . PHP_EOL;
        DB::statement("DROP TABLE IF EXISTS `$table_name`");
    }
}

DB::statement('SET FOREIGN_KEY_CHECKS=1');
echo "Done!" . PHP_EOL;
