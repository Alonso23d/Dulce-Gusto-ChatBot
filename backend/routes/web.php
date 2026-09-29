<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/migrar-bd-secreta', function () {
    Artisan::call('migrate', ['--force' => true]);
    return "¡Las tablas se han creado exitosamente en Clever Cloud!";
});

Route::get('/llenar-bd-secreta', function () {
    try {
        Artisan::call('db:seed', ['--force' => true]);
        return "Éxito. Resultado de la consola: <br><pre>" . Artisan::output() . "</pre>";
    } catch (\Exception $e) {
        return "Error al sembrar los datos: " . $e->getMessage();
    }
});