# ============================================
# Control Access - Script de Inicio Completo
# PowerShell Version
# ============================================
# Uso: .\START_ALL.ps1

param(
    [switch]$SkipNFC = $false,
    [switch]$SkipLaravel = $false,
    [switch]$OnlyExpo = $false
)

Write-Host "
╔════════════════════════════════════════╗
║   Control Access - Sistema Completo   ║
║   PowerShell Startup Script           ║
╚════════════════════════════════════════╝
" -ForegroundColor Cyan

Write-Host "📍 Directorio de trabajo: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

$ProjectRoot = "C:\Users\uriel\OneDrive\Documentos\GitHub\Proyecto PAN\Control-Access-Segurity"
$LaravelPath = "C:\xampp\htdocs\ControlAccessSegurity"
$MobileAppPath = "$ProjectRoot\app_mobile"
$NFCServicePath = "$ProjectRoot\nfc-service"

# ============================================
# Función para iniciar procesos en background
# ============================================
function Start-Service {
    param(
        [string]$ServiceName,
        [string]$Command,
        [string]$WorkingDirectory,
        [int]$Port
    )
    
    Write-Host "🚀 Iniciando: $ServiceName (Puerto $Port)..." -ForegroundColor Green
    
    if ($Command -like "*php*") {
        Start-Process -FilePath "cmd.exe" -ArgumentList "/c $Command" -WorkingDirectory $WorkingDirectory -NoNewWindow
    }
    elseif ($Command -like "*npm*" -or $Command -like "*node*") {
        Start-Process -FilePath "cmd.exe" -ArgumentList "/c $Command" -WorkingDirectory $WorkingDirectory
    }
    
    Start-Sleep -Seconds 2
}

# ============================================
# 1. Laravel Backend
# ============================================
if (-not $SkipLaravel -and -not $OnlyExpo) {
    Write-Host "════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host "[1/3] Laravel Backend" -ForegroundColor Yellow
    Write-Host "════════════════════════════════════════" -ForegroundColor Yellow
    
    $laravelCmd = "cd `"$LaravelPath`" && php artisan serve --host 0.0.0.0 --port 8000"
    Start-Service -ServiceName "Laravel" -Command $laravelCmd -WorkingDirectory $LaravelPath -Port 8000
    
    Write-Host "✅ Laravel iniciado en http://0.0.0.0:8000" -ForegroundColor Green
    Write-Host "   Acceso desde móvil: http://192.168.0.104:8000" -ForegroundColor Green
    Write-Host ""
}

# ============================================
# 2. NFC Service
# ============================================
if (-not $SkipNFC -and -not $OnlyExpo) {
    Write-Host "════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host "[2/3] NFC Service" -ForegroundColor Yellow
    Write-Host "════════════════════════════════════════" -ForegroundColor Yellow
    
    $nfcCmd = "cd `"$NFCServicePath`" && node app-v4.js"
    Start-Service -ServiceName "NFC Service" -Command $nfcCmd -WorkingDirectory $NFCServicePath -Port 3001
    
    Write-Host "✅ NFC Service iniciado en http://localhost:3001" -ForegroundColor Green
    Write-Host ""
}

# ============================================
# 3. Expo Go - Mobile App
# ============================================
Write-Host "════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "[3/3] Expo Go - Mobile App" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════" -ForegroundColor Yellow

Write-Host ""
Write-Host "📱 Iniciando servidor Expo..." -ForegroundColor Cyan

Set-Location $MobileAppPath

# Verificar si node_modules existe
if (-not (Test-Path "$MobileAppPath\node_modules")) {
    Write-Host "⚠️  Instalando dependencias (primera vez)..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "🎯 IMPORTANTE:" -ForegroundColor Yellow
Write-Host "   1. Escanea el QR que aparecerá abajo con Expo Go" -ForegroundColor White
Write-Host "   2. La app se cargará automáticamente en tu móvil" -ForegroundColor White
Write-Host "   3. Presiona 'r' para recargar si haces cambios" -ForegroundColor White
Write-Host "   4. Presiona 'Ctrl+C' para salir" -ForegroundColor White
Write-Host ""

# Iniciar Expo
npm start

Write-Host ""
Write-Host "✅ Todos los servicios finalizados" -ForegroundColor Green
