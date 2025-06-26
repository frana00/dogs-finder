import { Platform } from 'react-native';

// Default fallback configuration
const DEFAULT_CONFIG = {
  DEV_IP: '192.168.1.100', // Default placeholder IP
  API_PORT: 8080,
  OVERRIDE_IP: null,
  PRODUCTION_URL: 'https://your-production-server.com'
};

// Try to import network config with fallback
let NETWORK_CONFIG = DEFAULT_CONFIG;
try {
  const configModule = require('./network.config.js');
  if (configModule && configModule.NETWORK_CONFIG) {
    NETWORK_CONFIG = { ...DEFAULT_CONFIG, ...configModule.NETWORK_CONFIG };
  }
} catch (error) {
  console.warn('network.config.js not found, using default config');
}

/**
 * Network utilities for development
 */

/**
 * Gets the development server URL dynamically
 * Uses configuration from network.config.js (which is gitignored)
 */
export const getDevelopmentApiUrl = () => {
  // Use override IP if specified
  if (NETWORK_CONFIG.OVERRIDE_IP) {
    return `http://${NETWORK_CONFIG.OVERRIDE_IP}:${NETWORK_CONFIG.API_PORT}`;
  }

  // Use configured development IP
  return `http://${NETWORK_CONFIG.DEV_IP}:${NETWORK_CONFIG.API_PORT}`;
};

/**
 * Gets the production API URL
 */
export const getProductionApiUrl = () => {
  return NETWORK_CONFIG.PRODUCTION_URL;
};

/**
 * Checks if we're in development mode
 */
export const isDevelopment = () => {
  return __DEV__;
};

/**
 * Gets the appropriate API base URL based on environment
 */
export const getApiBaseUrl = () => {
  // Priorizar variables de entorno
  const envApiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envApiUrl) {
    return envApiUrl;
  }
  
  // Fallback al sistema anterior
  return isDevelopment() ? getDevelopmentApiUrl() : getProductionApiUrl();
};

/**
 * Gets network debug information
 */
export const getNetworkDebugInfo = () => {
  return {
    isDevelopment: isDevelopment(),
    platform: Platform.OS,
    config: NETWORK_CONFIG,
    developmentUrl: getDevelopmentApiUrl(),
    productionUrl: getProductionApiUrl(),
    selectedUrl: getApiBaseUrl()
  };
};
