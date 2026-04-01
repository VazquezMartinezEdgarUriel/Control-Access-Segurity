import axios from 'axios';

// ✅ CONFIGURADO AUTOMÁTICAMENTE - IP local de tu PC
// Conexión desde Expo Go en teléfono móvil a servidor Laravel local
const API_BASE_URL = 'http://192.168.0.104:8000/api'; // ✅ Tu IP configurada

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

export const solicitudService = {
  /**
   * Crear nueva solicitud de visitante
   */
  crearSolicitud: async (datos) => {
    try {
      const response = await api.post('/solicitud-visitante/crear', datos);
      return response.data;
    } catch (error) {
      throw {
        message: error.response?.data?.error || error.message,
        status: error.response?.status
      };
    }
  },

  /**
   * Obtener todas las solicitudes con filtros
   */
  obtenerSolicitudes: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.buscar) params.append('buscar', filtros.buscar);
      
      const queryString = params.toString();
      const url = queryString ? `/solicitudes-visitante?${queryString}` : '/solicitudes-visitante';
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw {
        message: error.message,
        status: error.response?.status
      };
    }
  },

  /**
   * Obtener solicitudes pendientes
   */
  obtenerSolicitudesPendientes: async () => {
    try {
      const response = await api.get('/solicitudes-visitante/pendientes');
      return response.data;
    } catch (error) {
      throw {
        message: error.message,
        status: error.response?.status
      };
    }
  },

  /**
   * Ver detalle de una solicitud
   */
  obtenerSolicitud: async (id) => {
    try {
      const response = await api.get(`/solicitudes-visitante/${id}`);
      return response.data;
    } catch (error) {
      throw {
        message: error.message,
        status: error.response?.status
      };
    }
  },

  /**
   * Aprobar solicitud
   */
  aprobarSolicitud: async (id) => {
    try {
      const response = await api.post(`/solicitudes-visitante/${id}/aprobar`);
      return response.data;
    } catch (error) {
      throw {
        message: error.response?.data?.error || error.message,
        status: error.response?.status
      };
    }
  },

  /**
   * Denegar solicitud
   */
  negarSolicitud: async (id, motivo) => {
    try {
      const response = await api.post(`/solicitudes-visitante/${id}/negar`, {
        motivo_denegacion: motivo
      });
      return response.data;
    } catch (error) {
      throw {
        message: error.response?.data?.error || error.message,
        status: error.response?.status
      };
    }
  },

  /**
   * Obtener estadísticas
   */
  obtenerEstadisticas: async () => {
    try {
      const response = await api.get('/solicitudes-visitante/estadisticas/general');
      return response.data;
    } catch (error) {
      throw {
        message: error.message,
        status: error.response?.status
      };
    }
  }
};

export default api;
