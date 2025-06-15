/**
 * Servicio para búsqueda de alertas por proximidad geográfica
 */
import apiClient from './api';

/**
 * Busca alertas cercanas a una ubicación específica
 * @param {Object} params - Parámetros de búsqueda
 * @param {number} params.lat - Latitud del punto de búsqueda
 * @param {number} params.lng - Longitud del punto de búsqueda
 * @param {number} params.radius - Radio de búsqueda en kilómetros (default: 10)
 * @param {string} params.type - Tipo de alerta: 'LOST' | 'SEEN' (opcional)
 * @returns {Promise<Array>} - Array de alertas ordenadas por distancia
 */
export const getAlertsNearby = async ({ lat, lng, radius = 10, type = null }) => {
  try {
    console.log('🔍 Searching alerts nearby:', { lat, lng, radius, type });
    
    const params = {
      lat,
      lng,
      radius,
    };
    
    // Solo agregar type si se especifica
    if (type && (type === 'LOST' || type === 'SEEN')) {
      params.type = type;
    }
    
    const response = await apiClient.get('/alerts/nearby', { params });
    
    console.log('📍 Found nearby alerts:', {
      count: response.data ? response.data.length : 0,
      alerts: response.data
    });
    
    return response.data || [];
  } catch (error) {
    console.error('❌ Error searching nearby alerts:', error);
    
    // Si el endpoint no existe aún, devolver array vacío
    if (error.response?.status === 404) {
      console.warn('⚠️ /alerts/nearby endpoint not implemented yet');
      return [];
    }
    
    throw new Error(error.response?.data?.message || 'Error al buscar alertas cercanas');
  }
};

/**
 * Calcula la distancia entre la ubicación del usuario y una alerta
 * @param {number} userLat - Latitud del usuario
 * @param {number} userLng - Longitud del usuario  
 * @param {Object} alert - Objeto alert con latitude/longitude
 * @returns {number|null} - Distancia en km o null si no hay coordenadas
 */
export const calculateDistanceToAlert = (userLat, userLng, alert) => {
  if (!alert.latitude || !alert.longitude || !userLat || !userLng) {
    return null;
  }
  
  const R = 6371; // Radio de la Tierra en km
  const dLat = (alert.latitude - userLat) * Math.PI / 180;
  const dLng = (alert.longitude - userLng) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(userLat * Math.PI / 180) * Math.cos(alert.latitude * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Redondear a 2 decimales
};

/**
 * Formatea la distancia para mostrar al usuario
 * @param {number} distanceKm - Distancia en kilómetros
 * @returns {string} - Distancia formateada
 */
export const formatDistanceText = (distanceKm) => {
  if (distanceKm === null || distanceKm === undefined) return '';
  
  if (distanceKm < 1) {
    return `a ${Math.round(distanceKm * 1000)}m`;
  } else if (distanceKm < 10) {
    return `a ${distanceKm.toFixed(1)}km`;
  } else {
    return `a ${Math.round(distanceKm)}km`;
  }
};

/**
 * Obtiene alertas cerca de la ubicación actual del usuario
 * @param {number} radius - Radio de búsqueda en km
 * @param {string} type - Tipo de alerta (opcional)
 * @returns {Promise<Array>} - Alertas cercanas con distancia calculada
 */
export const getAlertsNearMe = async (radius = 10, type = null) => {
  try {
    // Obtener ubicación actual del usuario
    const { getCurrentLocation } = await import('../utils/location');
    const userLocation = await getCurrentLocation();
    
    if (!userLocation) {
      throw new Error('No se pudo obtener tu ubicación actual');
    }
    
    // Buscar alertas cercanas
    const nearbyAlerts = await getAlertsNearby({
      lat: userLocation.latitude,
      lng: userLocation.longitude,
      radius,
      type
    });
    
    // Agregar distancia calculada a cada alerta
    const alertsWithDistance = nearbyAlerts.map(alert => ({
      ...alert,
      distanceKm: calculateDistanceToAlert(
        userLocation.latitude, 
        userLocation.longitude, 
        alert
      )
    }));
    
    return alertsWithDistance;
  } catch (error) {
    console.error('❌ Error getting alerts near me:', error);
    throw error;
  }
};
