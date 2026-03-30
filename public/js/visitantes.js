// ==========================================
// GESTIÓN DE VISITANTES
// ==========================================

let visitantesData = [];

/**
 * Carga la lista de visitantes
 */
async function loadVisitantes() {
    try {
        showLoading('visitantes-list');
        const response = await fetch('/api/visitantes');
        visitantesData = await response.json();
        
        renderVisitantes(visitantesData);
    } catch (error) {
        console.error('Error cargando visitantes:', error);
        showAlert('Error al cargar visitantes', 'danger');
    }
}

/**
 * Renderiza la lista de visitantes
 */
function renderVisitantes(visitantes) {
    const container = document.getElementById('visitantes-list');
    if (!container) return;
    
    if (!Array.isArray(visitantes) || visitantes.length === 0) {
        container.innerHTML = '<div class="text-center text-muted py-40">No hay visitantes registrados</div>';
        return;
    }
    
    container.innerHTML = visitantes.map(v => {
        const usuario = v.usuario || {};
        const diasRestantes = v.fecha_salida_estimada 
            ? Math.ceil((new Date(v.fecha_salida_estimada) - new Date()) / (1000 * 60 * 60 * 24))
            : 0;
        
        return `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <h3 style="margin-bottom: 8px;">${usuario.nombre_completo || 'Sin nombre'}</h3>
                        <div class="text-muted" style="margin-bottom: 12px;">${v.empresa || 'Empresa no especificada'}</div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div>
                                <div class="text-muted" style="font-size: 0.85rem;">Motivo</div>
                                <div>${v.motivo || '-'}</div>
                            </div>
                            <div>
                                <div class="text-muted" style="font-size: 0.85rem;">Autorizado por</div>
                                <div>${v.autorizado_por || '-'}</div>
                            </div>
                            <div>
                                <div class="text-muted" style="font-size: 0.85rem;">Entrada estimada</div>
                                <div>${formatDate(v.fecha_entrada_estimada)}</div>
                            </div>
                            <div>
                                <div class="text-muted" style="font-size: 0.85rem;">Salida estimada</div>
                                <div>${formatDate(v.fecha_salida_estimada)}</div>
                            </div>
                        </div>
                        
                        ${diasRestantes > 0 ? `
                            <div style="margin-top: 12px;">
                                <span class="badge badge-pending">Faltan ${diasRestantes} días</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div style="display: flex; gap: 8px; flex-direction: column;">
                        <button class="btn btn-small btn-primary" onclick="editVisitante(${v.id_visitante})">Editar</button>
                        <button class="btn btn-small btn-danger" onclick="deleteVisitante(${v.id_visitante})">Eliminar</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Abre la modal para nuevo visitante
 */
function openNewVisitanteModal() {
    document.getElementById('form-visitante').reset();
    document.getElementById('visitante-id').value = '';
    document.getElementById('modal-visitante-title').textContent = 'Registrar Nuevo Visitante';
    openModal('modal-visitante');
}

/**
 * Edita un visitante
 */
function editVisitante(id) {
    const visitante = visitantesData.find(v => v.id_visitante === id);
    if (!visitante) return;
    
    const usuario = visitante.usuario || {};
    
    document.getElementById('visitante-id').value = visitante.id_visitante;
    document.getElementById('nombre_visitante').value = usuario.nombre_completo || '';
    document.getElementById('empresa').value = visitante.empresa || '';
    document.getElementById('motivo').value = visitante.motivo || '';
    document.getElementById('autorizado_por').value = visitante.autorizado_por || '';
    document.getElementById('fecha_entrada').value = visitante.fecha_entrada_estimada 
        ? new Date(visitante.fecha_entrada_estimada).toISOString().slice(0, 16)
        : '';
    document.getElementById('fecha_salida').value = visitante.fecha_salida_estimada 
        ? new Date(visitante.fecha_salida_estimada).toISOString().slice(0, 16)
        : '';
    
    document.getElementById('modal-visitante-title').textContent = 'Editar Visitante';
    openModal('modal-visitante');
}

/**
 * Guarda un visitante
 */
async function saveVisitante(e) {
    e.preventDefault();
    
    const id = document.getElementById('visitante-id').value;
    const nombre = document.getElementById('nombre_visitante').value;
    const empresa = document.getElementById('empresa').value;
    const motivo = document.getElementById('motivo').value;
    const autorizado_por = document.getElementById('autorizado_por').value;
    const fecha_entrada = document.getElementById('fecha_entrada').value;
    const fecha_salida = document.getElementById('fecha_salida').value;
    
    if (!nombre || !empresa) {
        showAlert('Por favor completa los campos requeridos', 'warning');
        return;
    }
    
    try {
        // Primero crear/actualizar el usuario si no existe
        let usuarioId;
        
        if (id) {
            const visitante = visitantesData.find(v => v.id_visitante === parseInt(id));
            usuarioId = visitante?.usuario?.id_usuario;
        }
        
        const usuarioData = {
            nombre_completo: nombre,
            tipo_usuario: 'visitante',
            email: null,
            telefono: null,
            activo: true
        };
        
        if (usuarioId) {
            await fetch(`/api/usuarios/${usuarioId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(usuarioData)
            });
        } else {
            const resp = await fetch('/api/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(usuarioData)
            });
            const user = await resp.json();
            usuarioId = user.id_usuario;
        }
        
        // Guardar visitante
        const visitanteData = {
            id_usuario: usuarioId,
            empresa,
            motivo: motivo || null,
            autorizado_por: autorizado_por || null,
            fecha_entrada_estimada: fecha_entrada || null,
            fecha_salida_estimada: fecha_salida || null
        };
        
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/visitantes/${id}` : '/api/visitantes';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(visitanteData)
        });
        
        if (response.ok) {
            showAlert(id ? 'Visitante actualizado' : 'Visitante registrado', 'success');
            closeModal('modal-visitante');
            loadVisitantes();
        } else {
            showAlert('Error al guardar visitante', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al guardar visitante', 'danger');
    }
}

/**
 * Elimina un visitante
 */
async function deleteVisitante(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este visitante?')) return;
    
    try {
        const response = await fetch(`/api/visitantes/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showAlert('Visitante eliminado', 'success');
            loadVisitantes();
        } else {
            showAlert('Error al eliminar visitante', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al eliminar visitante', 'danger');
    }
}

/**
 * Inicializa página de visitantes
 */
function initVisitantesPage() {
    loadVisitantes();
    
    const form = document.getElementById('form-visitante');
    if (form) {
        form.addEventListener('submit', saveVisitante);
    }
    
    setupModalClose('modal-visitante', '.modal-close');
    
    // Auto-refresh
    setInterval(loadVisitantes, 30000);
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVisitantesPage);
} else {
    initVisitantesPage();
}
