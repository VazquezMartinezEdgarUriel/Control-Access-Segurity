#!/bin/bash
# Script para iniciar el servicio NFC en Linux/Mac

cd "$(dirname "$0")"

echo ""
echo "========================================"
echo "  NFC Service para ACR122U"
echo "========================================"
echo ""

# Verificar si node está instalado
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js no está instalado"
    echo "Descargalo de: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js detectado: $(node -v)"

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    echo ""
    echo "Instalando dependencias..."
    npm install
fi

echo ""
echo "========================================"
echo "   Iniciando servicio NFC..."
echo "========================================"
echo ""
echo "🚀 Servicio corriendo en: ws://localhost:3001"
echo ""
echo "INSTRUCCIONES:"
echo "1. Abre: http://127.0.0.1:8000/credenciales"
echo "2. Haz clic en 'Activar Lector NFC'"
echo "3. Acerca una tarjeta NFC al lector ACR122U"
echo ""
echo "Presiona CTRL+C para detener el servicio"
echo ""

sleep 2
npm start
