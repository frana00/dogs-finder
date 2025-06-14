import { getApiBaseUrl } from './network';

// API Configuration
export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 10000,
};

// Date format for API
export const DATE_FORMAT = 'yyyy-MM-dd HH:mm:ss';

// Alert types
export const ALERT_TYPES = {
  LOST: 'LOST',
  SEEN: 'SEEN', // For found pets (backend expects SEEN)
  FOUND: 'SEEN', // Alias for SEEN to maintain backwards compatibility
};

// Alert status
export const ALERT_STATUS = {
  ACTIVE: 'ACTIVE',
  RESOLVED: 'RESOLVED',
};

// User roles
export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
};

// Pet sexes
export const PET_SEX = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  UNKNOWN: 'UNKNOWN',
};

// Pet sizes
export const PET_SIZE = {
  SMALL: 'SMALL',
  MEDIUM: 'MEDIUM',
  LARGE: 'LARGE',
};

// Colors for UI
export const COLORS = {
  primary: '#FF6B35',     // Orange for lost pets
  secondary: '#4CAF50',   // Green for found pets
  background: '#F5F5F5',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#9E9E9E',
  lightGray: '#E0E0E0',
  error: '#F44336',
  success: '#4CAF50',
  warning: '#FF9800',
  text: '#212121',
  textSecondary: '#757575',
};

// Storage keys
export const STORAGE_KEYS = {
  CREDENTIALS: 'user_credentials',
  USER_DATA: 'user_data',
};

// Validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_]{3,50}$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Sin conexión al servidor. Verifica:\n• Tu WiFi/datos móviles\n• Que tu dispositivo esté en la misma red\n• Usa los botones Debug en pantalla de login',
  SERVER_ERROR: 'Error del servidor. Intenta más tarde',
  UNAUTHORIZED: 'Usuario o contraseña incorrectos',
  VALIDATION_ERROR: 'Por favor, corrige los errores en el formulario',
  REQUIRED_FIELD: 'Este campo es requerido',
  INVALID_EMAIL: 'Ingresa un email válido',
  INVALID_USERNAME: 'El username debe tener 3-50 caracteres alfanuméricos',
  INVALID_PHONE: 'Ingresa un número de teléfono válido',
  PASSWORD_MIN_LENGTH: 'La contraseña debe tener al menos 6 caracteres',
  PASSWORDS_DONT_MATCH: 'Las contraseñas no coinciden',
};

// Success messages
export const SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: 'Usuario registrado exitosamente',
  PROFILE_UPDATED: 'Perfil actualizado correctamente',
  LOGOUT_SUCCESS: 'Sesión cerrada correctamente',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 0,
  DEFAULT_SIZE: 20,
};
