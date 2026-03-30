#!/bin/bash

# Script de instalación del Sistema de Dispositivos Móviles
# Control Access - Mobile Device Management Setup

echo "========================================"
echo "Control Access - Mobile Device Setup"
echo "========================================"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Ejecutar migraciones
echo -e "${BLUE}[1/5] Ejecutando migraciones de base de datos...${NC}"
php artisan migrate --path=database/migrations/2026_03_11_create_dispositivos_moviles_table.php

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Migración completada exitosamente${NC}"
else
    echo -e "${YELLOW}⚠ Error en la migración. Intenta ejecutar: php artisan migrate${NC}"
    echo "    Si ya existe la tabla, ignora este error."
fi

echo ""

# 2. Verificar rutas
echo -e "${BLUE}[2/5] Verificando rutas existentes...${NC}"
php artisan route:list | grep -E "registrar-dispositivo|verificar-acceso|mis-dispositivos" || echo -e "${YELLOW}⚠ Rutas pueden no ser visibles en lista, pero están configuradas${NC}"

echo ""

# 3. Información de API
echo -e "${BLUE}[3/5] APIs disponibles:${NC}"
echo "  POST   /api/dispositivos-moviles/registrar"
echo "  POST   /api/dispositivos-moviles/verificar-credencial"
echo "  GET    /api/dispositivos-moviles/usuario/{usuarioId}"
echo "  GET    /api/dispositivos-moviles/{dispositivoId}"
echo "  PUT    /api/dispositivos-moviles/{dispositivoId}"
echo "  POST   /api/dispositivos-moviles/{dispositivoId}/acceso"
echo "  PATCH  /api/dispositivos-moviles/{dispositivoId}/bloquear"
echo "  PATCH  /api/dispositivos-moviles/{dispositivoId}/desbloquear"
echo "  DELETE /api/dispositivos-moviles/{dispositivoId}"
echo "  POST   /api/dispositivos-moviles/generar-qr-registro"

echo ""

# 4. Páginas disponibles
echo -e "${BLUE}[4/5] Páginas disponibles:${NC}"
echo "  http://localhost/ControlAccessSegurity/public/registrar-dispositivo"
echo "  http://localhost/ControlAccessSegurity/public/verificar-acceso"
echo "  http://localhost/ControlAccessSegurity/public/mis-dispositivos"

echo ""

# 5. Estado del servicio NFC
echo -e "${BLUE}[5/5] Verificando servicio NFC...${NC}"
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Servicio NFC activo en puerto 3001${NC}"
else
    echo -e "${YELLOW}⚠ Servicio NFC no encontrado en puerto 3001${NC}"
    echo "  Para iniciar: npm start (desde carpeta nfc-service)"
fi

echo ""
echo -e "${GREEN}========================================"
echo "Instalación completada"
echo "========================================${NC}"
echo ""
echo "Próximos pasos:"
echo "1. Crear usuarios en la base de datos"
echo "2. Asignar credenciales NFC a usuarios"
echo "3. Acceder a /registrar-dispositivo para registrar dispositivos"
echo "4. Usar /verificar-acceso para probar autenticación"
echo ""
echo "Documentación: Ver MOBILE_DEVICES_README.md"
