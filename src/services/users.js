import apiClient from './api';

/**
 * Creates a new user (registration)
 * @param {Object} userData - User data for registration
 * @returns {Promise<Object>} - Created user data
 */
export const createUser = async (userData) => {
  const response = await apiClient.post('/users', userData, { skipAuth: true });
  return response.data;
};

/**
 * Gets user by ID
 * @param {number} userId - The user ID
 * @returns {Promise<Object>} - User data
 */
export const getUserById = async (userId) => {
  const response = await apiClient.get(`/users/${userId}`);
  return response.data;
};

/**
 * Updates user data using PATCH (partial update)
 * @param {number} userId - The user ID
 * @param {Object} userData - Updated user data (only fields to update)
 * @returns {Promise<Object>} - Updated user data
 */
export const updateUser = async (userId, userData) => {
  const response = await apiClient.patch(`/users/${userId}`, userData);
  return response.data;
};

/**
 * Validates user credentials by making an authenticated request
 * @param {string} username - The username
 * @param {string} password - The password
 * @returns {Promise<Object>} - User data if credentials are valid
 */
export const validateCredentials = async (username, password) => {
  // We'll try to get the user's own data to validate credentials
  // First, we need to get the user ID somehow. For now, we'll make a request
  // to a protected endpoint to validate the credentials
  try {
    // Make a simple authenticated request to validate credentials
    const response = await apiClient.get('/alerts', {
      headers: {
        Authorization: `Basic ${btoa(`${username}:${password}`)}`,
      },
      params: {
        page: 0,
        size: 1,
      },
    });
    
    // If we get here, credentials are valid
    // We need to get user data somehow. Since we don't have a current user endpoint,
    // we'll return a basic user object with the username
    // In a real app, the API should have a /users/me endpoint
    return {
      username,
      // We don't have the user ID from this endpoint, so we'll handle this differently
      // in the auth service
    };
  } catch (error) {
    throw error;
  }
};
