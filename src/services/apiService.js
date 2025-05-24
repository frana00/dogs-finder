import { API_CONFIG, buildUrl } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // Método para obtener headers con token de autenticación
  async getAuthHeaders() {
    const token = await AsyncStorage.getItem('userToken');
    return {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Método genérico para hacer peticiones
  async request(endpoint, options = {}) {
    const url = buildUrl(endpoint);
    const headers = await this.getAuthHeaders();

    const config = {
      timeout: this.timeout,
      headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Si es 401, el token expiró
      if (response.status === 401) {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        throw new Error('TOKEN_EXPIRED');
      }

      // Si no es exitoso, lanzar error
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      }

      // Si es una respuesta vacía (204 No Content), devolver null
      if (response.status === 204) {
        return null;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return await response.text();
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Métodos específicos para autenticación
  async login(email, password) {
    return this.request(API_CONFIG.ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData) {
    return this.request(API_CONFIG.ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Métodos para usuarios
  async getProfile() {
    return this.request(API_CONFIG.ENDPOINTS.PROFILE);
  }

  async updateProfile(userData) {
    return this.request(API_CONFIG.ENDPOINTS.UPDATE_PROFILE, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Métodos para alertas
  async getAlerts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `${API_CONFIG.ENDPOINTS.ALERTS}?${queryString}` : API_CONFIG.ENDPOINTS.ALERTS;
    return this.request(endpoint);
  }

  async getAlert(id) {
    const endpoint = API_CONFIG.ENDPOINTS.GET_ALERT.replace('{id}', id);
    return this.request(endpoint);
  }

  async createAlert(alertData) {
    return this.request(API_CONFIG.ENDPOINTS.CREATE_ALERT, {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  }

  async updateAlert(id, alertData) {
    const endpoint = API_CONFIG.ENDPOINTS.UPDATE_ALERT.replace('{id}', id);
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(alertData),
    });
  }

  async deleteAlert(id) {
    const endpoint = API_CONFIG.ENDPOINTS.DELETE_ALERT.replace('{id}', id);
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Método para subir fotos
  async uploadPhoto(alertId, photoUri) {
    const endpoint = API_CONFIG.ENDPOINTS.UPLOAD_PHOTO_TO_ALERT.replace('{alertId}', alertId);
    
    const formData = new FormData();
    const uriParts = photoUri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    
    formData.append('file', {
      uri: photoUri,
      name: `photo_${Date.now()}.${fileType}`,
      type: `image/${fileType}`,
    });

    const headers = await this.getAuthHeaders();
    // Remove Content-Type header to let the browser set it with boundary for FormData
    delete headers['Content-Type'];

    return this.request(endpoint, {
      method: 'POST',
      headers,
      body: formData,
    });
  }

  // Método para eliminar foto
  async deletePhoto(photoId) {
    const endpoint = API_CONFIG.ENDPOINTS.DELETE_PHOTO.replace('{photoId}', photoId);
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Métodos para códigos postales/ubicaciones
  async searchPostcodes(query) {
    const endpoint = `${API_CONFIG.ENDPOINTS.SEARCH_POSTCODES}?q=${encodeURIComponent(query)}`;
    return this.request(endpoint);
  }
}

// Crear una instancia única del servicio
const apiService = new ApiService();

export default apiService;
