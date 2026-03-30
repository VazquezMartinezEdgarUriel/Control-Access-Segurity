# Control Access - Mobile Device Setup (Windows)
# Script para configurar el sistema de dispositivos móviles

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Control Access - Mobile Device Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Ejecutar migraciones
Write-Host "[1/4] Ejecutando migraciones de base de datos..." -ForegroundColor Blue
php artisan migrate

Write-Host ""

# 2. Verificar rutas web
Write-Host "[2/4] Rutas web configuradas:" -ForegroundColor Blue
Write-Host "  GET /registrar-dispositivo" -ForegroundColor White
Write-Host "  GET /verificar-acceso" -ForegroundColor White
Write-Host "  GET /mis-dispositivos" -ForegroundColor White

Write-Host ""

# 3. APIs disponibles
Write-Host "[3/4] Endpoints API disponibles:" -ForegroundColor Blue
Write-Host "  POST   /api/dispositivos-moviles/registrar" -ForegroundColor White
Write-Host "  POST   /api/dispositivos-moviles/verificar-credencial" -ForegroundColor White
Write-Host "  GET    /api/dispositivos-moviles/usuario/{usuarioId}" -ForegroundColor White
Write-Host "  GET    /api/dispositivos-moviles/{dispositivoId}" -ForegroundColor White
Write-Host "  PUT    /api/dispositivos-moviles/{dispositivoId}" -ForegroundColor White
Write-Host "  POST   /api/dispositivos-moviles/{dispositivoId}/acceso" -ForegroundColor White
Write-Host "  PATCH  /api/dispositivos-moviles/{dispositivoId}/bloquear" -ForegroundColor White
Write-Host "  PATCH  /api/dispositivos-moviles/{dispositivoId}/desbloquear" -ForegroundColor White
Write-Host "  DELETE /api/dispositivos-moviles/{dispositivoId}" -ForegroundColor White
Write-Host "  POST   /api/dispositivos-moviles/generar-qr-registro" -ForegroundColor White

Write-Host ""

# 4. Estado del servicio NFC
Write-Host "[4/4] Verificando servicio NFC en puerto 3001..." -ForegroundColor Blue
try {
    $testConnection = Test-NetConnection -ComputerName localhost -Port 3001 -InformationLevel Quiet -WarningAction SilentlyContinue
    if ($testConnection) {
        Write-Host "✓ Servicio NFC activo en puerto 3001" -ForegroundColor Green
    } else {
        Write-Host "⚠ Servicio NFC no está en ejecución" -ForegroundColor Yellow
        Write-Host "  Para iniciar: npm start (desde carpeta nfc-service)" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠ No se pudo verificar el servicio NFC" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Configuración completada" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Páginas disponibles:" -ForegroundColor Cyan
Write-Host "  1. Registrar dispositivo: http://localhost/ControlAccessSegurity/public/registrar-dispositivo" -ForegroundColor White
Write-Host "  2. Verificar acceso:     http://localhost/ControlAccessSegurity/public/verificar-acceso" -ForegroundColor White
Write-Host "  3. Mis dispositivos:     http://localhost/ControlAccessSegurity/public/mis-dispositivos" -ForegroundColor White

Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Asegúrate de tener usuarios registrados en la base de datos" -ForegroundColor White
Write-Host "2. Asigna credenciales NFC a los usuarios" -ForegroundColor White
Write-Host "3. Accede a /registrar-dispositivo para registrar un dispositivo" -ForegroundColor White
Write-Host "4. Usa /verificar-acceso para probar la autenticación" -ForegroundColor White
Write-Host "5. Administra dispositivos en /mis-dispositivos" -ForegroundColor White

Write-Host ""
Write-Host "Documentación completa: Ver MOBILE_DEVICES_README.md" -ForegroundColor Cyan
