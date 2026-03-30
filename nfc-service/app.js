const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// WebSocket setup
const wss = new WebSocket.Server({ noServer: true });
let currentReader = null;
let isReading = false;
let simulationMode = false;

const clients = new Set();

// Simulated NFC cards for testing
const simulatedCards = [
    { uid: 'FF:FF:FF:FF', name: 'Tarjeta Test 1' },
    { uid: 'AA:BB:CC:DD', name: 'Tarjeta Test 2' },
    { uid: '12:34:56:78', name: 'Tarjeta Test 3' }
];
let simulationIndex = 0;

/**
 * Inicializa el lector NFC ACR122U
 */
async function initializeNFCReader() {
    try {
        // Intenta cargar pcsclite si está disponible
        let hasHardware = false;
        try {
            const pcsclite = require('pcsclite');
            const pcsc = pcsclite();
            console.log('🔍 Buscando lector NFC ACR122U en el sistema...');
            hasHardware = true;
            
            initializeHardwareReader(pcsc);
        } catch (e) {
            console.log('⚠️  pcsclite no disponible - usando modo simulación');
            simulationMode = true;
            initializeSimulationMode();
        }

        if (!hasHardware) {
            // Si no hay hardware, usa modo simulación
            initializeSimulationMode();
        }
    } catch (error) {
        console.error('❌ Error inicializando NFC:', error.message);
        simulationMode = true;
        initializeSimulationMode();
    }
}

/**
 * Inicializa el lector de hardware real
 */
function initializeHardwareReader(pcsc) {
    pcsc.on('reader_init', (reader) => {
        console.log(`✓ LECTOR ENCONTRADO: ${reader.name}`);
        currentReader = reader;
        
        let cardInserted = false;

        reader.on('status', (status) => {
            const { state } = status;
            const present = (state & reader.SCARD_STATE_PRESENT);
            const changed = (state & reader.SCARD_STATE_CHANGED);

            if (!changed) return;

            // Tarjeta INSERTADA
            if (present && !cardInserted) {
                cardInserted = true;
                console.log('📛 Tarjeta NFC detectada - Leyendo UID...');
                
                // Comando para obtener UID
                const getUidCommand = Buffer.from([0xFF, 0xCA, 0x00, 0x00, 0x00]);
                
                reader.transmit(getUidCommand, 32, (err, data) => {
                    if (err) {
                        console.error('❌ Error leyendo UID:', err.message);
                        broadcastToClients({
                            type: 'reader_error',
                            message: 'Error al leer UID: ' + err.message
                        });
                        return;
                    }

                    if (data && data.length >= 7) {
                        // Los últimos 2 bytes son el status, los anteriores son el UID
                        const uidBuffer = data.slice(0, -2);
                        const uid = uidBuffer.toString('hex').match(/.{1,2}/g).join(':').toUpperCase();
                        
                        console.log(`✓ UID LEÍDO: ${uid}`);
                        
                        broadcastToClients({
                            type: 'card_detected',
                            uid: uid,
                            timestamp: new Date().toISOString()
                        });
                    } else {
                        console.error('❌ Respuesta inválida del lector');
                    }
                });
            }
            // Tarjeta REMOVIDA
            else if (!present && cardInserted) {
                cardInserted = false;
                console.log('Tarjeta removida');
                broadcastToClients({
                    type: 'card_removed'
                });
            }
        });

        reader.on('error', (err) => {
            console.error('❌ Error del lector:', err.message);
            broadcastToClients({
                type: 'reader_error',
                message: err.message
            });
        });

        reader.on('end', () => {
            console.log(`Lector desconectado: ${reader.name}`);
            currentReader = null;
        });
    });

    pcsc.on('reader_end', (reader) => {
        console.log(`❌ Lector removido: ${reader.name}`);
        currentReader = null;
    });

    pcsc.on('error', (err) => {
        console.error('❌ Error PCSC:', err.message);
        if (err.message.includes('SCARD_E_NO_READERS_AVAILABLE')) {
            console.warn('⚠ No hay lectores NFC disponibles');
            console.warn('⚠ Asegúrate de que el ACR122U está conectado por USB');
            console.warn('⚠ Corriendo en modo simulación...');
        }
        simulationMode = true;
        initializeSimulationMode();
    });

    console.log('✓ Sistema de lectura NFC activado');
    console.log('Esperando lectura del ACR122U...');
}

/**
 * Modo simulación para desarrollo
 */
function initializeSimulationMode() {
    console.log('🔄 MODO SIMULACIÓN activado');
    console.log('📱 Las tarjetas simuladas están disponibles para pruebas');
    
    // Simular lectura de tarjeta cada 10 segundos si está activo el lector
    setInterval(() => {
        if (isReading && simulationMode) {
            const card = simulatedCards[simulationIndex % simulatedCards.length];
            console.log(`📛 [SIM] Tarjeta detectada: ${card.uid} - ${card.name}`);
            
            broadcastToClients({
                type: 'card_detected',
                uid: card.uid,
                name: card.name,
                timestamp: new Date().toISOString(),
                simulated: true
            });
            
            simulationIndex++;
        }
    }, 10000);
}

/**
 * Envía datos a todos los clientes conectados
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
            ws.send(JSON.stringify({ error: 'Invalid message format' }));
        }
    });

    ws.on('close', () => {
        console.log('✗ Cliente WebSocket desconectado');
        clients.delete(ws);
    });

    ws.on('error', (error) => {
        console.error('Error WebSocket:', error);
    });

    // Confirmar conexión
    ws.send(JSON.stringify({
        type: 'connection_established',
        message: 'Conectado al servicio NFC',
        readerStatus: currentReader ? 'connected' : 'waiting'
    }));
});

/**
 * Maneja mensajes de clientes
 */
function handleClientMessage(ws, data) {
    switch (data.action) {
        case 'start_reading':
            isReading = true;
            ws.send(JSON.stringify({
                type: 'reading_started',
                message: 'Lector escaneando... Acerca una tarjeta NFC'
            }));
            break;

        case 'stop_reading':
            isReading = false;
            ws.send(JSON.stringify({
                type: 'reading_stopped',
                message: 'Escaneo detenido'
            }));
            break;

        case 'simulate_card':
            // Para desarrollo: simular tarjeta detectada
            broadcastToClients({
                type: 'card_detected',
                uid: data.uid || '04:1C:E8:72:A1:14:80',
                timestamp: new Date().toISOString(),
                simulated: true
            });
            break;

        case 'get_status':
            ws.send(JSON.stringify({
                type: 'status',
                isReading,
                readerConnected: !!currentReader,
                clientsConnected: clients.size,
                simulationMode: simulationMode
            }));
            break;
    }
}

/**
 * Rutas HTTP
 */

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        readerConnected: !!currentReader,
        clientsConnected: clients.size,
        isReading
    });
});

// Simular detección de tarjeta (para pruebas)
app.post('/api/test/simulate-card', (req, res) => {
    const uid = req.body.uid || '04:' + Math.random().toString(16).substr(2, 8).toUpperCase() + ':' + Math.random().toString(16).substr(2, 8).toUpperCase() + ':00';
    
    broadcastToClients({
        type: 'card_detected',
        uid,
        timestamp: new Date().toISOString(),
        simulated: true
    });

    res.json({ 
        success: true, 
        uid,
        message: 'Tarjeta simulada enviada a todos los clientes'
    });
});

// Actualizar el servidor HTTP para soportar WebSocket
const server = app.listen(PORT, () => {
    console.log(`\n🚀 Servicio NFC ejecutándose en puerto ${PORT}`);
    console.log(`📡 WebSocket: ws://localhost:${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🧪 Simular tarjeta: POST http://localhost:${PORT}/api/test/simulate-card\n`);
});

// Upgrade para WebSocket
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

// Inicializar lector NFC
initializeNFCReader();

// Manejo de errores
process.on('uncaughtException', (error) => {
    console.error('Error no capturado:', error);
});

process.on('SIGINT', () => {
    console.log('\n\n👋 Servicio NFC detenido');
    process.exit(0);
});
