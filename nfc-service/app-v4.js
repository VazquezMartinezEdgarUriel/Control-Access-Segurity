
const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const wss = new WebSocket.Server({ noServer: true });
const clients = new Set();

// Estado del lector
let currentReader = null;
let lastDetectedUID = null;  // Último UID detectado (para evitar repeticiones)
let isPolling = true;         // Siempre activo
let pollTimer = null;

const POLL_INTERVAL = 300;    // Reducido a 300ms (era 800ms)
const SCRIPT_PATH = path.join(__dirname, 'read-nfc.ps1');

/**
 * Lee el UID de la tarjeta NFC usando el script PowerShell
 */
function readNFCCard() {
    return new Promise((resolve) => {
        exec(
            `powershell -ExecutionPolicy Bypass -File "${SCRIPT_PATH}"`,
            { windowsHide: true, timeout: 5000 },
            (error, stdout) => {
                if (error) {
                    resolve(null);
                    return;
                }
                try {
                    const data = JSON.parse(stdout.trim());
                    resolve(data);
                } catch {
                    resolve(null);
                }
            }
        );
    });
}

/**
 * Bucle principal de polling.
 * - Si detecta tarjeta nueva → envía card_detected y deja de reportar hasta que se retire.
 * - Si la tarjeta se retira → limpia el último UID y queda listo para la siguiente.
 */
async function pollLoop() {
    if (!isPolling) return;

    try {
        const result = await readNFCCard();

        if (result && result.status === 'no_reader') {
            if (currentReader) {
                console.log('✗ Lector desconectado');
                currentReader = null;
                broadcastToClients({
                    type: 'reader_disconnected',
                    message: 'Lector desconectado',
                    timestamp: new Date().toISOString()
                });
            }
            lastDetectedUID = null;
        } else if (result && result.status === 'detected' && result.uid) {
            // Guardar nombre del lector la primera vez
            if (!currentReader && result.reader) {
                currentReader = result.reader;
                console.log(`✓ Lector detectado: ${currentReader}`);
                broadcastToClients({
                    type: 'reader_connected',
                    reader: currentReader
                });
            }
            // Solo notificar si es una tarjeta NUEVA (diferente a la última)
            if (result.uid !== lastDetectedUID) {
                lastDetectedUID = result.uid;
                console.log(`📛 Tarjeta detectada: ${result.uid}`);
                broadcastToClients({
                    type: 'card_detected',
                    uid: result.uid,
                    timestamp: new Date().toISOString(),
                    source: 'hardware'
                });
            }
        } else {
            // No hay tarjeta → si antes había una, significa que se retiró
            if (lastDetectedUID) {
                console.log(`🔄 Tarjeta retirada. Listo para siguiente lectura.`);
                lastDetectedUID = null;
                broadcastToClients({
                    type: 'card_removed',
                    message: 'Tarjeta retirada. Listo para escanear.',
                    timestamp: new Date().toISOString()
                });
            }
        }
    } catch (err) {
        console.error('Error en polling:', err.message);
    }

    // Siguiente ciclo
    pollTimer = setTimeout(pollLoop, POLL_INTERVAL);
}

/**
 * Broadcast a todos los clientes WebSocket
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
 * WebSocket connections
 */
wss.on('connection', (ws) => {
    console.log('✓ Cliente WebSocket conectado');
    clients.add(ws);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleClientMessage(ws, data);
        } catch {
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

    // Enviar estado actual al conectar
    ws.send(JSON.stringify({
        type: 'connection_established',
        message: 'Conectado al servicio NFC',
        readerStatus: currentReader ? 'connected' : 'searching',
        mode: 'HARDWARE',
        reader: currentReader || 'Buscando lector...',
        isPolling: true
    }));
});

/**
 * Manejo de mensajes del cliente
 */
function handleClientMessage(ws, data) {
    switch (data.action) {
        case 'get_status':
            ws.send(JSON.stringify({
                type: 'status',
                isReading: isPolling,
                readerConnected: !!currentReader,
                reader: currentReader,
                lastUID: lastDetectedUID,
                clientsConnected: clients.size
            }));
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
    }
}

/**
 * HTTP Routes
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        reader: currentReader || 'buscando...',
        mode: 'HARDWARE',
        isPolling,
        lastUID: lastDetectedUID,
        clientsConnected: clients.size,
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
    console.log(`\n🚀 Servicio NFC v4 (Hardware ACR122U) en puerto ${PORT}`);
    console.log(`📡 WebSocket: ws://localhost:${PORT}`);
    console.log(`🔗 Health: http://localhost:${PORT}/api/health`);
    console.log(`\n🔍 Lector NFC siempre activo - esperando tarjetas...\n`);
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

// Iniciar polling automáticamente
pollLoop();

// Cleanup
process.on('SIGINT', () => {
    console.log('\n👋 Servicio NFC detenido');
    isPolling = false;
    if (pollTimer) clearTimeout(pollTimer);
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error('Error no capturado:', error);
});
