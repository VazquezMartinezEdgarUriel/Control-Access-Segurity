@echo off
REM ============================================
REM Control Access - Script de Inicio Completo
REM ============================================
REM Este script inicia todos los servicios necesarios

setlocal enabledelayedexpansion
title Control Access - Sistema Completo

cls
echo.
echo ====================================
echo    Control Access Startup Script
echo ====================================
echo.

REM Colores
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "RESET=[0m"

REM Verificar que estamos en la carpeta correcta
cd /d "%~dp0" 2>nul || (
    echo Error: No se pudo cambiar de directorio
    pause
    exit /b 1
)

echo [*] Directorio de trabajo: %CD%
echo.

REM ============================================
REM 1. Iniciar Laravel Backend
REM ============================================
echo [1/3] Iniciando Laravel Backend en puerto 8000...
echo.
start /B cmd /c "cd C:\xampp\htdocs\ControlAccessSegurity && php artisan serve --host 0.0.0.0 --port 8000"
timeout /t 3 /nobreak

REM ============================================
REM 2. Iniciar NFC Service (Opcional)
REM ============================================
echo [2/3] Iniciando NFC Service en puerto 3001...
echo.
start /B node "C:\Users\uriel\OneDrive\Documentos\GitHub\Proyecto PAN\Control-Access-Segurity\nfc-service\app-v4.js"
timeout /t 2 /nobreak

REM ============================================
REM 3. Iniciar Expo Go - MOBILE APP
REM ============================================
echo [3/3] Iniciando Expo Go en puerto 8082...
echo.
cd /d "C:\Users\uriel\OneDrive\Documentos\GitHub\Proyecto PAN\Control-Access-Segurity\app_mobile"
npm start

REM Si npm start falla, vuelve a intentar
if errorlevel 1 (
    echo.
    echo [!] Error iniciando Expo. Reintentando...
    timeout /t 2 /nobreak
    npm start
)

pause
