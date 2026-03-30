<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Response;

// Servir archivos HTML estáticos desde public
Route::get('/', function () {
    return response(file_get_contents(public_path('index.html')), 200)
        ->header('Content-Type', 'text/html; charset=UTF-8');
})->name('dashboard');

Route::get('/usuario', function () {
    return response(file_get_contents(public_path('usuario.html')), 200)
        ->header('Content-Type', 'text/html; charset=UTF-8');
})->name('usuarios');

Route::get('/usuario.html', function () {
    return response(file_get_contents(public_path('usuario.html')), 200)
        ->header('Content-Type', 'text/html; charset=UTF-8');
});

Route::get('/visitantes', function () {
    return response(file_get_contents(public_path('visitantes.html')), 200)
        ->header('Content-Type', 'text/html; charset=UTF-8');
})->name('visitantes');

Route::get('/visitantes.html', function () {
    return response(file_get_contents(public_path('visitantes.html')), 200)
        ->header('Content-Type', 'text/html; charset=UTF-8');
});

Route::get('/horarios', function () {
    return response(file_get_contents(public_path('horarios.html')), 200)
        ->header('Content-Type', 'text/html; charset=UTF-8');
})->name('horarios');

Route::get('/horarios.html', function () {
    return response(file_get_contents(public_path('horarios.html')), 200)
        ->header('Content-Type', 'text/html; charset=UTF-8');
});

Route::get('/reportes', function () {
    return response(file_get_contents(public_path('reportes.html')), 200)
        ->header('Content-Type', 'text/html; charset=UTF-8');
})->name('reportes');

Route::get('/reportes.html', function () {
    return response(file_get_contents(public_path('reportes.html')), 200)
        ->header('Content-Type', 'text/html; charset=UTF-8');
});

Route::get('/registrar-dispositivo', function () {
    return response(file_get_contents(public_path('registrar-dispositivo.html')), 200)
        ->header('Content-Type', 'text/html; charset=UTF-8');
})->name('registrar-dispositivo');

Route::get('/registrar-dispositivo.html', function () {
    return response(file_get_contents(public_path('registrar-dispositivo.html')), 200)
        ->header('Content-Type', 'text/html; charset=UTF-8');
});

Route::get('/verificar-acceso', function () {
    return response(file_get_contents(public_path('verificar-acceso.html')), 200)
        ->header('Content-Type', 'text/html; charset=UTF-8');
})->name('verificar-acceso');

Route::get('/verificar-acceso.html', function () {
    return response(file_get_contents(public_path('verificar-acceso.html')), 200)
        ->header('Content-Type', 'text/html; charset=UTF-8');
});

Route::get('/mis-dispositivos', function () {
    return response(file_get_contents(public_path('mis-dispositivos.html')), 200)
        ->header('Content-Type', 'text/html; charset=UTF-8');
})->name('mis-dispositivos');

Route::get('/mis-dispositivos.html', function () {
    return response(file_get_contents(public_path('mis-dispositivos.html')), 200)
        ->header('Content-Type', 'text/html; charset=UTF-8');
});

Route::get('/testing-panel', function () {
    return response(file_get_contents(public_path('testing-panel.html')), 200)
        ->header('Content-Type', 'text/html; charset=UTF-8');
})->name('testing-panel');

Route::get('/testing-panel.html', function () {
    return response(file_get_contents(public_path('testing-panel.html')), 200)
        ->header('Content-Type', 'text/html; charset=UTF-8');
});

Route::get('/credenciales', function () {
    return response(file_get_contents(public_path('credenciales.html')), 200)
        ->header('Content-Type', 'text/html; charset=UTF-8');
})->name('credenciales');

Route::get('/credenciales.html', function () {
    return response(file_get_contents(public_path('credenciales.html')), 200)
        ->header('Content-Type', 'text/html; charset=UTF-8');
});
