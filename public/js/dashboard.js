
// DASHBOARD - MONITOREO DE ACCESOS EN VIVO

let refreshInterval;
const MAX_ROWS = 20;
const MODAL_AUTO_CLOSE_MS = 4000; 
let autoCloseTimer = null;

/**
 * Función para mostrar alertas flotantes 
 */
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        min-width: 350px;
        max-width: 500px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
        padding: 16px 20px;
        border-radius: 8px;
        font-weight: 500;
        border-left: 4px solid ${getBorderColor(type)};
        background: ${getBackgroundColor(type)};
        color: ${getTextColor(type)};
        animation: slideInRight 0.4s ease-out;
    `;
    alertDiv.innerHTML = message;
    document.body.appendChild(alertDiv);
    
    // Auto-remover después de 4 segundos
    setTimeout(() => {
        alertDiv.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => alertDiv.remove(), 300);
    }, 4000);
}

function getBorderColor(type) {
    const colors = {
        'success': '#28a745',
        'danger': '#dc3545',
        'warning': '#ffc107',
        'info': '#17a2b8'
    };
    return colors[type] || colors['success'];
}

function getBackgroundColor(type) {
    const colors = {
        'success': '#d4edda',
        'danger': '#f8d7da',
        'warning': '#fff3cd',
        'info': '#d1ecf1'
    };
    return colors[type] || colors['success'];
}

function getTextColor(type) {
    const colors = {
        'success': '#155724',
        'danger': '#721c24',
        'warning': '#856404',
        'info': '#0c5460'
    };
    return colors[type] || colors['success'];
}

// Inyectar estilos de animación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// NFC WebSocket para validación en vivo

let dashboardNfcWs = null;
let nfcConnectionAttempts = 0;
const MAX_NFC_ATTEMPTS = 3;

function connectDashboardNFC() {
    // No reintentar más de 3 veces
    if (nfcConnectionAttempts >= MAX_NFC_ATTEMPTS) {
        console.warn('⚠️  Máximo número de intentos de conexión NFC alcanzado');
        updateNFCPanel('disconnected', '✗ Lector no disponible');
        return;
    }

    try {
        const host = window.location.hostname || '127.0.0.1';
        const wsUrl = `ws://${host}:3001`;
        console.log(`🔌 Intentando conectar a WebSocket NFC (intento ${nfcConnectionAttempts + 1}/${MAX_NFC_ATTEMPTS})...`, wsUrl);
        
        dashboardNfcWs = new WebSocket(wsUrl);

        dashboardNfcWs.onopen = () => {
            console.log('✓ Dashboard conectado al servicio NFC');
            nfcConnectionAttempts = 0; // Reset en conexión exitosa
            updateNFCPanel('connected', '✓ Lector activo — Esperando tarjeta...');
        };

        dashboardNfcWs.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleDashboardNFCMessage(data);
            } catch (e) {
                console.error('❌ Error parseando mensaje NFC:', e);
            }
        };

        dashboardNfcWs.onerror = (event) => {
            console.error('❌ Error WebSocket NFC:', event);
            updateNFCPanel('error', '✗ Servicio NFC no disponible');
        };

        dashboardNfcWs.onclose = () => {
            console.log('🔌 WebSocket NFC cerrado');
            updateNFCPanel('disconnected', '✗ Servicio NFC desconectado');
            // Reintentar conexión en 10 segundos
            nfcConnectionAttempts++;
            if (nfcConnectionAttempts < MAX_NFC_ATTEMPTS) {
                setTimeout(connectDashboardNFC, 10000);
            }
        };
    } catch (e) {
        console.error('❌ Error creando WebSocket NFC:', e);
        updateNFCPanel('error', '✗ No se pudo conectar al NFC');
        nfcConnectionAttempts++;
        if (nfcConnectionAttempts < MAX_NFC_ATTEMPTS) {
            setTimeout(connectDashboardNFC, 10000);
        }
    }
}

function handleDashboardNFCMessage(data) {
    switch (data.type) {
        case 'connection_established':
            console.log('✓ NFC info:', data.message, '- Modo:', data.mode);
            break;

        case 'reader_connected':
            console.log('Lector NFC conectado:', data.reader);
            updateNFCPanel('connected', '✓ Lector activo — Esperando tarjeta...');
            break;

        case 'card_detected':
            console.log('📛 Tarjeta detectada en dashboard:', data.uid);
            updateNFCPanel('detected', '📛 Tarjeta: ' + data.uid);
            // Mostrar alerta inmediata de detección
            showAlert(`<i class="bi bi-credit-card"></i> <strong>Tarjeta Detectada</strong><br><small style="opacity: 0.9;">${data.uid}</small>`, 'info');
            // Iniciar validación
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
        error: 'var(--warning)',
        disconnected: 'var(--text-muted)'
    };
    
    el.style.color = colors[status] || 'var(--text-muted)';
    el.textContent = message;
    console.log(`🟢 NFC Panel actualizado: [${status}] ${message}`);
}

/**
 * Carga las alertas no atendidas del servidor
 */
async function loadAlertas() {
    try {
        const response = await fetch('/api/alertas/no-atendidas?limit=10');
        const alertas = await response.json();
        
        const container = document.getElementById('alertas-container');
        if (!container) return;

        if (!Array.isArray(alertas) || alertas.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px 0; color: var(--text-muted);">
                    <div style="font-size: 2rem; margin-bottom: 8px;">✓</div>
                    <div style="font-size: 0.9rem;">Sin alertas activas</div>
                </div>
            `;
            return;
        }

        container.innerHTML = alertas.map((alerta, index) => `
            <div class="alert-item${index === 0 ? ' alert-newest' : ''}" style="
                background: var(--primary-bg); 
                border-left: 4px solid ${alerta.atendida ? 'var(--success)' : 'var(--danger)'};
                padding: 12px;
                margin-bottom: 8px;
                border-radius: 4px;
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
            ">
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: ${alerta.atendida ? 'var(--success)' : 'var(--danger)'}; margin-bottom: 4px;">
                        ${alerta.tipoAlerta?.nombre_tipo || 'Alerta'}
                    </div>
                    <div style="font-size: 0.85rem; color: var(--text-main); margin-bottom: 4px;">
                        ${alerta.descripcion}
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">
                        ${formatTime(alerta.fecha_hora)}
                    </div>
                </div>
                ${!alerta.atendida ? `
                <button onclick="atenderAlerta(${alerta.id_alerta})" style="
                    background: var(--info);
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.8rem;
                    white-space: nowrap;
                    margin-left: 10px;
                ">Atender</button>
                ` : '<span style="font-size: 0.75rem; color: var(--success);">✓ Atendida</span>'}
            </div>
        `).join('');

    } catch (error) {
        console.error('Error cargando alertas:', error);
        const container = document.getElementById('alertas-container');
        if (container) {
            container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.9rem;">Error al cargar alertas</div>';
        }
    }
}

/**
 * Marca una alerta como atendida
 */
async function atenderAlerta(alertaId) {
    try {
        const response = await fetch(`/api/alertas/${alertaId}/atender`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            console.log('✓ Alerta atendida');
            loadAlertas();  // Recargar lista de alertas
        }
    } catch (error) {
        console.error('Error atendiendo alerta:', error);
    }
}

/**
 * Valida una tarjeta NFC contra la API
 */
async function validateNFCCard(uid) {
    const modal = document.getElementById('nfc-validation-modal');
    const resultDiv = document.getElementById('validation-result');

    if (!modal || !resultDiv) {
        console.error('❌ Modal no encontrado en el DOM');
        return;
    }

    // Mostrar modal con loading
    resultDiv.innerHTML = `
        <div style="padding: 30px;">
            <div class="spinner"></div>
            <p style="margin-top: 15px; color: var(--text-muted);">Validando tarjeta <strong>${uid}</strong>...</p>
        </div>
    `;
    modal.classList.add('active');

    try {
        console.log('🔄 Enviando validación de tarjeta:', uid);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // Timeout 8s
        
        const response = await fetch('/api/credenciales/validar-nfc', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Accept': 'application/json'
            },
            body: JSON.stringify({ uid_nfc: uid }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Respuesta recibida:', data);
        showValidationResult(data);
        
    } catch (error) {
        console.error('❌ Error en validación:', error.message);
        
        const errorMsg = error.name === 'AbortError' 
            ? 'Timeout - El servidor no responde'
            : error.message;
            
        resultDiv.innerHTML = `
            <div style="padding: 20px;">
                <div style="font-size: 3rem;">⚠️</div>
                <h3 style="color: var(--danger); margin: 10px 0;">Error de Validación</h3>
                <p style="color: var(--text-muted);">${errorMsg}</p>
                <p class="nfc" style="margin-top: 10px;">${uid}</p>
                <p style="margin-top: 8px; font-size: 0.8rem; color: var(--text-muted);">
                    Revisa la consola para más detalles
                </p>
            </div>
        `;
        
        // Mostrar alerta flotante del error
        showAlert(`<i class="bi bi-exclamation-circle"></i> <strong>Error en Validación</strong><br><small style="opacity: 0.9;">${errorMsg}</small>`, 'danger');
        
        // Auto-cerrar en 4 segundos
        startAutoClose();
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

    // Mostrar alerta flotante con el resultado (4 segundos de duración)
    const alertType = isAutorizado ? 'success' : isDenegado ? 'danger' : 'warning';
    const alertMessage = isAutorizado 
        ? `<i class="bi bi-check-circle"></i> <strong>${statusText}</strong> - ${data.usuario || data.uid_nfc}`
        : isDenegado
        ? `<i class="bi bi-x-circle"></i> <strong>${statusText}</strong> - ${data.mensaje}`
        : `<i class="bi bi-exclamation-triangle"></i> <strong>${statusText}</strong> - ${data.mensaje}`;
    
    // Llamar a showAlert() - función definida al inicio de este archivo
    showAlert(alertMessage, alertType);

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
            <tr style="cursor: pointer;" class="acceso-clickable" data-uid="${acceso.credencial?.uid_nfc || ''}">
                <td>${formatTime(acceso.fecha_hora)}</td>
                <td>${acceso.usuario?.nombre_completo || 'Desconocido'}</td>
                <td><span class="nfc">${acceso.credencial?.uid_nfc || '-'}</span></td>
                <td><span class="badge badge-${acceso.tipo === 'entrada' ? 'pending' : 'allowed'}">${acceso.tipo.toUpperCase()}</span></td>
                <td><span class="badge badge-${acceso.resultado === 'autorizado' ? 'allowed' : 'denied'}">${acceso.resultado.toUpperCase()}</span></td>
            </tr>
        `).join('');
        
        // Agregar event listeners a las filas (IMPORTANTE: hacer esto cada vez que se recarga)
        attachAccesoClickListeners();
        
    } catch (error) {
        console.error('Error cargando accesos peatonales:', error);
    }
}

/**
 * Adjunta event listeners a las filas de accesos
 */
function attachAccesoClickListeners() {
    document.querySelectorAll('.acceso-clickable').forEach(row => {
        // Remover listener anterior si existe
        row.removeEventListener('click', accesRowClickHandler);
        // Agregar nuevo listener
        row.addEventListener('click', accesRowClickHandler);
    });
}

/**
 * Handler para el clic en una fila de acceso
 */
function accesRowClickHandler(e) {
    const uid = this.getAttribute('data-uid');
    console.log('Fila clickeada con UID:', uid);
    if (uid && uid !== '') {
        console.log('Abriendo modal con UID:', uid);
        validateNFCCard(uid);
    } else {
        console.warn('⚠️  UID vacío o no encontrado');
        showAlert('UID de tarjeta no disponible', 'warning');
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
        const fetchWithTimeout = (url, timeout = 8000) => {
            return new Promise((resolve) => {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => {
                    controller.abort();
                }, timeout);
                
                fetch(url, { signal: controller.signal })
                    .then(r => {
                        if (!r.ok) throw new Error(`HTTP ${r.status}`);
                        return r.json();
                    })
                    .then(data => {
                        clearTimeout(timeoutId);
                        resolve(Array.isArray(data) ? data : []);
                    })
                    .catch(error => {
                        clearTimeout(timeoutId);
                        // Solo loguear si no es AbortError (timeout)
                        if (error.name !== 'AbortError') {
                            console.warn(`⚠️  ${url}: ${error.message}`);
                        }
                        resolve([]);
                    });
            });
        };
        
        const [usuarios, vehiculos, accesoPeatonal, accesoVehicular] = await Promise.all([
            fetchWithTimeout('/api/usuarios'),
            fetchWithTimeout('/api/vehiculos'),
            fetchWithTimeout('/api/acceso-peatonal?limit=1000'),
            fetchWithTimeout('/api/acceso-vehicular?limit=1000')
        ]);

        // Contar accesos peatonales
        const countPeaton = Array.isArray(accesoPeatonal) ? accesoPeatonal.length : 0;
        const countVehicular = Array.isArray(accesoVehicular) ? accesoVehicular.length : 0;
        const countDenegados = Array.isArray(accesoPeatonal) 
            ? accesoPeatonal.filter(a => a.resultado === 'denegado').length 
            : 0;

        // Actualizar elementos del DOM
        const elements = {
            '.stat-total-usuarios': Array.isArray(usuarios) ? usuarios.length : '-',
            '.stat-total-vehiculos': Array.isArray(vehiculos) ? vehiculos.length : '-',
            '.stat-accesos-peatonal': countPeaton,
            '.stat-accesos-vehicular': countVehicular,
            '.stat-accesos-denegados': countDenegados
        };
        
        for (const [selector, value] of Object.entries(elements)) {
            const els = document.querySelectorAll(selector);
            els.forEach(el => { el.textContent = value; });
        }

        console.log('✅ Estadísticas actualizadas');
    } catch (error) {
        console.error('❌ Error cargando estadísticas:', error);
    }
}

/**
 * Inicializa el dashboard
 */
function initDashboard() {
    loadStats();
    loadAccesosPeatonales();
    loadAccesosVehiculares();
    loadAlertas();  // ← NUEVA: Cargar alertas
    connectDashboardNFC();
    
    // Auto-refresh cada 5 segundos
    refreshInterval = setInterval(() => {
        loadStats();
        loadAccesosPeatonales();
        loadAccesosVehiculares();
        loadAlertas();  // ← NUEVA: Refrescar alertas
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
