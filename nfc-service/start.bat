@echo off
REM Script para iniciar el servicio NFC

cd /d "%~dp0"

echo.
echo ========================================
echo   NFC Service para ACR122U
echo ========================================
echo.

REM Verificar si node está instalado
node -v >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js no está instalado
    echo Descargalo de: https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js detectado: && node -v

REM Instalar dependencias si no existen
if not exist "node_modules" (
    echo.
    echo Instalando dependencias...
    call npm install
)

echo.
echo ========================================
echo   Iniciando servicio NFC...
echo ========================================
echo.
echo 🚀 Servicio corriendo en: ws://localhost:3001
echo.
echo INSTRUCCIONES:
echo 1. Abre: http://127.0.0.1:8000/credenciales
echo 2. Haz clic en "Activar Lector NFC"
echo 3. Acerca una tarjeta NFC al lector ACR122U
echo.
echo Presiona CTRL+C para detener el servicio
echo.

timeout /t 2 /nobreak
call npm start
