// Configuración de la API
export const API_CONFIG = {
  // Usar la IP local para desarrollo
  BASE_URL: 'http://192.168.31.94:8080/api/v1',
  
  // Tiempo máximo de espera para las peticiones (en milisegundos)
  TIMEOUT: 10000,
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Endpoints de autenticación
  ENDPOINTS: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/users/me',
  },
};

// Función para construir la URL completa
export const buildUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
