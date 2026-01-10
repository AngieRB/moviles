<?php

use Illuminate\Support\Facades\Route;
use App\Events\PruebaEvent;

Route::get('/', function () {
    return view('welcome');
});


Route::get('/disparar-evento', function () {
    event(new PruebaEvent('¡Hola desde Laravel a React Native!'));
    return 'Evento enviado. Revisa tu consola de Pusher o tu Celular.';
});
