import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from './constants';

/**
 * Saves user credentials securely
 * @param {string} username - The username
 * @param {string} password - The password
 * @returns {Promise<void>}
 */
export const saveCredentials = async (username, password) => {
  try {
    const credentials = JSON.stringify({ username, password });
    await SecureStore.setItemAsync(STORAGE_KEYS.CREDENTIALS, credentials);
  } catch (error) {
    console.error('Error saving credentials:', error);
    throw new Error('Failed to save credentials');
  }
};

/**
 * Gets saved user credentials
 * @returns {Promise<{username: string, password: string}|null>}
 */
export const getCredentials = async () => {
  try {
    const credentials = await SecureStore.getItemAsync(STORAGE_KEYS.CREDENTIALS);
    if (credentials) {
      return JSON.parse(credentials);
    }
    return null;
  } catch (error) {
    console.error('Error getting credentials:', error);
    return null;
  }
};

/**
 * Clears saved credentials
 * @returns {Promise<void>}
 */
export const clearCredentials = async () => {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.CREDENTIALS);
  } catch (error) {
    console.error('Error clearing credentials:', error);
    // Don't throw error, just log it
  }
};

/**
 * Saves user data
 * @param {Object} userData - The user data to save
 * @returns {Promise<void>}
 */
export const saveUserData = async (userData) => {
  try {
    const data = JSON.stringify(userData);
    await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, data);
  } catch (error) {
    console.error('Error saving user data:', error);
    throw new Error('Failed to save user data');
  }
};

/**
 * Gets saved user data
 * @returns {Promise<Object|null>}
 */
export const getUserData = async () => {
  try {
    const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Clears saved user data
 * @returns {Promise<void>}
 */
export const clearUserData = async () => {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
  } catch (error) {
    console.error('Error clearing user data:', error);
    // Don't throw error, just log it
  }
};

/**
 * Clears all stored data
 * @returns {Promise<void>}
 */
export const clearAllData = async () => {
  await clearCredentials();
  await clearUserData();
};

/**
 * Saves user data for a specific username
 * @param {string} username - The username
 * @param {Object} userData - The user data to save
 * @returns {Promise<void>}
 */
export const saveUserDataForUser = async (username, userData) => {
  try {
    const key = `${STORAGE_KEYS.USER_DATA}_${username}`;
    const data = JSON.stringify(userData);
    await SecureStore.setItemAsync(key, data);
    
    // Also save as current user data for backward compatibility
    await saveUserData(userData);
  } catch (error) {
    console.error('Error saving user data for user:', error);
    throw new Error('Failed to save user data');
  }
};

/**
 * Gets saved user data for a specific username
 * @param {string} username - The username
 * @returns {Promise<Object|null>}
 */
export const getUserDataForUser = async (username) => {
  try {
    const key = `${STORAGE_KEYS.USER_DATA}_${username}`;
    const userData = await SecureStore.getItemAsync(key);
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error('Error getting user data for user:', error);
    return null;
  }
};
