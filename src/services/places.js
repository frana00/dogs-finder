import { GOOGLE_PLACES_CONFIG } from '../utils/constants';

/**
 * Servicio para manejar geocodificación y autocompletado de lugares
 * Usa exclusivamente Google Places API para obtener resultados consistentes y de alta calidad
 */

/**
 * Verifica que la API key esté configurada
 */
const validateApiKey = () => {
  if (!GOOGLE_PLACES_CONFIG.API_KEY) {
    console.warn('⚠️ Google Places API key not configured. Add EXPO_PUBLIC_GOOGLE_PLACES_API_KEY to your .env file');
    return false;
  }
  return true;
};

/**
 * Busca lugares basado en texto de entrada usando Google Places Autocomplete
 * @param {string} query - Texto de búsqueda
 * @param {Object} options - Opciones de búsqueda
 * @returns {Promise<Array>} Lista de lugares sugeridos
 */
export const searchPlaces = async (query, options = {}) => {
  if (!query || query.trim().length < 3) {
    return [];
  }

  const {
    limit = 5,
    countryCode = null, // No restringir país por defecto
    language = 'es',
    userLocation = null, // Para bias de ubicación
    types = null, // No restringir tipos, permitir todos
  } = options;

  // Verificar que la API key esté configurada
  if (!validateApiKey()) {
    throw new Error('Google Places API key not configured. Add EXPO_PUBLIC_GOOGLE_PLACES_API_KEY to your .env file');
  }

  try {
    console.log(`🔍 Searching places with Google Places API for: "${query}"`);
    
    const params = new URLSearchParams({
      input: query.trim(),
      key: GOOGLE_PLACES_CONFIG.API_KEY,
      language: language,
    });

    // Solo agregar country si se especifica explícitamente
    if (countryCode) {
      params.append('components', `country:${countryCode}`);
    }

    // Solo agregar types si se especifica explícitamente
    if (types) {
      params.append('types', types);
    }

    // Si tenemos ubicación del usuario, agregar bias de ubicación
    if (userLocation) {
      params.append('location', `${userLocation.latitude},${userLocation.longitude}`);
      params.append('radius', '50000'); // 50km radius
    }

    const url = `${GOOGLE_PLACES_CONFIG.BASE_URL}${GOOGLE_PLACES_CONFIG.AUTOCOMPLETE_ENDPOINT}?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      // Solo logear como warning para ZERO_RESULTS, no es un error grave
      if (data.status === 'ZERO_RESULTS') {
        console.log(`ℹ️ No results found for "${query}"`);
        return [];
      } else {
        console.warn('Google Places API error:', data.status, data.error_message);
        throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
      }
    }

    // Transformar resultados al formato esperado
    const places = data.predictions.slice(0, limit).map((prediction, index) => ({
      id: prediction.place_id,
      title: prediction.structured_formatting?.main_text || prediction.description,
      subtitle: prediction.structured_formatting?.secondary_text || '',
      description: prediction.description,
      placeId: prediction.place_id,
      types: prediction.types,
      // Nota: Las coordenadas se obtendrán con getPlaceDetails
      latitude: null,
      longitude: null,
      source: 'google_places',
    }));

    console.log(`✅ Found ${places.length} places with Google Places`);
    return places;

  } catch (error) {
    console.error('❌ Error searching places with Google Places API:', error);
    throw error;
  }
};

/**
 * Obtiene detalles completos de un lugar usando Google Places Details API
 * @param {string} placeId - ID del lugar de Google Places
 * @returns {Promise<Object>} Detalles del lugar con coordenadas
 */
export const getPlaceDetails = async (placeId) => {
  if (!validateApiKey()) {
    throw new Error('Google Places API key not configured');
  }

  try {
    console.log('🟢 getPlaceDetails called with placeId:', placeId); // LOG
    const params = new URLSearchParams({
      place_id: placeId,
      key: GOOGLE_PLACES_CONFIG.API_KEY,
      fields: 'geometry,formatted_address,name,address_components',
      language: 'es',
    });

    const url = `${GOOGLE_PLACES_CONFIG.BASE_URL}${GOOGLE_PLACES_CONFIG.DETAILS_ENDPOINT}?${params.toString()}`;
    console.log('🟢 getPlaceDetails fetch URL:', url); // LOG
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Places Details API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('🟢 getPlaceDetails response data:', JSON.stringify(data)); // LOG

    if (data.status !== 'OK') {
      throw new Error(`Google Places Details API error: ${data.status}`);
    }

    const place = data.result;
    
    return {
      id: placeId,
      title: place.name || place.formatted_address,
      subtitle: place.formatted_address,
      description: place.formatted_address,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      placeId: placeId,
      addressComponents: place.address_components,
    };

  } catch (error) {
    console.error('❌ Error getting place details:', error);
    throw error;
  }
};

/**
 * Busca lugares cerca de una ubicación específica usando Google Places
 * @param {number} latitude - Latitud de referencia
 * @param {number} longitude - Longitud de referencia
 * @param {string} query - Texto de búsqueda
 * @param {Object} options - Opciones de búsqueda
 * @returns {Promise<Array>} Lista de lugares cercanos
 */
export const searchNearbyPlaces = async (latitude, longitude, query, options = {}) => {
  return await searchPlaces(query, {
    ...options,
    userLocation: { latitude, longitude },
  });
};

/**
 * Obtiene la dirección formateada a partir de coordenadas (reverse geocoding)
 * @param {number} latitude - Latitud
 * @param {number} longitude - Longitud
 * @returns {Promise<string>} Dirección formateada
 */
export const reverseGeocode = async (latitude, longitude) => {
  // Verificar que la API key esté configurada
  if (!validateApiKey()) {
    throw new Error('Google Places API key not configured');
  }

  try {
    const params = new URLSearchParams({
      latlng: `${latitude},${longitude}`,
      key: GOOGLE_PLACES_CONFIG.API_KEY,
      language: 'es',
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Google Geocoding API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].formatted_address;
    } else {
      throw new Error(`Google Geocoding API error: ${data.status}`);
    }

  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    // Como fallback, retornar las coordenadas formateadas
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
};
