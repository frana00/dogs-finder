import * as Location from 'expo-location';
import { Alert } from 'react-native';

/**
 * Solicita permisos de ubicación al usuario
 * @returns {Promise<boolean>} true si se otorgaron permisos
 */
export const requestLocationPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

/**
 * Obtiene la ubicación actual del usuario
 * @returns {Promise<Object|null>} Objeto con lat/lng o null si falla
 */
export const getCurrentLocation = async () => {
  try {
    // Verificar si ya tenemos permisos
    const { status } = await Location.getForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permisos requeridos',
          'Para obtener tu ubicación automáticamente, necesitamos acceso a tu GPS. Puedes ingresar la ubicación manualmente si prefieres.',
          [{ text: 'OK' }]
        );
        return null;
      }
    }

    // Obtener ubicación actual
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced, // Balance entre precisión y velocidad
      timeout: 10000, // 10 segundos máximo
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    
    let errorMessage = 'No se pudo obtener tu ubicación.';
    if (error.code === 'E_LOCATION_TIMEOUT') {
      errorMessage = 'Tiempo de espera agotado. Intenta moverte a un área con mejor señal GPS.';
    } else if (error.code === 'E_LOCATION_UNAVAILABLE') {
      errorMessage = 'GPS no disponible. Verifica que tengas la ubicación activada.';
    }
    
    Alert.alert('Error de ubicación', errorMessage);
    return null;
  }
};

/**
 * Formatea coordenadas para mostrar al usuario de manera amigable
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {string} Coordenadas formateadas
 */
export const formatCoordinates = (latitude, longitude) => {
  if (!latitude || !longitude) return '';
  
  return `📍 ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
};

/**
 * Convierte coordenadas a una dirección legible usando geocodificación inversa
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<string>} Dirección formateada o coordenadas como fallback
 */
export const coordinatesToAddress = async (latitude, longitude) => {
  if (!latitude || !longitude || !isValidCoordinates(latitude, longitude)) {
    return '';
  }

  try {
    console.log(`🗺️ Converting coordinates to address: ${latitude}, ${longitude}`);
    
    const result = await Location.reverseGeocodeAsync({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    });

    if (result && result.length > 0) {
      const address = result[0];
      console.log('🏠 Geocoding result:', address);
      
      // Construir dirección legible
      let formattedAddress = '';
      
      // Agregar calle y número si están disponibles
      if (address.name || address.street) {
        formattedAddress += address.name || address.street;
      }
      
      // Agregar número de calle si está disponible y no está ya incluido
      if (address.streetNumber && formattedAddress && !formattedAddress.includes(address.streetNumber)) {
        formattedAddress += ` ${address.streetNumber}`;
      }
      
      // Agregar distrito/barrio si está disponible
      if (address.district && !formattedAddress.includes(address.district)) {
        formattedAddress += formattedAddress ? `, ${address.district}` : address.district;
      }
      
      // Agregar ciudad si está disponible
      if (address.city && !formattedAddress.includes(address.city)) {
        formattedAddress += formattedAddress ? `, ${address.city}` : address.city;
      }
      
      // Agregar región/estado si está disponible
      if (address.region && !formattedAddress.includes(address.region)) {
        formattedAddress += formattedAddress ? `, ${address.region}` : address.region;
      }
      
      // Si no tenemos información detallada, usar lo que esté disponible
      if (!formattedAddress) {
        if (address.formattedAddress) {
          formattedAddress = address.formattedAddress;
        } else if (address.city || address.region) {
          formattedAddress = [address.city, address.region].filter(Boolean).join(', ');
        }
      }
      
      // Limpiar dirección y asegurar que no esté vacía
      formattedAddress = formattedAddress.trim();
      
      if (formattedAddress) {
        console.log(`✅ Address converted: ${formattedAddress}`);
        return `📍 ${formattedAddress}`;
      }
    }
    
    console.log('⚠️ No address found, using coordinates as fallback');
    return formatCoordinates(latitude, longitude);
    
  } catch (error) {
    console.error('Error converting coordinates to address:', error);
    // Fallback a las coordenadas formateadas si la geocodificación falla
    return formatCoordinates(latitude, longitude);
  }
};

/**
 * Convierte coordenadas a dirección con caché para evitar llamadas repetidas
 * @param {number} latitude 
 * @param {number} longitude 
 * @param {Object} cache - Objeto de caché (opcional)
 * @returns {Promise<string>} Dirección formateada
 */
export const coordinatesToAddressWithCache = async (latitude, longitude, cache = null) => {
  if (!latitude || !longitude) return '';
  
  // Crear clave de caché basada en coordenadas redondeadas (para agrupar ubicaciones cercanas)
  const cacheKey = `${latitude.toFixed(3)}_${longitude.toFixed(3)}`;
  
  // Verificar caché si se proporciona
  if (cache && cache[cacheKey]) {
    console.log(`💾 Using cached address for ${cacheKey}`);
    return cache[cacheKey];
  }
  
  // Obtener dirección
  const address = await coordinatesToAddress(latitude, longitude);
  
  // Guardar en caché si se proporciona
  if (cache) {
    cache[cacheKey] = address;
  }
  
  return address;
};

/**
 * Valida que las coordenadas sean válidas
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {boolean}
 */
export const isValidCoordinates = (latitude, longitude) => {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 && latitude <= 90 &&
    longitude >= -180 && longitude <= 180 &&
    !isNaN(latitude) && !isNaN(longitude)
  );
};

/**
 * Calcula la distancia entre dos puntos usando la fórmula Haversine
 * @param {number} lat1 
 * @param {number} lng1 
 * @param {number} lat2 
 * @param {number} lng2 
 * @returns {number} Distancia en kilómetros
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  if (!isValidCoordinates(lat1, lng1) || !isValidCoordinates(lat2, lng2)) {
    return null;
  }

  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Redondear a 2 decimales
};

/**
 * Formatea la distancia para mostrar al usuario
 * @param {number} distanceKm Distancia en kilómetros
 * @returns {string} Distancia formateada
 */
export const formatDistance = (distanceKm) => {
  if (distanceKm === null || distanceKm === undefined) return '';
  
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  } else if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km`;
  } else {
    return `${Math.round(distanceKm)}km`;
  }
};
