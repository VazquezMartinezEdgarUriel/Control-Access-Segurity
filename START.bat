@echo off
REM ============================================
REM Control Access - Startup Manager
REM Ejecuta todos los servicios en paralelo
REM ============================================

setlocal enabledelayedexpansion
chcp 65001 >nul 2>&1
cls

echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║     🚀 Control Access - Startup Manager 🚀            ║
echo ║        Running All Services...                        ║
echo ╚═══════════════════════════════════════════════════════╝
echo.

set LARAVEL_PATH=C:\xampp\htdocs\ControlAccessSegurity
set PROJECT_PATH=C:\Users\uriel\OneDrive\Documentos\GitHub\Proyecto PAN\Control-Access-Segurity
set NFC_PATH=%PROJECT_PATH%\nfc-service
set MOBILE_PATH=%PROJECT_PATH%\app_mobile

REM Verificar directorios
if not exist "%LARAVEL_PATH%" (
    echo ❌ Error: Laravel path not found: %LARAVEL_PATH%
    pause
    exit /b 1
)

if not exist "%MOBILE_PATH%" (
    echo ❌ Error: Mobile app path not found: %MOBILE_PATH%
    pause
    exit /b 1
)

echo [✓] Paths verified
echo.

REM ============================================
REM Iniciar servicios
REM ============================================

echo ════════════════════════════════════════════════
echo [1/3] Starting Laravel Backend (Port 8000)...
echo ════════════════════════════════════════════════
start "Laravel Backend" cmd /k "cd /d "%LARAVEL_PATH%" && php artisan serve --host 0.0.0.0 --port 8000"
timeout /t 2 /nobreak >nul

echo [✓] Laravel started
echo.

echo ════════════════════════════════════════════════
echo [2/3] Starting NFC Service (Port 3001)...
echo ════════════════════════════════════════════════
start "NFC Service" cmd /k "cd /d "%NFC_PATH%" && node app-v4.js"
timeout /t 2 /nobreak >nul

echo [✓] NFC Service started
echo.

echo ════════════════════════════════════════════════
echo [3/3] Starting Expo Go (Port 8082)...
echo ════════════════════════════════════════════════

cd /d "%MOBILE_PATH%"

REM Verificar node_modules
if not exist "%MOBILE_PATH%\node_modules" (
    echo Installing dependencies...
    call npm install >nul 2>&1
)

echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║        📱 STARTING EXPO - SCAN THE QR CODE           ║
echo ║                                                       ║
echo ║  IP: 192.168.0.104:8082                             ║
echo ║                                                       ║
echo ║  Commands:                                            ║
echo ║  - Press r to reload                                  ║
echo ║  - Press m to show menu                               ║
echo ║  - Press Ctrl+C to exit                               ║
echo ╚═══════════════════════════════════════════════════════╝
echo.

call npm start

REM Si npm start falla, reintentar
if errorlevel 1 (
    echo.
    echo ⚠️  Error starting npm. Retrying...
    timeout /t 3 /nobreak
    call npm start
)

goto :end

:end
echo.
echo ✅ Session closed
echo.
pause
