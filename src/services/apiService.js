import { API_CONFIG, buildUrl } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer'; // Added for Base64 encoding
import { BASIC_AUTH_USERNAME, BASIC_AUTH_PASSWORD } from '@env'; // Added for Basic Auth credentials

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
    let combinedHeaders = await this.getAuthHeaders(); // Este ya tiene Content-Type, Accept y Bearer (si existe)

    // Añadir Basic Auth si las credenciales están disponibles y no hay un token Bearer
    // O si el endpoint es el de login, donde Basic Auth podría ser requerido en lugar de Bearer
    // Esta lógica puede necesitar ajuste fino según cómo el backend priorice los esquemas de Auth
    if (BASIC_AUTH_USERNAME && BASIC_AUTH_PASSWORD) {
      const basicAuthCredentials = `${BASIC_AUTH_USERNAME}:${BASIC_AUTH_PASSWORD}`;
      const base64Credentials = Buffer.from(basicAuthCredentials).toString('base64');
      
      // TEMPORARY DEBUGGING: Always add Basic Auth if no Bearer, OR if endpoint is LOGIN, PROFILE or ALERTS
      if (!combinedHeaders.Authorization || 
          endpoint === API_CONFIG.ENDPOINTS.LOGIN || 
          endpoint === API_CONFIG.ENDPOINTS.PROFILE ||
          endpoint.startsWith(API_CONFIG.ENDPOINTS.ALERTS)) { 
           combinedHeaders = {
            ...combinedHeaders,
            'Authorization': `Basic ${base64Credentials}`,
            // Consider if backend needs Content-Type even for GET with Basic Auth, though usually not.
            // 'Content-Type': 'application/json', // Might be needed by some backends even for GET
            // 'Accept': 'application/json',
          };
      }
    }

    const config = {
      headers: combinedHeaders, // Usar los headers combinados
      ...options,
    };

    console.log('🌐 API Request:', { url, method: options.method || 'GET', headers: config.headers, body: options.body }); // Loguear los headers finales

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
    // Part 1: Call POST /alerts/{alertId}/photos to get the S3 presigned URL and s3ObjectKey
    const initialEndpoint = API_CONFIG.ENDPOINTS.UPLOAD_PHOTO_TO_ALERT.replace('{alertId}', alertId);
    const uriParts = photoUri.split('.');
    const fileType = uriParts[uriParts.length - 1] || 'jpg'; // Default to jpg if no extension
    const suggestedFilename = `photo_${Date.now()}.${fileType}`;

    const authHeaders = await this.getAuthHeaders();

    console.log(`🚀 Step 1: Requesting S3 upload details from ${initialEndpoint} for ${suggestedFilename}`);
    // Make the initial request to our backend to get S3 upload details
    const s3UploadInstructions = await this.request(initialEndpoint, {
      method: 'POST',
      headers: {
        // this.request will spread its own default headers (including auth if getAuthHeaders is part of it)
        // Explicitly set Content-Type and Accept for this JSON request
        ...authHeaders, // Ensure auth headers are included if not automatically by this.request
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ photoFilenames: [suggestedFilename] }),
    });

    console.log('✅ Received S3 upload instructions:', s3UploadInstructions);

    // Expecting response like: [ { "s3ObjectKey": "...", "presignedUrl": "..." } ]
    if (!s3UploadInstructions || !Array.isArray(s3UploadInstructions) || s3UploadInstructions.length === 0 ||
        !s3UploadInstructions[0].presignedUrl || !s3UploadInstructions[0].s3ObjectKey) {
      console.error('❌ Failed to get S3 presigned URL or s3ObjectKey from backend:', s3UploadInstructions);
      throw new Error('Failed to get S3 upload details from backend.');
    }
    
    const { presignedUrl, s3ObjectKey } = s3UploadInstructions[0];

    // Part 2: Upload the actual file DIRECTLY to the S3 presigned URL
    console.log(`🚀 Step 2: Fetching local image blob for ${photoUri}`);
    const imageResponse = await fetch(photoUri);
    if (!imageResponse.ok) {
      console.error(`❌ Failed to fetch local image URI: ${photoUri}, status: ${imageResponse.status}`);
      throw new Error(`Failed to fetch local image URI: ${photoUri}`);
    }
    const imageBlob = await imageResponse.blob();
    const imageContentType = imageBlob.type || `image/${fileType}`; // Use blob's type, or derive

    console.log(`🚀 Step 3: Uploading to S3 presigned URL: ${presignedUrl.substring(0,100)}... Content-Type: ${imageContentType}`);

    const s3Response = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': imageContentType,
        // No Authorization header for S3 presigned PUT
      },
      body: imageBlob,
    });

    if (!s3Response.ok) {
      const s3ErrorText = await s3Response.text().catch(() => `S3 upload failed with status ${s3Response.status}`);
      console.error(`❌ S3 upload failed: ${s3Response.status}, Key: ${s3ObjectKey}, Error: ${s3ErrorText}`);
      throw new Error(`S3 upload failed: ${s3Response.status}. Details: ${s3ErrorText}`);
    }

    console.log(`✅ S3 upload successful for objectKey: ${s3ObjectKey}`);
    return { success: true, s3ObjectKey };
  }

  // Nueva función para subir archivos a S3 usando URL pre-firmada
  async uploadFileToS3(presignedUrl, fileUri, fileType) {
    try {
      // Obtener el blob del archivo desde la URI local
      const response = await fetch(fileUri);
      const blob = await response.blob();

      // Subir el archivo a S3 usando la URL pre-firmada
      const s3Response = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': fileType, // Ej: 'image/jpeg', 'image/png'
        },
        body: blob,
      });

      if (!s3Response.ok) {
        // Intenta leer el cuerpo del error si es posible
        let errorBody = '';
        try {
          errorBody = await s3Response.text();
        } catch (e) {
          // No hacer nada si no se puede leer el cuerpo
        }
        console.error('Error en S3 upload:', s3Response.status, errorBody);
        throw new Error(`Error al subir archivo a S3: ${s3Response.status}. ${errorBody}`);
      }

      // La subida fue exitosa, no hay cuerpo de respuesta en un PUT exitoso a S3 pre-firmado
      return { success: true, status: s3Response.status };

    } catch (error) {
      console.error('Excepción en uploadFileToS3:', error);
      throw error; // Re-lanzar el error para que el llamador lo maneje
    }
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
