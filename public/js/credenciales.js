// ==========================================
// GESTIÓN DE CREDENCIALES NFC
// ==========================================

let credenciales = [];
let usuarios = [];
let credencialActual = null;
let nfcWebSocket = null;
let nfcLectorActivo = false;

/**
 * Conecta al servicio NFC vía WebSocket
 */
function connectToNFCService() {
    try {
        // Detectar la IP actual del navegador para conectar al WebSocket
        const host = window.location.hostname || '127.0.0.1';
        const wsUrl = `ws://${host}:3001`;
        console.log(`🔗 Conectando a WebSocket: ${wsUrl}`);
        nfcWebSocket = new WebSocket(wsUrl);

        nfcWebSocket.onopen = () => {
            console.log('✓ Conectado al servicio NFC');
            setNFCStatus('connected', '✓ Lector conectado');
        };

        nfcWebSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleNFCMessage(data);
        };

        nfcWebSocket.onerror = (error) => {
            console.error('Error WebSocket:', error);
            setNFCStatus('error', '✗ Error en conexión');
        };

        nfcWebSocket.onclose = () => {
            console.log('Desconectado del servicio NFC');
            setNFCStatus('disconnected', '✗ Servicio desconectado');
            nfcLectorActivo = false;
        };
    } catch (error) {
        console.error('Error conectando a servicio NFC:', error);
        setNFCStatus('error', '✗ No se pudo conectar');
    }
}

/**
 * Maneja mensajes del servicio NFC
 */
function handleNFCMessage(data) {
    switch (data.type) {
        case 'connection_established':
            console.log('Servicio NFC info:', data.message);
            break;

        case 'card_detected':
            console.log('📛 Tarjeta detectada:', data.uid);
            document.getElementById('uid_nfc').value = data.uid;
            setNFCStatus('detected', `✓ Tarjeta detectada: ${data.uid}`);
            showAlert(`Tarjeta NFC leída: ${data.uid}`, 'success');
            break;

        case 'reading_started':
            setNFCStatus('reading', '🔍 Escaneando...');
            break;

        case 'reading_stopped':
            setNFCStatus('ready', '✓ Lector listo');
            break;

        case 'reader_error':
            console.error('Error del lector:', data.message);
            setNFCStatus('error', `✗ Error: ${data.message}`);
            break;

        case 'status':
            console.log('Estado del lector:', data);
            break;
    }
}

/**
 * Actualiza el estado visual del lector NFC
 */
function setNFCStatus(status, message) {
    const statusEl = document.getElementById('status-lector');
    const statusText = document.getElementById('status-text');
    
    if (statusEl) {
        statusEl.style.display = 'block';
        statusText.textContent = message;
        
        // Cambiar color según estado
        if (status === 'connected' || status === 'reading' || status === 'detected') {
            statusEl.style.backgroundColor = '#d4edda';
            statusEl.style.color = '#155724';
        } else if (status === 'error') {
            statusEl.style.backgroundColor = '#f8d7da';
            statusEl.style.color = '#721c24';
        } else if (status === 'disconnected') {
            statusEl.style.backgroundColor = '#f0f0f0';
            statusEl.style.color = '#666';
        }
    }
}

/**
 * Activa/desactiva el lector NFC
 */
function toggleLectorNFC() {
    if (!nfcWebSocket || nfcWebSocket.readyState !== WebSocket.OPEN) {
        showAlert('No hay conexión con el servicio NFC', 'warning');
        connectToNFCService();
        return;
    }

    nfcLectorActivo = !nfcLectorActivo;
    
    if (nfcLectorActivo) {
        nfcWebSocket.send(JSON.stringify({ action: 'start_reading' }));
        document.getElementById('btn-lector').style.backgroundColor = '#dc3545';
        document.getElementById('btn-lector').style.color = 'white';
        document.getElementById('btn-lector').textContent = '🛑 Detener Lector';
    } else {
        nfcWebSocket.send(JSON.stringify({ action: 'stop_reading' }));
        document.getElementById('btn-lector').style.backgroundColor = '';
        document.getElementById('btn-lector').style.color = '';
        document.getElementById('btn-lector').textContent = '🔍 Activar Lector NFC';
    }
}

/**
 * Carga todas las credenciales NFC
 */
async function loadCredenciales() {
    try {
        const response = await fetch('/api/credenciales');
        credenciales = await response.json();
        renderCredenciales(credenciales);
    } catch (error) {
        console.error('Error cargando credenciales:', error);
        showAlert('Error al cargar credenciales', 'danger');
    }
}

/**
 * Carga todas las credenciales NFC
 */
async function loadCredenciales() {
    try {
        const response = await fetch('/api/credenciales');
        credenciales = await response.json();
        renderCredenciales(credenciales);
    } catch (error) {
        console.error('Error cargando credenciales:', error);
        showAlert('Error al cargar credenciales', 'danger');
    }
}

/**
 * Carga todos los usuarios para el buscador
 */
async function loadUsuarios() {
    try {
        const response = await fetch('/api/usuarios');
        usuarios = await response.json();
    } catch (error) {
        console.error('Error cargando usuarios:', error);
    }
}

/**
 * Configura el buscador de usuarios con autocompletado
 */
function setupUsuarioSearch() {
    const searchInput = document.getElementById('usuario-search');
    const dropdown = document.getElementById('usuario-dropdown');
    const hiddenInput = document.getElementById('id_usuario');

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        if (query.length < 1) {
            dropdown.style.display = 'none';
            return;
        }

        const filtered = usuarios.filter(u =>
            u.nombre_completo.toLowerCase().includes(query) ||
            (u.tipo_usuario && u.tipo_usuario.toLowerCase().includes(query))
        );

        if (filtered.length === 0) {
            dropdown.innerHTML = '<div style="padding:10px;color:#999;font-size:0.9rem;">Sin resultados</div>';
        } else {
            dropdown.innerHTML = filtered.map(u => `
                <div class="usuario-option" data-id="${u.id_usuario}" data-name="${u.nombre_completo} (${u.tipo_usuario})"
                     style="padding:10px 12px;cursor:pointer;font-size:0.9rem;border-bottom:1px solid #f0f0f0;transition:background 0.15s;"
                     onmouseover="this.style.background='#e8f4fd'"
                     onmouseout="this.style.background='white'">
                    <strong>${u.nombre_completo}</strong> <span style="color:#888;font-size:0.8rem;">(${u.tipo_usuario})</span>
                </div>
            `).join('');
        }
        dropdown.style.display = 'block';
    });

    searchInput.addEventListener('focus', () => {
        if (searchInput.value.length >= 1) {
            searchInput.dispatchEvent(new Event('input'));
        }
    });

    dropdown.addEventListener('click', (e) => {
        const option = e.target.closest('.usuario-option');
        if (option) {
            hiddenInput.value = option.dataset.id;
            searchInput.value = option.dataset.name;
            dropdown.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#usuario-search') && !e.target.closest('#usuario-dropdown')) {
            dropdown.style.display = 'none';
        }
    });
}

/**
 * Renderiza la tabla de credenciales
 */
function renderCredenciales(datos) {
    const tbody = document.getElementById('credenciales-table');
    
    if (!Array.isArray(datos) || datos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Sin credenciales registradas</td></tr>';
        return;
    }

    tbody.innerHTML = datos.map(cred => {
        let expiraHTML = '-';
        if (cred.fecha_expiracion) {
            const expDate = new Date(cred.fecha_expiracion);
            const now = new Date();
            const expired = expDate < now;
            const soon = !expired && (expDate - now) < 30 * 24 * 60 * 60 * 1000;
            expiraHTML = `<span style="color:${expired ? '#dc3545' : soon ? '#fd7e14' : '#28a745'};font-weight:500;">${formatDate(cred.fecha_expiracion)}${expired ? ' ⚠️' : ''}</span>`;
        }

        return `
        <tr>
            <td>
                <code style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">${cred.uid_nfc}</code>
            </td>
            <td>${cred.usuario?.nombre_completo || 'Sin usuario'}</td>
            <td>
                <span class="badge badge-${cred.tipo_credencial === 'fisica' ? 'info' : 'warning'}">
                    ${cred.tipo_credencial === 'fisica' ? '💳 Física' : '📱 Móvil'}
                </span>
            </td>
            <td>
                <span class="badge-nfc ${cred.activa ? 'activa' : 'inactiva'}">
                    ${cred.activa ? '✓ Activa' : '✕ Inactiva'}
                </span>
            </td>
            <td>${formatDate(cred.fecha_asignacion)}</td>
            <td>${expiraHTML}</td>
            <td style="font-size: 0.9rem; color: var(--text-muted);">${cred.observaciones || '-'}</td>
            <td>
                <div style="display: flex; gap: 6px;">
                    <button onclick="openEditCredencialModal(${cred.id_credencial})" class="btn btn-sm btn-primary" style="padding: 4px 8px; font-size: 0.8rem;">✏️</button>
                    <button onclick="toggleCredencial(${cred.id_credencial}, ${!cred.activa})" class="btn btn-sm ${cred.activa ? 'btn-warning' : 'btn-success'}" style="padding: 4px 8px; font-size: 0.8rem;">
                        ${cred.activa ? '🔒' : '🔓'}
                    </button>
                    <button onclick="deleteCredencial(${cred.id_credencial})" class="btn btn-sm btn-danger" style="padding: 4px 8px; font-size: 0.8rem;">🗑️</button>
                    <button onclick="showDetalles(${cred.id_credencial})" class="btn btn-sm btn-secondary" style="padding: 4px 8px; font-size: 0.8rem;">👁️</button>
                </div>
            </td>
        </tr>
    `}).join('');
}

/**
 * Filtra credenciales
 */
function filterCredenciales() {
    const search = document.getElementById('search-credenciales').value.toLowerCase();
    const status = document.getElementById('filter-status').value;
    const tipo = document.getElementById('filter-tipo').value;

    const filtered = credenciales.filter(cred => {
        const matchSearch = !search || 
            cred.uid_nfc.toLowerCase().includes(search) || 
            cred.usuario?.nombre_completo.toLowerCase().includes(search);
        const matchStatus = !status || (status === 'activa' ? cred.activa : !cred.activa);
        const matchTipo = !tipo || cred.tipo_credencial === tipo;
        return matchSearch && matchStatus && matchTipo;
    });

    renderCredenciales(filtered);
}

/**
 * Abre modal para crear nueva credencial
 */
function openNewCredencialModal() {
    credencialActual = null;
    document.getElementById('credencial-id').value = '';
    document.getElementById('form-credencial').reset();
    document.getElementById('id_usuario').value = '';
    document.getElementById('usuario-search').value = '';
    document.getElementById('fecha_expiracion').value = '';
    document.getElementById('modal-title').textContent = 'Nueva Tarjeta NFC';
    document.getElementById('activa').value = '1';
    openModal('modal-credencial');
}

/**
 * Abre modal para editar credencial
 */
async function openEditCredencialModal(id) {
    try {
        const response = await fetch(`/api/credenciales/${id}`);
        const cred = await response.json();
        credencialActual = cred;

        document.getElementById('credencial-id').value = cred.id_credencial;
        document.getElementById('id_usuario').value = cred.id_usuario || '';
        // Buscar nombre del usuario para el campo de búsqueda
        const usr = usuarios.find(u => u.id_usuario == cred.id_usuario);
        document.getElementById('usuario-search').value = usr ? `${usr.nombre_completo} (${usr.tipo_usuario})` : '';
        document.getElementById('uid_nfc').value = cred.uid_nfc;
        document.getElementById('tipo_credencial').value = cred.tipo_credencial;
        document.getElementById('activa').value = cred.activa ? '1' : '0';
        document.getElementById('fecha_expiracion').value = cred.fecha_expiracion ? cred.fecha_expiracion.split('T')[0] : '';
        document.getElementById('observaciones').value = cred.observaciones || '';

        document.getElementById('modal-title').textContent = 'Editar Tarjeta NFC';
        openModal('modal-credencial');
    } catch (error) {
        console.error('Error cargando credencial:', error);
        showAlert('Error al cargar credencial', 'danger');
    }
}

/**
 * Genera un UID NFC aleatorio
 */
function generarUID() {
    const uid = Array.from({ length: 8 }, () => 
        ('0' + Math.floor(Math.random() * 255).toString(16)).slice(-2).toUpperCase()
    ).join(':');
    document.getElementById('uid_nfc').value = uid;
}

/**
 * Guarda una credencial
 */
document.getElementById('form-credencial')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!document.getElementById('id_usuario').value) {
        showAlert('Debes seleccionar un usuario', 'warning');
        document.getElementById('usuario-search').focus();
        return;
    }

    const id = document.getElementById('credencial-id').value;
    const data = {
        id_usuario: document.getElementById('id_usuario').value,
        uid_nfc: document.getElementById('uid_nfc').value,
        tipo_credencial: document.getElementById('tipo_credencial').value,
        activa: document.getElementById('activa').value === '1',
        fecha_expiracion: document.getElementById('fecha_expiracion').value || null,
        observaciones: document.getElementById('observaciones').value
    };

    try {
        let response;
        if (id) {
            response = await fetch(`/api/credenciales/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            response = await fetch('/api/credenciales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }

        if (response.ok) {
            showAlert(id ? 'Credencial actualizada' : 'Credencial creada', 'success');
            closeModal('modal-credencial');
            loadCredenciales();
        } else {
            const error = await response.json();
            showAlert(error.message || 'Error al guardar', 'danger');
        }
    } catch (error) {
        console.error('Error guardando credencial:', error);
        showAlert('Error al guardar credencial', 'danger');
    }
});

/**
 * Activa o desactiva una credencial
 */
async function toggleCredencial(id, activa) {
    try {
        const response = await fetch(`/api/credenciales/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activa })
        });

        if (response.ok) {
            showAlert(activa ? 'Credencial activada' : 'Credencial desactivada', 'success');
            loadCredenciales();
        }
    } catch (error) {
        console.error('Error cambiando estado:', error);
        showAlert('Error al cambiar estado', 'danger');
    }
}

/**
 * Elimina una credencial
 */
async function deleteCredencial(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta credencial?')) return;

    try {
        const response = await fetch(`/api/credenciales/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showAlert('Credencial eliminada', 'success');
            loadCredenciales();
        }
    } catch (error) {
        console.error('Error eliminando credencial:', error);
        showAlert('Error al eliminar credencial', 'danger');
    }
}

/**
 * Muestra detalles de una credencial
 */
async function showDetalles(id) {
    try {
        const response = await fetch(`/api/credenciales/${id}`);
        const cred = await response.json();

        document.getElementById('detail-uid').textContent = cred.uid_nfc;
        document.getElementById('detail-usuario').textContent = cred.usuario?.nombre_completo || 'Sin asignar';
        document.getElementById('detail-tipo').textContent = cred.tipo_credencial === 'fisica' ? '💳 Tarjeta Física' : '📱 Móvil/App';
        document.getElementById('detail-estado').innerHTML = `<span class="badge-nfc ${cred.activa ? 'activa' : 'inactiva'}">${cred.activa ? '✓ Activa' : '✕ Inactiva'}</span>`;
        document.getElementById('detail-fecha').textContent = formatDate(cred.fecha_asignacion);
        document.getElementById('detail-observaciones').textContent = cred.observaciones || 'Sin observaciones';

        openModal('modal-detalles');
    } catch (error) {
        console.error('Error cargando detalles:', error);
        showAlert('Error al cargar detalles', 'danger');
    }
}

/**
 * Copia el UID al portapapeles
 */
function copiarUID() {
    const uid = document.getElementById('detail-uid').textContent;
    navigator.clipboard.writeText(uid).then(() => {
        showAlert('UID copiado al portapapeles', 'success');
    }).catch(() => {
        showAlert('Error al copiar', 'danger');
    });
}

// Event listeners para filtros
document.getElementById('search-credenciales')?.addEventListener('keyup', filterCredenciales);
document.getElementById('filter-status')?.addEventListener('change', filterCredenciales);
document.getElementById('filter-tipo')?.addEventListener('change', filterCredenciales);

// Configurar cierres de modales
setupModalClose('modal-credencial', '.modal-close');
setupModalClose('modal-detalles', '.modal-close');

// Inicializar
loadUsuarios().then(() => setupUsuarioSearch());
loadCredenciales();

// Conectar al servicio NFC
console.log('Intentando conectar al servicio NFC en ws://localhost:3001');
connectToNFCService();
