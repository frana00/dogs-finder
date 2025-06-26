import { createUser, validateCredentials } from './users';
import { saveCredentials, saveUserData, clearCredentials, getCredentials, getUserData, saveUserDataForUser, getUserDataForUser } from '../utils/storage';
import apiClient from './api';

/**
 * Registers a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} - Created user data
 */
export const register = async (userData) => {
  try {
    const newUser = await createUser(userData);
    
    // Save the complete user data for future profile use
    const completeUserData = {
      id: newUser.id || 1,
      username: userData.username,
      email: userData.email,
      phoneNumber: userData.phoneNumber || '',
      subscriptionEmail: userData.email, // Use same email for both
      role: userData.role || 'USER',
      createdAt: newUser.createdAt || new Date().toISOString(),
    };
    
    // Save user data locally for profile management
    await saveUserDataForUser(userData.username, completeUserData);
    
    return newUser;
  } catch (error) {
    throw error;
  }
};

/**
 * Nueva función para obtener datos completos del usuario desde el backend con autenticación HTTP Basic
 * @param {string} username - The username
 * @param {string} password - The password
 * @returns {Promise<Object>} - User data
 */
export const fetchUserFromApi = async (username) => {
  // Usar URL base desde variables de entorno
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  
  // Usar credenciales de administrador para consultar datos de usuarios
  // SEGURIDAD: Estas credenciales DEBEN estar en variables de entorno
  const adminUsername = process.env.EXPO_PUBLIC_ADMIN_USERNAME;
  const adminPassword = process.env.EXPO_PUBLIC_ADMIN_PASSWORD;
  
  // Verificar que todas las variables de entorno estén configuradas
  if (!baseUrl || !adminUsername || !adminPassword) {
    console.error('❌ Missing required environment variables for API access');
    throw new Error('Missing required environment variables for API access');
  }
  
  const credentials = btoa(`${adminUsername}:${adminPassword}`);

  try {
    // Crear un timeout de 5 segundos para evitar que se cuelgue
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${baseUrl}/users/username/${username}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const userData = await response.json();
      return {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        subscriptionEmail: userData.subscriptionEmail,
        role: userData.role,
        createdAt: userData.createdAt,
      };
    } else {
      return null;
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('⚠️ API request timeout - continuing without API data');
    } else {
      console.warn('⚠️ Error fetching user from API:', error.message);
    }
    return null;
  }
};

/**
 * Logs in a user
 * @param {string} username - The username
 * @param {string} password - The password
 * @returns {Promise<Object>} - User data
 */
export const login = async (username, password) => {
  try {
    // Validate credentials with the API
    const validationResult = await validateCredentials(username, password);
    
    // Obtener datos completos del usuario desde el backend
    const apiUser = await fetchUserFromApi(username);
    
    // Check if we have existing user data for this specific user
    let existingUserData = await getUserDataForUser(username);
    
    // Crear objeto de usuario usando los datos del backend si existen
    const userData = {
      id: apiUser?.id || existingUserData?.id || 1,
      username: username,
      email: apiUser?.email || existingUserData?.email || '',
      phoneNumber: apiUser?.phoneNumber || existingUserData?.phoneNumber || '',
      subscriptionEmail: apiUser?.subscriptionEmail || apiUser?.email || existingUserData?.subscriptionEmail || '',
      role: apiUser?.role || existingUserData?.role || 'USER',
      createdAt: apiUser?.createdAt || existingUserData?.createdAt || new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
    
    // Save credentials and user data
    await saveCredentials(username, password);
    await saveUserDataForUser(username, userData);
    
    return userData;
  } catch (error) {
    throw error;
  }
};

/**
 * Logs out the current user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    // Only clear credentials, keep user data for next login
    // This allows users to see their profile data when they log back in
    await clearCredentials();
  } catch (error) {
    console.error('Error during logout:', error);
    // Don't throw error for logout
  }
};

/**
 * Gets the current authenticated user
 * @returns {Promise<Object|null>} - Current user data or null
 */
export const getCurrentUser = async () => {
  try {
    const userData = await getUserData();
    return userData;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Checks if user is authenticated
 * @returns {Promise<boolean>} - True if user is authenticated
 */
export const isAuthenticated = async () => {
  try {
    const credentials = await getCredentials();
    return credentials !== null;
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
};

/**
 * Validates current session by making an API call
 * @returns {Promise<boolean>} - True if session is valid
 */
export const validateSession = async () => {
  try {
    const credentials = await getCredentials();
    if (!credentials) {
      return false;
    }
    
    // Set a timeout for validation to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Validation timeout')), 3000)
    );
    
    // Try to validate credentials with API with timeout
    await Promise.race([
      validateCredentials(credentials.username, credentials.password),
      timeoutPromise
    ]);
    
    return true;
  } catch (error) {
    // If validation fails, clear stored data
    try {
      await clearCredentials();
    } catch (clearError) {
      console.warn('⚠️ Error clearing credentials:', clearError);
    }
    return false;
  }
};

/**
 * Requests a password reset email
 * @param {string} email - The email address
 * @returns {Promise<Object>} - Response message
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await apiClient.post('/auth/forgot-password', 
      { email }, 
      { skipAuth: true }
    );

    return response.data;
  } catch (error) {
    console.error('❌ Password reset request failed:', error);
    throw error;
  }
};

/**
 * Verifies if a reset token is valid
 * @param {string} token - The reset token
 * @returns {Promise<Object>} - Token validation result
 */
export const verifyResetToken = async (token) => {
  try {
    const response = await apiClient.get(`/auth/verify-reset-token/${token}`, {
      skipAuth: true
    });

    return response.data;
  } catch (error) {
    console.error('❌ Token verification failed:', error);
    throw error;
  }
};

/**
 * Resets password with token
 * @param {string} token - The reset token
 * @param {string} newPassword - The new password
 * @returns {Promise<Object>} - Reset result
 */
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await apiClient.post('/auth/reset-password', 
      { token, newPassword },
      { skipAuth: true }
    );

    return response.data;
  } catch (error) {
    console.error('❌ Password reset failed:', error);
    throw error;
  }
};
