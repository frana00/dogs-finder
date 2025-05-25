// Constantes para el estado de las alertas
export const ALERT_STATUS = {
  ACTIVE: 'active',
  RESOLVED: 'resolved',
  CANCELLED: 'cancelled',
  PENDING: 'pending'
};

// Constantes para tipos de alertas
export const ALERT_TYPE = {
  LOST: 'lost',
  FOUND: 'found'
};

// Constantes para tipos de mascotas
export const PET_TYPE = {
  DOG: 'dog',
  CAT: 'cat',
  OTHER: 'other'
};

// Constantes para configuración de la app
export const APP_CONFIG = {
  DEFAULT_ZOOM: 15,
  MAX_PHOTO_SIZE: 1024 * 1024, // 1MB
  PHOTO_QUALITY: 0.8,
  DEFAULT_RADIUS: 5000 // 5km en metros
};

// Constantes para colores (si se usan en la app)
export const COLORS = {
  PRIMARY: '#2196F3',
  SECONDARY: '#FFC107',
  SUCCESS: '#4CAF50',
  ERROR: '#F44336',
  WARNING: '#FF9800',
  INFO: '#2196F3'
};

// Constantes para mensajes
export const MESSAGES = {
  NO_INTERNET: 'No hay conexión a internet. Trabajando en modo offline.',
  SYNC_SUCCESS: 'Datos sincronizados correctamente',
  SYNC_ERROR: 'Error al sincronizar datos',
  LOCATION_REQUIRED: 'Se requiere acceso a la ubicación para usar esta función'
};
