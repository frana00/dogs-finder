import axios from 'axios';
import { API_CONFIG, ERROR_MESSAGES } from '../utils/constants';
import { getCredentials } from '../utils/storage';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Creates Basic Auth header
 * @param {string} username - The username
 * @param {string} password - The password
 * @returns {string} - The Authorization header value
 */
const createBasicAuthHeader = (username, password) => {
  const credentials = `${username}:${password}`;
  const encodedCredentials = btoa(credentials);
  return `Basic ${encodedCredentials}`;
};

// Request interceptor to add authentication
apiClient.interceptors.request.use(
  async (config) => {
    // Log the request for debugging
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    // For requests that don't need auth, skip adding credentials
    if (config.skipAuth) {
      return config;
    }

    try {
      const credentials = await getCredentials();
      if (credentials) {
        config.headers.Authorization = createBasicAuthHeader(
          credentials.username,
          credentials.password
        );
      }
    } catch (error) {
      console.error('Error getting credentials for request:', error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.log(`❌ API Error:`, error.message);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data:`, error.response.data);
    } else {
      console.log(`   Network error or timeout. Base URL: ${API_CONFIG.BASE_URL}`);
    }
    
    let errorMessage = ERROR_MESSAGES.SERVER_ERROR;

    if (!error.response) {
      // Network error
      errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
    } else {
      switch (error.response.status) {
        case 401:
          errorMessage = ERROR_MESSAGES.UNAUTHORIZED;
          break;
        case 500:
          errorMessage = ERROR_MESSAGES.SERVER_ERROR;
          break;
        default:
          // Try to get error message from response
          if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          }
          break;
      }
    }

    // Create a custom error object
    const customError = new Error(errorMessage);
    customError.status = error.response?.status;
    customError.originalError = error;

    return Promise.reject(customError);
  }
);

/**
 * Makes an authenticated request with specific credentials
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {Object} options - Request options
 * @param {string} username - Username for auth
 * @param {string} password - Password for auth
 * @returns {Promise} - Axios response
 */
export const makeAuthenticatedRequest = (method, url, options = {}, username, password) => {
  const config = {
    method,
    url,
    ...options,
    headers: {
      ...options.headers,
      Authorization: createBasicAuthHeader(username, password),
    },
  };

  return apiClient(config);
};

export default apiClient;
