// ==========================================
// GESTIÓN DE HORARIOS Y VIGENCIAS
// ==========================================

let usuariosData = [];
let horariosData = [];

/**
 * Carga usuarios y sus horarios
 */
async function loadHorarios() {
    try {
        showLoading('horarios-list');
        
        const [usuariosResp, horariosResp] = await Promise.all([
            fetch('/api/usuarios'),
            fetch('/api/horarios')
        ]);
        
        usuariosData = await usuariosResp.json();
        horariosData = await horariosResp.json();
        
        renderHorarios();
    } catch (error) {
        console.error('Error cargando horarios:', error);
        showAlert('Error al cargar horarios', 'danger');
    }
}

/**
 * Renderiza los horarios
 */
function renderHorarios() {
    const container = document.getElementById('horarios-list');
    if (!container) return;
    
    if (!Array.isArray(usuariosData) || usuariosData.length === 0) {
        container.innerHTML = '<div class="text-center text-muted py-40">No hay usuarios</div>';
        return;
    }
    
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    
    container.innerHTML = usuariosData.map(usuario => {
        const usuarioHorarios = horariosData.filter(h => h.id_usuario === usuario.id_usuario);
        
        return `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div>
                        <h3 style="margin-bottom: 4px;">${usuario.nombre_completo}</h3>
                        <div class="text-muted" style="font-size: 0.9rem;">${usuario.tipo_usuario}</div>
                    </div>
                    <div>
                        <button class="btn btn-primary" onclick="openHorarioModal(${usuario.id_usuario})">Agregar Horario</button>
                    </div>
                </div>
                
                ${renderUsuarioHorarios(usuario, usuarioHorarios, diasSemana)}
                
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border);">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <div class="text-muted" style="font-size: 0.85rem;">Vigencia inicio</div>
                            <div>${usuario.vigencia_inicio ? new Date(usuario.vigencia_inicio).toLocaleDateString('es-MX') : '-'}</div>
                        </div>
                        <div>
                            <div class="text-muted" style="font-size: 0.85rem;">Vigencia fin</div>
                            <div>${usuario.vigencia_fin ? new Date(usuario.vigencia_fin).toLocaleDateString('es-MX') : '-'}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Renderiza los horarios de un usuario
 */
function renderUsuarioHorarios(usuario, horarios, diasSemana) {
    if (!Array.isArray(horarios) || horarios.length === 0) {
        return '<div class="text-muted text-center" style="padding: 20px;">Sin horarios configurados</div>';
    }
    
    return `
        <table style="width: 100%; margin-bottom: 0;">
            <thead>
                <tr>
                    <th>Día</th>
                    <th>Hora Inicio</th>
                    <th>Hora Fin</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${horarios.map(h => `
                    <tr>
                        <td>${diasSemana[h.dia_semana - 1]}</td>
                        <td>${h.hora_inicio || '-'}</td>
                        <td>${h.hora_fin || '-'}</td>
                        <td>
                            <span class="badge badge-${h.activo ? 'active' : 'inactive'}">
                                ${h.activo ? 'Activo' : 'Inactivo'}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-small btn-secondary" onclick="toggleHorario(${h.id_horario}, ${h.activo})">
                                ${h.activo ? 'Desactivar' : 'Activar'}
                            </button>
                            <button class="btn btn-small btn-danger" onclick="deleteHorario(${h.id_horario})">Eliminar</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

/**
 * Abre modal para agregar horario
 */
function openHorarioModal(usuarioId) {
    document.getElementById('form-horario').reset();
    document.getElementById('horario-usuario-id').value = usuarioId;
    document.getElementById('horario-id').value = '';
    
    const usuario = usuariosData.find(u => u.id_usuario === usuarioId);
    document.getElementById('modal-horario-user').textContent = usuario?.nombre_completo || 'Usuario';
    
    openModal('modal-horario');
}

/**
 * Guarda un horario
 */
async function saveHorario(e) {
    e.preventDefault();
    
    const usuarioId = document.getElementById('horario-usuario-id').value;
    const diaSemana = document.getElementById('dia_semana').value;
    const horaInicio = document.getElementById('hora_inicio').value;
    const horaFin = document.getElementById('hora_fin').value;
    
    if (!diaSemana || !horaInicio || !horaFin) {
        showAlert('Por favor completa todos los campos', 'warning');
        return;
    }
    
    const horarioData = {
        id_usuario: parseInt(usuarioId),
        dia_semana: parseInt(diaSemana),
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        activo: true
    };
    
    try {
        const response = await fetch('/api/horarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(horarioData)
        });
        
        if (response.ok) {
            showAlert('Horario agregado', 'success');
            closeModal('modal-horario');
            loadHorarios();
        } else {
            showAlert('Error al guardar horario', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al guardar horario', 'danger');
    }
}

/**
 * Toggle horario activo/inactivo
 */
async function toggleHorario(id, activo) {
    try {
        const response = await fetch(`/api/horarios/${id}/toggle`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            showAlert(activo ? 'Horario desactivado' : 'Horario activado', 'success');
            loadHorarios();
        } else {
            showAlert('Error al actualizar horario', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al actualizar horario', 'danger');
    }
}

/**
 * Elimina un horario
 */
async function deleteHorario(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este horario?')) return;
    
    try {
        const response = await fetch(`/api/horarios/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showAlert('Horario eliminado', 'success');
            loadHorarios();
        } else {
            showAlert('Error al eliminar horario', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al eliminar horario', 'danger');
    }
}

/**
 * Inicializa página de horarios
 */
function initHorariosPage() {
    loadHorarios();
    
    const form = document.getElementById('form-horario');
    if (form) {
        form.addEventListener('submit', saveHorario);
    }
    
    setupModalClose('modal-horario', '.modal-close');
    
    // Auto-refresh
    setInterval(loadHorarios, 30000);
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHorariosPage);
} else {
    initHorariosPage();
}
