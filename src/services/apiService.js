import { API_CONFIG, buildUrl } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiService {
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
    const url = await buildUrl(endpoint);
    const headers = await this.getAuthHeaders();

    const config = {
      headers,
      ...options,
    };

    console.log('🌐 API Request:', { url, method: options.method || 'GET', headers, body: options.body });

    try {
      // Implementar timeout manual porque fetch no lo respeta
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('🌐 API Response:', { status: response.status, ok: response.ok, url });
      
      // Si es 401, el token expiró
      if (response.status === 401) {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        throw new Error('TOKEN_EXPIRED');
      }

      // Si no es exitoso, lanzar error
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error response:', errorData);
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
      console.error(`❌ API Error for ${endpoint}:`, error);
      
      // Manejar timeout/abort
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  // Métodos específicos para autenticación
  async login(email, password) {
    const response = await this.request(API_CONFIG.ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ username: email, password }),
    });
    
    // Transform backend response to match frontend expectations
    if (response.token && response.username) {
      return {
        token: response.token,
        user: {
          username: response.username,
          email: response.username, // Backend uses username as email
          role: response.role || 'USER'
        }
      };
    }
    
    return response;
  }

  async register(userData) {
    // Transform frontend userData to backend UserRequest format
    const userRequest = {
      username: userData.email, // Backend usa email como username
      email: userData.email,
      subscriptionEmail: userData.subscriptionEmail || userData.email,
      phoneNumber: userData.phone || userData.phoneNumber
    };
    
    console.log('📤 Sending registration data:', userRequest);
    
    return this.request(API_CONFIG.ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userRequest),
    });
  }

  // Método para probar la conectividad
  async testConnection() {
    try {
      const baseUrl = await buildUrl('');
      console.log('🔍 Testing connection to:', baseUrl);
      
      // Probar el endpoint de login primero (sabemos que funciona)
      const testResponse = await fetch(baseUrl + '/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        },
        body: JSON.stringify({
          username: 'test@test.com',
          password: 'test123'
        }),
        timeout: 5000
      });
      
      console.log('🔍 Login test response:', testResponse.status);
      return testResponse.ok;
    } catch (error) {
      console.log('🔍 Connection test failed:', error.message);
      return false;
    }
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
