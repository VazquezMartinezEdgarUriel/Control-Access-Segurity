// ==========================================
// GESTIÓN DE USUARIOS
// ==========================================

let usuariosData = [];

/**
 * Carga la lista de usuarios
 */
async function loadUsuarios() {
    try {
        showLoading('usuarios-table');
        const response = await fetch('/api/usuarios');
        usuariosData = await response.json();
        
        renderUsuarios(usuariosData);
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        showAlert('Error al cargar usuarios', 'danger');
    }
}

/**
 * Renderiza la tabla de usuarios
 */
function renderUsuarios(usuarios) {
    const tbody = document.getElementById('usuarios-table');
    if (!tbody) return;
    
    if (!Array.isArray(usuarios) || usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hay usuarios registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = usuarios.map(usuario => `
        <tr>
            <td><strong>${usuario.nombre_completo}</strong></td>
            <td>${usuario.tipo_usuario}</td>
            <td>${usuario.email || '-'}</td>
            <td>
                <span class="badge badge-${usuario.activo ? 'active' : 'inactive'}">
                    ${usuario.activo ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>${usuario.vigencia_fin ? new Date(usuario.vigencia_fin).toLocaleDateString('es-MX') : '-'}</td>
            <td>
                <button class="btn btn-small btn-primary" onclick="viewUsuario(${usuario.id_usuario})">Ver</button>
                <button class="btn btn-small btn-secondary" onclick="editUsuario(${usuario.id_usuario})">Editar</button>
            </td>
        </tr>
    `).join('');
}

/**
 * Abre la modal para crear nuevo usuario
 */
function openNewUsuarioModal() {
    document.getElementById('form-usuario').reset();
    document.getElementById('modal-title').textContent = 'Nuevo Usuario';
    document.getElementById('usuario-id').value = '';
    openModal('modal-usuario');
}

/**
 * Ve un usuario específico
 */
function viewUsuario(id) {
    const usuario = usuariosData.find(u => u.id_usuario === id);
    if (!usuario) return;
    
    // Redirige a página de perfil con ID
    window.location.href = `usuario.html?id=${id}`;
}

/**
 * Edita un usuario
 */
function editUsuario(id) {
    const usuario = usuariosData.find(u => u.id_usuario === id);
    if (!usuario) return;
    
    document.getElementById('usuario-id').value = usuario.id_usuario;
    document.getElementById('nombre_completo').value = usuario.nombre_completo;
    document.getElementById('tipo_usuario').value = usuario.tipo_usuario;
    document.getElementById('email').value = usuario.email || '';
    document.getElementById('telefono').value = usuario.telefono || '';
    document.getElementById('activo').checked = usuario.activo;
    
    document.getElementById('modal-title').textContent = 'Editar Usuario';
    openModal('modal-usuario');
}

/**
 * Guarda un usuario
 */
async function saveUsuario(e) {
    e.preventDefault();
    
    const id = document.getElementById('usuario-id').value;
    const nombre_completo = document.getElementById('nombre_completo').value;
    const tipo_usuario = document.getElementById('tipo_usuario').value;
    const email = document.getElementById('email').value;
    const telefono = document.getElementById('telefono').value;
    const activo = document.getElementById('activo').checked;
    
    if (!nombre_completo || !tipo_usuario) {
        showAlert('Por favor completa los campos requeridos', 'warning');
        return;
    }
    
    const usuarioData = {
        nombre_completo,
        tipo_usuario,
        email: email || null,
        telefono: telefono || null,
        activo
    };
    
    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/usuarios/${id}` : '/api/usuarios';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usuarioData)
        });
        
        if (response.ok) {
            showAlert(id ? 'Usuario actualizado' : 'Usuario creado', 'success');
            closeModal('modal-usuario');
            loadUsuarios();
        } else {
            showAlert('Error al guardar usuario', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al guardar usuario', 'danger');
    }
}

/**
 * Elimina un usuario
 */
async function deleteUsuario(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;
    
    try {
        const response = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showAlert('Usuario eliminado', 'success');
            loadUsuarios();
        } else {
            showAlert('Error al eliminar usuario', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al eliminar usuario', 'danger');
    }
}

/**
 * Inicializa página de usuarios
 */
function initUsuariosPage() {
    loadUsuarios();
    
    const form = document.getElementById('form-usuario');
    if (form) {
        form.addEventListener('submit', saveUsuario);
    }
    
    // Cerrar modal
    setupModalClose('modal-usuario', '.modal-close');
    
    // Búsqueda en vivo
    const searchInput = document.getElementById('search-usuarios');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            const query = e.target.value.toLowerCase();
            const filtered = usuariosData.filter(u => 
                u.nombre_completo.toLowerCase().includes(query) ||
                u.email?.toLowerCase().includes(query)
            );
            renderUsuarios(filtered);
        }, 300));
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUsuariosPage);
} else {
    initUsuariosPage();
}
