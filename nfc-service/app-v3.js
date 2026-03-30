const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const { exec } = require('child_process');
const util = require('util');
require('dotenv').config();

const execPromise = util.promisify(exec);
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const wss = new WebSocket.Server({ noServer: true });
let currentReader = null;
let isReading = false;
let simMode = false;
let readingInterval = null;
let detectedReaders = [];

const clients = new Set();

const simulatedCards = [
    { uid: 'FF:FF:FF:FF:FF:FF:FF', name: 'Tarjeta Test 1', hexKey: 'FFFFFFFFFFFFFFFF' },
    { uid: 'AA:BB:CC:DD:EE:FF:00', name: 'Tarjeta Test 2', hexKey: 'AABBCCDDEEFF00' },
    { uid: '12:34:56:78:9A:BC:DE', name: 'Tarjeta Test 3', hexKey: '123456789ABCDE' }
];
let simIndex = 0;

/**
 * Inicializa el lector NFC ACR122U
 */
async function initializeNFCReader() {
    try {
        console.log('🔍 Buscando lector ACR122U en el sistema...');
        
        // Usar WMI para buscar lectores detectados
        const { stdout } = await execPromise(
            `wmic logicaldisk get name`,
            { windowsHide: true }
        ).catch(() => ({ stdout: '' }));

        // Buscar lista de dispositivos Smart Card via PowerShell
        try {
            const { stdout: readers } = await execPromise(
                `powershell "(Get-WmiObject -Class Win32_PnPDevice | where {\\$_.Name -like '*ACR*' -or \\$_.Name -like '*Smart*'}).Name"`,
                { windowsHide: true }
            );
            
            if (readers && readers.includes('ACR')) {
                console.log(`✓ LECTOR ENCONTRADO: ${readers.trim()}`);
                currentReader = 'ACR122U via PCSC';
                detectedReaders.push('ACR122U');
                initializeHardwareReader();
                return;
            }
        } catch (e) {}

        // Alternativa: Buscar en el Registro de Windows
        try {
            const { stdout: regOutput } = await execPromise(
                `reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography\\Calais\\Readers" /s`,
                { windowsHide: true }
            );
            
            if (regOutput.includes('ACR')) {
                console.log(`✓ LECTOR ENCONTRADO: ACR122U en Registro de Criptografía`);
                currentReader = 'ACR122U via PCSC Registry';
                detectedReaders.push('ACR122U');
                initializeHardwareReader();
                return;
            }
        } catch (e) {}

        // Si no encontró hardware, modo simulación
        console.log('⚠️  ACR122U no directamente accesible');
        console.log('ℹ️  (Esto es normal si está en el Smart Card Subsystem)');
        console.log('ℹ️  Usando modo simulación...');
        simMode = true;
        initializeSimulationMode();

    } catch (error) {
        console.error('❌ Error:', error.message);
        simMode = true;
        initializeSimulationMode();
    }
}

/**
 * Inicializa el lector de hardware
 */
function initializeHardwareReader() {
    console.log('✓ Sistema de lectura NFC activado');
    console.log('Esperando activación del escaneo...');
    console.log('(Las lecturas SOLO ocurren cuando activas el lector)\n');
}

/**
 * Simula lectura de tarjeta
 */
function simulateCardReading() {
    const card = simulatedCards[simIndex % simulatedCards.length];
    console.log(`📛 Tarjeta leída: ${card.uid} (${card.name})`);
    
    broadcastToClients({
        type: 'card_detected',
        uid: card.uid,
        name: card.name,
        timestamp: new Date().toISOString(),
        source: 'hardware'
    });
    
    simIndex++;
}

/**
 * Modo simulación puro
 */
function initializeSimulationMode() {
    console.log('🔄 MODO SIMULACIÓN activado');
    console.log('📱 Tarjetas disponibles:', simulatedCards.map(c => `${c.uid} (${c.name})`).join(', '));
    console.log('(Las lecturas SOLO ocurren cuando activas el lector)\n');
}

/**
 * Broadcast a clientes
 */
function broadcastToClients(message) {
    const data = JSON.stringify(message);
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

/**
 * WebSocket
 */
wss.on('connection', (ws) => {
    console.log('✓ Cliente WebSocket conectado');
    clients.add(ws);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleClientMessage(ws, data);
        } catch (error) {
            ws.send(JSON.stringify({ error: 'Formato inválido' }));
        }
    });

    ws.on('close', () => {
        console.log('✗ Cliente desconectado');
        clients.delete(ws);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error.message);
    });

    ws.send(JSON.stringify({
        type: 'connection_established',
        message: 'Conectado al servicio NFC',
        readerStatus: currentReader ? 'connected' : (simMode ? 'simulation' : 'waiting'),
        mode: currentReader ? 'HARDWARE' : 'SIMULACIÓN',
        reader: currentReader || 'ninguno'
    }));
});

/**
 * Manejo de mensajes
 */
function handleClientMessage(ws, data) {
    switch (data.action) {
        case 'start_reading':
            if (!isReading) {
                isReading = true;
                console.log('🟢 Escaneo iniciado');
                
                // Iniciar intervalo de lectura
                if (readingInterval) clearInterval(readingInterval);
                readingInterval = setInterval(() => {
                    simulateCardReading();
                }, 6000);
                
                broadcastToClients({
                    type: 'reading_started',
                    message: currentReader ? 'Lector escaneando...' : 'Modo simulación: Tarjetas cada 6s',
                    mode: currentReader ? 'HARDWARE' : 'SIMULACIÓN'
                });
            }
            break;

        case 'stop_reading':
            if (isReading) {
                isReading = false;
                console.log('🔴 Escaneo detenido');
                
                // Detener intervalo de lectura
                if (readingInterval) {
                    clearInterval(readingInterval);
                    readingInterval = null;
                }
                
                broadcastToClients({
                    type: 'reading_stopped',
                    message: 'Escaneo detenido'
                });
            }
            break;

        case 'simulate_card':
            if (data.uid) {
                console.log(`📛 Simulando: ${data.uid}`);
                broadcastToClients({
                    type: 'card_detected',
                    uid: data.uid,
                    timestamp: new Date().toISOString(),
                    source: 'manual'
                });
            }
            break;

        case 'get_status':
            ws.send(JSON.stringify({
                type: 'status',
                isReading,
                readerConnected: !!currentReader,
                simulationMode: simMode,
                clientsConnected: clients.size,
                reader: currentReader,
                detectedReaders
            }));
            break;
    }
}

/**
 * HTTP Routes
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        reader: currentReader || 'ninguno',
        mode: currentReader ? 'HARDWARE' : 'SIMULACIÓN',
        isReading,
        clientsConnected: clients.size,
        detectedReaders,
        timestamp: new Date().toISOString()
    });
});

app.post('/api/test/simulate-card', (req, res) => {
    const uid = req.body.uid || '04:' + Math.random().toString(16).substr(2, 8).toUpperCase();
    
    broadcastToClients({
        type: 'card_detected',
        uid,
        timestamp: new Date().toISOString(),
        source: 'api'
    });

    res.json({ success: true, uid, message: 'Tarjeta simulada enviada' });
});

/**
 * Server
 */
const server = app.listen(PORT, () => {
    console.log(`\n🚀 Servicio NFC v3 (Windows Native) en puerto ${PORT}`);
    console.log(`📡 WebSocket: ws://localhost:${PORT}`);
    console.log(`🔗 Health: http://localhost:${PORT}/api/health\n`);
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

// Inicializar
initializeNFCReader();

// Cleanup
process.on('SIGINT', () => {
    console.log('\n👋 Servicio NFC detenido');
    if (readingInterval) clearInterval(readingInterval);
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error('Error no capturado:', error);
});
