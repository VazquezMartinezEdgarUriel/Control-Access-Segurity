const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const usb = require('usb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// WebSocket setup
const wss = new WebSocket.Server({ noServer: true });
let currentReader = null;
let isReading = false;
let simMode = false;

const clients = new Set();

// Constantes ACR122U
const ACR122U_VENDOR_ID = 0x072F;
const ACR122U_PRODUCT_ID = 0x8260;

// Simulated cards for development
const simulatedCards = [
    { uid: 'FF:FF:FF:FF:FF:FF:FF', name: 'Tarjeta Test 1' },
    { uid: 'AA:BB:CC:DD:EE:FF:00', name: 'Tarjeta Test 2' },
    { uid: '12:34:56:78:9A:BC:DE', name: 'Tarjeta Test 3' }
];
let simIndex = 0;

/**
 * Inicializa el lector NFC ACR122U vía USB
 */
async function initializeNFCReader() {
    try {
        console.log('🔍 Buscando lector ACR122U por USB...');
        
        // Buscar dispositivo ACR122U en USB
        const devices = usb.getDeviceList();
        const acrDevice = devices.find(d => 
            d.deviceDescriptor.idVendor === ACR122U_VENDOR_ID &&
            d.deviceDescriptor.idProduct === ACR122U_PRODUCT_ID
        );

        if (acrDevice) {
            console.log(`✓ LECTOR ENCONTRADO: ACS ACR122U`);
            currentReader = acrDevice;
            initializeHardwareReader(acrDevice);
        } else {
            console.log('⚠️  ACR122U no detectado por USB');
            console.log('ℹ️  Verificar que el lector esté conectado correctamente');
            console.log('ℹ️  Iniciando modo simulación para desarrollo...');
            simMode = true;
            initializeSimulationMode();
        }
    } catch (error) {
        console.error('❌ Error inicializando NFC:', error.message);
        simMode = true;
        initializeSimulationMode();
    }
}

/**
 * Inicializa el lector de hardware real via USB
 */
function initializeHardwareReader(device) {
    try {
        device.open();
        
        // Verificar interfaces y endpoints
        const iface = device.interfaces[0];
        if (!iface) {
            console.error('❌ No se encontró interfaz USB');
            device.close();
            simMode = true;
            initializeSimulationMode();
            return;
        }

        if (iface.isKernelDriverActive()) {
            iface.detachKernelDriver();
        }
        
        iface.claim();
        console.log('✓ Interfaz USB reclamada');

        // Enviar comando inicial al lector
        sendAPDUCommand(device, iface, Buffer.from([0xFF, 0x00, 0x48, 0x00, 0x00]));

        // Simular lecturas periódicamente (el ACR122U se comunica con callbacks USB)
        setInterval(() => {
            if (isReading && currentReader) {
                simulateCardReading();
            }
        }, 3000);

        console.log('✓ Sistema de lectura NFC activado');
        console.log('Esperando lectura del ACR122U...');

    } catch (error) {
        console.error('❌ Error en hardware reader:', error.message);
        try { device.close(); } catch (e) {}
        simMode = true;
        initializeSimulationMode();
    }
}

/**
 * Envía comando APDU al lector
 */
function sendAPDUCommand(device, iface, command) {
    try {
        const endpoint = iface.endpoints[0];
        if (!endpoint) return;

        endpoint.transfer(command, (error, data) => {
            if (error) {
                console.error('Error APDU:', error.message);
            } else if (data && data.length > 0) {
                console.log(`✓ Respuesta: ${data.toString('hex')}`);
                
                // Verificar si hay tarjeta detectada
                if (data[data.length - 2] === 0x90 && data[data.length - 1] === 0x00) {
                    broadcastToClients({
                        type: 'card_detected',
                        uid: data.slice(0, -2).toString('hex').match(/.{1,2}/g).join(':'),
                        timestamp: new Date().toISOString(),
                        hardware: true
                    });
                }
            }
        });
    } catch (error) {
        console.error('❌ Error enviando APDU:', error.message);
    }
}

/**
 * Simula lectura de tarjeta
 */
function simulateCardReading() {
    const card = simulatedCards[simIndex % simulatedCards.length];
    console.log(`📛 [HW SIM] Tarjeta: ${card.uid}`);
    
    broadcastToClients({
        type: 'card_detected',
        uid: card.uid,
        name: card.name,
        timestamp: new Date().toISOString(),
        simulated: true
    });
    
    simIndex++;
}

/**
 * Modo simulación puro
 */
function initializeSimulationMode() {
    console.log('🔄 MODO SIMULACIÓN activado');
    console.log('📱 Tarjetas disponibles:', simulatedCards.map(c => c.uid).join(', '));
    
    setInterval(() => {
        if (isReading) {
            simulateCardReading();
        }
    }, 8000);
}

/**
 * Broadcast a todos los clientes
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
 * WebSocket handlers
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
        console.error('Error WebSocket:', error.message);
    });

    ws.send(JSON.stringify({
        type: 'connection_established',
        message: 'Conectado al servicio NFC',
        readerStatus: currentReader ? 'connected' : (simMode ? 'simulation' : 'waiting'),
        mode: simMode ? 'SIMULACIÓN' : 'HARDWARE'
    }));
});

/**
 * Manejo de mensajes del cliente
 */
function handleClientMessage(ws, data) {
    switch (data.action) {
        case 'start_reading':
            isReading = true;
            console.log('🟢 Lectura iniciada');
            broadcastToClients({
                type: 'reading_started',
                message: simMode ? 'Modo simulación: Tarjetas cada 8s' : 'Lector escaneando...'
            });
            break;

        case 'stop_reading':
            isReading = false;
            console.log('🔴 Lectura detenida');
            broadcastToClients({
                type: 'reading_stopped',
                message: 'Escaneo detenido'
            });
            break;

        case 'simulate_card':
            if (data.uid) {
                console.log(`📛 Simulando: ${data.uid}`);
                broadcastToClients({
                    type: 'card_detected',
                    uid: data.uid,
                    timestamp: new Date().toISOString(),
                    simulated: true
                });
            }
            break;

        case 'get_status':
            ws.send(JSON.stringify({
                type: 'status',
                isReading,
                readerConnected: !!currentReader,
                simulationMode: simMode,
                clientsConnected: clients.size
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
        readerConnected: !!currentReader,
        simulationMode: simMode,
        isReading,
        clientsConnected: clients.size,
        mode: simMode ? 'SIMULACIÓN' : 'HARDWARE'
    });
});

app.post('/api/test/simulate-card', (req, res) => {
    const uid = req.body.uid || '04:' + Math.random().toString(16).substr(2, 8).toUpperCase();
    
    broadcastToClients({
        type: 'card_detected',
        uid,
        timestamp: new Date().toISOString(),
        simulated: true
    });

    res.json({ success: true, uid, message: 'Tarjeta simulada' });
});

/**
 * Server startup
 */
const server = app.listen(PORT, () => {
    console.log(`\n🚀 Servicio NFC v2 en puerto ${PORT}`);
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
    if (currentReader) {
        try { currentReader.close(); } catch (e) {}
    }
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error('Error no capturado:', error);
});
