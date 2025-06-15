import { useState, useEffect, useRef } from 'react';
import { coordinatesToAddress } from '../utils/location';

/**
 * Hook para manejar geocodificación inversa con caché
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Object} { address, loading, error }
 */
export const useGeocoding = (latitude, longitude) => {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Cache para evitar llamadas repetidas
  const cache = useRef({});
  
  useEffect(() => {
    const geocodeCoordinates = async () => {
      if (!latitude || !longitude) {
        setAddress('');
        setLoading(false);
        setError(null);
        return;
      }

      // Crear clave de caché
      const cacheKey = `${latitude.toFixed(3)}_${longitude.toFixed(3)}`;
      
      // Verificar si ya tenemos esta dirección en caché
      if (cache.current[cacheKey]) {
        setAddress(cache.current[cacheKey]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const convertedAddress = await coordinatesToAddress(latitude, longitude);
        
        // Guardar en caché
        cache.current[cacheKey] = convertedAddress;
        
        setAddress(convertedAddress);
      } catch (err) {
        console.error('Geocoding error:', err);
        setError(err);
        setAddress(''); // Limpiar dirección en caso de error
      } finally {
        setLoading(false);
      }
    };

    geocodeCoordinates();
  }, [latitude, longitude]);

  return { address, loading, error };
};

/**
 * Hook para manejar múltiples geocodificaciones con caché compartido
 */
export const useGeocodingBatch = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const cache = useRef({});

  const geocodeCoordinates = async (id, latitude, longitude) => {
    if (!latitude || !longitude) {
      setResults(prev => ({ ...prev, [id]: '' }));
      setLoading(prev => ({ ...prev, [id]: false }));
      return;
    }

    const cacheKey = `${latitude.toFixed(3)}_${longitude.toFixed(3)}`;
    
    // Verificar caché
    if (cache.current[cacheKey]) {
      setResults(prev => ({ ...prev, [id]: cache.current[cacheKey] }));
      setLoading(prev => ({ ...prev, [id]: false }));
      return;
    }

    setLoading(prev => ({ ...prev, [id]: true }));

    try {
      const address = await coordinatesToAddress(latitude, longitude);
      cache.current[cacheKey] = address;
      setResults(prev => ({ ...prev, [id]: address }));
    } catch (error) {
      console.error(`Geocoding error for ${id}:`, error);
      setResults(prev => ({ ...prev, [id]: '' }));
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  return { results, loading, geocodeCoordinates };
};
