// API Base URL
const API_URL = '/api';

// ==========================================
// USUARIOS API
// ==========================================
class UsuariosAPI {
    static async getAll() {
        try {
            const response = await fetch(`${API_URL}/usuarios`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching usuarios:', error);
            return [];
        }
    }

    static async get(id) {
        try {
            const response = await fetch(`${API_URL}/usuarios/${id}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching usuario:', error);
            return null;
        }
    }

    static async create(usuario) {
        try {
            const response = await fetch(`${API_URL}/usuarios`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(usuario)
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating usuario:', error);
            return null;
        }
    }

    static async update(id, usuario) {
        try {
            const response = await fetch(`${API_URL}/usuarios/${id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(usuario)
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating usuario:', error);
            return null;
        }
    }
}

// ==========================================
// CREDENCIALES API
// ==========================================
class CredencialesAPI {
    static async getAll() {
        try {
            const response = await fetch(`${API_URL}/credenciales`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching credenciales:', error);
            return [];
        }
    }

    static async getPorUsuario(usuarioId) {
        try {
            const response = await fetch(`${API_URL}/credenciales/usuario/${usuarioId}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching credenciales por usuario:', error);
            return [];
        }
    }

    static async create(credencial) {
        try {
            const response = await fetch(`${API_URL}/credenciales`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(credencial)
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating credencial:', error);
            return null;
        }
    }
}

// ==========================================
// VEHICULOS API
// ==========================================
class VehiculosAPI {
    static async getAll() {
        try {
            const response = await fetch(`${API_URL}/vehiculos`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching vehiculos:', error);
            return [];
        }
    }

    static async getPorUsuario(usuarioId) {
        try {
            const response = await fetch(`${API_URL}/vehiculos/usuario/${usuarioId}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching vehiculos por usuario:', error);
            return [];
        }
    }

    static async getPorPlaca(placa) {
        try {
            const response = await fetch(`${API_URL}/vehiculos/placa/${placa}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching vehiculo por placa:', error);
            return null;
        }
    }

    static async create(vehiculo) {
        try {
            const response = await fetch(`${API_URL}/vehiculos`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(vehiculo)
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating vehiculo:', error);
            return null;
        }
    }
}

// ==========================================
// ACCESO PEATONAL API
// ==========================================
class AccesoPeatonalAPI {
    static async getAll() {
        try {
            const response = await fetch(`${API_URL}/acceso-peatonal`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching acceso peatonal:', error);
            return [];
        }
    }

    static async registrarEntrada(data) {
        try {
            const response = await fetch(`${API_URL}/acceso-peatonal/entrada`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Error registering entrada:', error);
            return null;
        }
    }

    static async registrarSalida(id) {
        try {
            const response = await fetch(`${API_URL}/acceso-peatonal/${id}/salida`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'}
            });
            return await response.json();
        } catch (error) {
            console.error('Error registering salida:', error);
            return null;
        }
    }

    static async getPorUsuario(usuarioId) {
        try {
            const response = await fetch(`${API_URL}/acceso-peatonal/usuario/${usuarioId}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching acceso peatonal por usuario:', error);
            return [];
        }
    }
}

// ==========================================
// ACCESO VEHICULAR API
// ==========================================
class AccesoVehicularAPI {
    static async getAll() {
        try {
            const response = await fetch(`${API_URL}/acceso-vehicular`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching acceso vehicular:', error);
            return [];
        }
    }

    static async registrarEntrada(data) {
        try {
            const response = await fetch(`${API_URL}/acceso-vehicular/entrada`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Error registering entrada vehicular:', error);
            return null;
        }
    }

    static async getPorPlaca(placa) {
        try {
            const response = await fetch(`${API_URL}/acceso-vehicular/placa/${placa}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching acceso vehicular por placa:', error);
            return [];
        }
    }

    static async getDenegados() {
        try {
            const response = await fetch(`${API_URL}/acceso-vehicular/denegados`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching accesos denegados:', error);
            return [];
        }
    }
}

// ==========================================
// HORARIOS API
// ==========================================
class HorariosAPI {
    static async getAll() {
        try {
            const response = await fetch(`${API_URL}/horarios`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching horarios:', error);
            return [];
        }
    }

    static async getPorUsuario(usuarioId) {
        try {
            const response = await fetch(`${API_URL}/horarios/usuario/${usuarioId}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching horarios por usuario:', error);
            return [];
        }
    }

    static async create(horario) {
        try {
            const response = await fetch(`${API_URL}/horarios`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(horario)
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating horario:', error);
            return null;
        }
    }

    static async toggle(id) {
        try {
            const response = await fetch(`${API_URL}/horarios/${id}/toggle`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'}
            });
            return await response.json();
        } catch (error) {
            console.error('Error toggling horario:', error);
            return null;
        }
    }
}

// ==========================================
// VISITANTES API
// ==========================================
class VisitantesAPI {
    static async getAll() {
        try {
            const response = await fetch(`${API_URL}/visitantes`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching visitantes:', error);
            return [];
        }
    }

    static async create(visitante) {
        try {
            const response = await fetch(`${API_URL}/visitantes`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(visitante)
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating visitante:', error);
            return null;
        }
    }

    static async update(id, visitante) {
        try {
            const response = await fetch(`${API_URL}/visitantes/${id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(visitante)
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating visitante:', error);
            return null;
        }
    }

    static async delete(id) {
        try {
            const response = await fetch(`${API_URL}/visitantes/${id}`, {method: 'DELETE'});
            return await response.json();
        } catch (error) {
            console.error('Error deleting visitante:', error);
            return null;
        }
    }
}

// ==========================================
// HELPERS
// ==========================================
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; padding: 16px; border-radius: 6px; background-color: ' + 
        (type === 'success' ? '#f0fff4' : '#fff5f5') + '; color: ' + 
        (type === 'success' ? '#22543d' : '#742a2a') + '; min-width: 300px;';
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => alertDiv.remove(), 3000);
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('es-MX');
}

function formatDate(date) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });
}
