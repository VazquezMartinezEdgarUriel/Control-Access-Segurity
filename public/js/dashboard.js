
// DASHBOARD - MONITOREO DE ACCESOS EN VIVO

let refreshInterval;
const MAX_ROWS = 20;
const MODAL_AUTO_CLOSE_MS = 4000; 
let autoCloseTimer = null;

// NFC WebSocket para validación en vivo

let dashboardNfcWs = null;

function connectDashboardNFC() {
    try {
        const host = window.location.hostname || '127.0.0.1';
        const wsUrl = `ws://${host}:3001`;
        dashboardNfcWs = new WebSocket(wsUrl);

        dashboardNfcWs.onopen = () => {
            console.log('✓ Dashboard conectado al servicio NFC');
            updateNFCPanel('connected', '✓ Lector activo — Esperando tarjeta...');
        };

        dashboardNfcWs.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleDashboardNFCMessage(data);
        };

        dashboardNfcWs.onerror = () => {
            updateNFCPanel('error', '✗ Servicio NFC no disponible');
        };

        dashboardNfcWs.onclose = () => {
            updateNFCPanel('disconnected', '✗ Desconectado del lector');
            // Reintentar conexión en 5 segundos
            setTimeout(connectDashboardNFC, 5000);
        };
    } catch (e) {
        updateNFCPanel('error', '✗ No se pudo conectar al NFC');
    }
}

function handleDashboardNFCMessage(data) {
    switch (data.type) {
        case 'connection_established':
            console.log('NFC info:', data.message, '- Modo:', data.mode);
            break;

        case 'reader_connected':
            console.log('Lector NFC conectado:', data.reader);
            updateNFCPanel('connected', '✓ Lector activo — Esperando tarjeta...');
            break;

        case 'card_detected':
            console.log('📛 Tarjeta detectada en dashboard:', data.uid);
            updateNFCPanel('detected', '📛 Tarjeta: ' + data.uid);
            validateNFCCard(data.uid);
            break;

        case 'card_removed':
            console.log('🔄 Tarjeta retirada');
            updateNFCPanel('connected', '✓ Lector activo — Esperando tarjeta...');
            break;
    }
}

function updateNFCPanel(status, message) {
    const el = document.getElementById('nfc-status');
    if (!el) return;

    const colors = {
        connected: 'var(--success)',
        detected: 'var(--info)',
        error: 'var(--danger)',
        disconnected: 'var(--text-muted)'
    };
    el.style.color = colors[status] || 'var(--text-muted)';
    el.textContent = message;
}

/**
 * Valida una tarjeta NFC contra la API
 */
async function validateNFCCard(uid) {
    const modal = document.getElementById('nfc-validation-modal');
    const resultDiv = document.getElementById('validation-result');

    // Mostrar modal con loading
    resultDiv.innerHTML = `
        <div style="padding: 30px;">
            <div class="spinner"></div>
            <p style="margin-top: 15px; color: var(--text-muted);">Validando tarjeta <strong>${uid}</strong>...</p>
        </div>
    `;
    modal.classList.add('active');

    try {
        const response = await fetch('/api/credenciales/validar-nfc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ uid_nfc: uid })
        });
        const data = await response.json();
        showValidationResult(data);
    } catch (error) {
        resultDiv.innerHTML = `
            <div style="padding: 20px;">
                <div style="font-size: 3rem;">⚠️</div>
                <h3 style="color: var(--danger); margin: 10px 0;">Error de Conexión</h3>
                <p style="color: var(--text-muted);">No se pudo conectar con el servidor</p>
                <p class="nfc" style="margin-top: 10px;">${uid}</p>
            </div>
        `;
    }
}

/**
 * Muestra el resultado de validación en el modal
 */
function showValidationResult(data) {
    const resultDiv = document.getElementById('validation-result');

    const isAutorizado = data.validacion === 'autorizado';
    const isAdvertencia = data.validacion === 'advertencia';
    const isDenegado = data.validacion === 'denegado';

    const icon = isAutorizado ? '✅' : isAdvertencia ? '⚠️' : '🚫';
    const color = isAutorizado ? 'var(--success)' : isAdvertencia ? 'var(--warning)' : 'var(--danger)';
    const bgColor = isAutorizado ? 'var(--success-light)' : isAdvertencia ? 'var(--warning-light)' : 'var(--danger-light)';
    const statusText = isAutorizado ? 'AUTORIZADO' : isAdvertencia ? 'ADVERTENCIA' : 'DENEGADO';

    let html = `
        <div style="background: ${bgColor}; border-radius: 12px; padding: 20px; margin-bottom: 15px;">
            <div style="font-size: 3rem;">${icon}</div>
            <h2 style="color: ${color}; margin: 8px 0; font-size: 1.4rem;">${statusText}</h2>
            <p style="color: var(--text-main); font-size: 0.95rem;">${data.mensaje}</p>
        </div>

        <div style="text-align: left; padding: 0 10px;">
            <div style="background: var(--primary-bg); border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">UID NFC</div>
                <div class="nfc" style="font-size: 1rem;">${data.uid_nfc}</div>
            </div>
    `;

    if (data.usuario) {
        html += `
            <div style="background: var(--primary-bg); border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Datos del Usuario</div>
                <div style="display: grid; gap: 6px;">
                    <div><strong>👤 Nombre:</strong> ${data.usuario}</div>
                    ${data.email ? `<div><strong>📧 Email:</strong> ${data.email}</div>` : ''}
                    ${data.telefono ? `<div><strong>📱 Teléfono:</strong> ${data.telefono}</div>` : ''}
                    ${data.tipo_usuario ? `<div><strong>🏷️ Tipo:</strong> <span class="badge badge-pending">${data.tipo_usuario.toUpperCase()}</span></div>` : ''}
                </div>
            </div>
        `;
    }

    if (data.vigencia) {
        const vigColor = data.validacion === 'advertencia' ? 'var(--danger)' : 'var(--success)';
        html += `
            <div style="background: var(--primary-bg); border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Vigencia de Acceso</div>
                <div style="display: grid; gap: 6px;">
                    <div><strong>📅 Inicio:</strong> ${formatDate(data.vigencia.inicio)}</div>
                    <div><strong>📅 Expiración:</strong> <span style="color: ${vigColor}; font-weight: 600;">${formatDate(data.vigencia.fin)}</span></div>
                    <div><strong>Estado:</strong> ${data.validacion === 'advertencia' ? '<span style="color: var(--danger);">⚠️ EXPIRADA</span>' : '<span style="color: var(--success);">✅ VIGENTE</span>'}</div>
                </div>
            </div>
        `;
    } else if (data.usuario) {
        html += `
            <div style="background: var(--primary-bg); border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Vigencia de Acceso</div>
                <div style="color: var(--text-muted);">Sin vigencia registrada</div>
            </div>
        `;
    }

    if (data.fecha_asignacion) {
        html += `
            <div style="background: var(--primary-bg); border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Tarjeta Asignada</div>
                <div>${formatDate(data.fecha_asignacion)}</div>
            </div>
        `;
    }

    html += `
            <div style="text-align: center; margin-top: 10px; font-size: 0.8rem; color: var(--text-muted);">
                Validación: ${new Date(data.timestamp).toLocaleString('es-MX')}
            </div>
        </div>
    `;

    resultDiv.innerHTML = html;

    // Auto-cerrar en 4 segundos con barra de progreso
    startAutoClose();
}

function startAutoClose() {
    // Limpiar timer anterior si existe
    if (autoCloseTimer) clearTimeout(autoCloseTimer);

    const bar = document.getElementById('auto-close-bar');
    const progress = document.getElementById('auto-close-progress');
    if (bar && progress) {
        bar.style.display = 'block';
        progress.style.transition = 'none';
        progress.style.width = '100%';
        // Forzar reflow para que la animación arranque
        void progress.offsetWidth;
        progress.style.transition = `width ${MODAL_AUTO_CLOSE_MS}ms linear`;
        progress.style.width = '0%';
    }

    autoCloseTimer = setTimeout(() => {
        closeValidationModal();
    }, MODAL_AUTO_CLOSE_MS);
}

function closeValidationModal() {
    if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
        autoCloseTimer = null;
    }
    const bar = document.getElementById('auto-close-bar');
    if (bar) bar.style.display = 'none';
    document.getElementById('nfc-validation-modal')?.classList.remove('active');
}

/**
 * Obtiene los accesos peatonales recientes
 */
async function loadAccesosPeatonales() {
    try {
        const response = await fetch('/api/acceso-peatonal?limit=20');
        const accesos = await response.json();
        
        const tbody = document.getElementById('logs-list');
        if (!tbody) return;
        
        if (!Array.isArray(accesos) || accesos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Sin registros recientes</td></tr>';
            return;
        }
        
        tbody.innerHTML = accesos.map(acceso => `
            <tr>
                <td>${formatTime(acceso.fecha_hora)}</td>
                <td>${acceso.usuario?.nombre_completo || 'Desconocido'}</td>
                <td><span class="nfc">${acceso.credencial?.uid_nfc || '-'}</span></td>
                <td><span class="badge badge-${acceso.tipo === 'entrada' ? 'pending' : 'allowed'}">${acceso.tipo.toUpperCase()}</span></td>
                <td><span class="badge badge-${acceso.resultado === 'autorizado' ? 'allowed' : 'denied'}">${acceso.resultado.toUpperCase()}</span></td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error cargando accesos peatonales:', error);
    }
}

/**
 * Obtiene los accesos vehiculares recientes
 */
async function loadAccesosVehiculares() {
    try {
        const response = await fetch('/api/acceso-vehicular?limit=20');
        const accesos = await response.json();
        
        const tbody = document.getElementById('vehicular-logs-list');
        if (!tbody) return;
        
        if (!Array.isArray(accesos) || accesos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Sin registros recientes</td></tr>';
            return;
        }
        
        tbody.innerHTML = accesos.map(acceso => `
            <tr>
                <td>${formatTime(acceso.fecha_hora)}</td>
                <td><strong>${acceso.placa_leida}</strong></td>
                <td>${acceso.usuario?.nombre_completo || 'Desconocido'}</td>
                <td><span class="badge badge-${acceso.resultado === 'autorizado' ? 'allowed' : 'denied'}">${acceso.resultado.toUpperCase()}</span></td>
                <td>${acceso.imagen_placa ? '✓' : '-'}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error cargando accesos vehiculares:', error);
    }
}

/**
 * Carga estadísticas del dashboard
 */
async function loadStats() {
    try {
        const [usuarios, vehiculos, accesoPeatonal, accesoVehicular] = await Promise.all([
            fetch('/api/usuarios').then(r => r.json()),
            fetch('/api/vehiculos').then(r => r.json()),
            fetch('/api/acceso-peatonal').then(r => r.json()),
            fetch('/api/acceso-vehicular').then(r => r.json())
        ]);
        
        // Actualizar stats en la barra lateral
        document.querySelectorAll('.stat-usuarios').forEach(el => {
            el.textContent = (Array.isArray(usuarios) ? usuarios.length : 0);
        });
        
        document.querySelectorAll('.stat-vehiculos').forEach(el => {
            el.textContent = (Array.isArray(vehiculos) ? vehiculos.length : 0);
        });
        
        document.querySelectorAll('.stat-accesos-peatonal').forEach(el => {
            el.textContent = (Array.isArray(accesoPeatonal) ? accesoPeatonal.length : 0);
        });
        
        document.querySelectorAll('.stat-accesos-vehicular').forEach(el => {
            el.textContent = (Array.isArray(accesoVehicular) ? accesoVehicular.length : 0);
        });
        
        // Accesos denegados
        const denegadosPeatonal = Array.isArray(accesoPeatonal) 
            ? accesoPeatonal.filter(a => a.resultado === 'denegado').length 
            : 0;
        const denegadosVehicular = Array.isArray(accesoVehicular) 
            ? accesoVehicular.filter(a => a.resultado === 'denegado').length 
            : 0;
        
        document.querySelectorAll('.stat-denegados').forEach(el => {
            el.textContent = denegadosPeatonal + denegadosVehicular;
        });
        
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

/**
 * Inicializa el dashboard
 */
function initDashboard() {
    loadStats();
    loadAccesosPeatonales();
    loadAccesosVehiculares();
    connectDashboardNFC();
    
    // Auto-refresh cada 5 segundos
    refreshInterval = setInterval(() => {
        loadStats();
        loadAccesosPeatonales();
        loadAccesosVehiculares();
    }, 5000);
}

/**
 * Exporta datos a CSV
 */
async function exportToCSV() {
    try {
        const accesos = await fetch('/api/acceso-peatonal').then(r => r.json());
        const data = Array.isArray(accesos) ? accesos.map(a => ({
            Hora: formatDate(a.fecha_hora),
            Usuario: a.usuario?.nombre_completo || '-',
            NFC_UID: a.credencial?.uid_nfc || '-',
            Tipo: a.tipo,
            Resultado: a.resultado,
            Lector: a.lector?.nombre || '-'
        })) : [];
        
        downloadCSV(data, `acceso_peatonal_${new Date().getTime()}.csv`);
    } catch (error) {
        showAlert('Error exportando datos', 'danger');
    }
}

/**
 * Limpia el dashboard
 */
function cleanupDashboard() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    if (dashboardNfcWs) {
        dashboardNfcWs.close();
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}

// Limpiar al salir
window.addEventListener('beforeunload', cleanupDashboard);
