import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { COLORS, LOCATION_SOURCE } from '../../utils/constants';
import { searchPlaces, searchNearbyPlaces, getPlaceDetails } from '../../services/places';
import { getCurrentLocation } from '../../utils/location';

const LocationAutocomplete = ({
  onLocationSelect,
  initialValue = '',
  placeholder = 'Escribe una ubicación...',
  disabled = false,
  style,
  countryCode = null, // null = búsqueda global, 'ar' = solo Argentina, etc.
  searchTypes = null, // null = todos los tipos, 'geocode' = solo direcciones, etc.
}) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false); // Prevenir múltiples selecciones
  const [justSelected, setJustSelected] = useState(false);
  
  const searchTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const blurTimeoutRef = useRef(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  // Obtener ubicación del usuario al montar el componente
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const location = await getCurrentLocation();
        if (location) {
          setUserLocation(location);
        }
      } catch (error) {
        console.log('Could not get user location for autocomplete:', error);
      }
    };

    getUserLocation();
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // No buscar si acabamos de seleccionar algo (solo por 200ms)
    if (justSelected) {
      return;
    }

    if (query.length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        searchForPlaces(query);
      }, 300); // 300ms debounce
    } else {
      setSuggestions([]);
      setDropdownVisible(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, userLocation, justSelected]);

  const searchForPlaces = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 3) return;

    setLoading(true);
    setError(null);

    try {
      let results;
      
      // Configurar opciones de búsqueda
      const searchOptions = {
        countryCode,
        types: searchTypes,
        limit: 5,
      };
      
      // Si tenemos ubicación del usuario, buscar cerca primero
      if (userLocation) {
        results = await searchNearbyPlaces(
          userLocation.latitude,
          userLocation.longitude,
          searchQuery,
          searchOptions
        );
      } else {
        results = await searchPlaces(searchQuery, searchOptions);
      }

      setSuggestions(results);
      setDropdownVisible(results.length > 0);
    } catch (error) {
      console.error('Error searching places:', error);
      setError('Error al buscar lugares');
      setSuggestions([]);
      setDropdownVisible(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlace = async (place) => {
    console.log('🟠 handleSelectPlace called with:', JSON.stringify(place));
    
    // Prevenir múltiples selecciones
    if (isSelecting) {
      console.log('🚫 Already selecting, ignoring duplicate call');
      return;
    }
    
    setIsSelecting(true);
    setJustSelected(true);
    setDropdownVisible(false); // Cerrar inmediatamente
    setSuggestions([]); // Limpiar sugerencias
    Keyboard.dismiss();

    // Limpiar timeout de blur si existe
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }

    try {
      if (place.placeId) {
        setLoading(true);
        const details = await getPlaceDetails(place.placeId);
        console.log('🟠 handleSelectPlace got details:', JSON.stringify(details)); 
        
        const locationData = {
          location: details.title,
          latitude: details.latitude,
          longitude: details.longitude,
          source: LOCATION_SOURCE.AUTO,
          placeData: details,
        };

        setQuery(locationData.location);
        console.log('🌍 LocationAutocomplete: Calling onLocationSelect with:', JSON.stringify(locationData));
        onLocationSelect?.(locationData);

      } else {
        console.warn('Selected place does not have a placeId:', place);
        const fallbackData = {
          location: place.title || query,
          latitude: place.latitude || null,
          longitude: place.longitude || null,
          source: LOCATION_SOURCE.AUTO,
          placeData: place,
        };
        setQuery(fallbackData.location);
        console.log('🌍 LocationAutocomplete: Calling onLocationSelect with fallbackData (no placeId):', JSON.stringify(fallbackData));
        onLocationSelect?.(fallbackData);
      }
    } catch (error) {
      console.error('Error processing place selection:', error);
      setError('Error al seleccionar el lugar');
      const errorFallbackData = {
        location: query,
        latitude: null,
        longitude: null,
        source: LOCATION_SOURCE.ERROR,
      };
      setQuery(query);
      console.log('🌍 LocationAutocomplete: Calling onLocationSelect with error fallback data:', JSON.stringify(errorFallbackData));
      onLocationSelect?.(errorFallbackData);
    } finally {
      setLoading(false);
      setIsSelecting(false);
      // Resetear justSelected después de más tiempo para evitar conflictos
      setTimeout(() => setJustSelected(false), 500);
    }
  };

  const handleCurrentLocation = async () => {
    if (disabled || isSelecting) return;

    setLoading(true);
    setDropdownVisible(false);
    try {
      const location = await getCurrentLocation();
      if (location) {
        // Aquí podrías convertir a dirección si quieres
        const coords = `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
        setQuery(`📍 ${coords}`);

        onLocationSelect?.({
          location: `📍 ${coords}`,
          latitude: location.latitude,
          longitude: location.longitude,
          source: 'GPS',
        });
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      setError('Error al obtener ubicación');
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (text) => {
    setJustSelected(false); // Permitir nuevas búsquedas cuando el usuario escribe
    setQuery(text);
    
    // Si el usuario borra todo o escribe algo diferente, notificar al padre
    if (text.length === 0) {
      setDropdownVisible(false);
      setSuggestions([]);
      onLocationSelect?.({
        location: '',
        latitude: null,
        longitude: null,
        source: 'MANUAL',
      });
    }
  };

  const renderSuggestion = (item, index) => (
    <TouchableOpacity
      key={item.placeId || item.title || index}
      style={[
        styles.suggestionItem,
        index === suggestions.length - 1 && styles.suggestionItemLast
      ]}
      onPress={() => {
        if (isSelecting) return; // Prevenir múltiples toques
        console.log('🟡 SUGGESTION PRESSED:', JSON.stringify(item));
        handleSelectPlace(item);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.suggestionSubtitle} numberOfLines={1}>
          {item.subtitle}
        </Text>
      </View>
      <View style={styles.suggestionIcon}>
        <Text style={styles.suggestionIconText}>📍</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Container principal con posición relativa para el dropdown */}
      <View style={styles.autocompleteContainer}>
        {/* Input principal */}
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={[
              styles.textInput,
              disabled && styles.textInputDisabled,
              dropdownVisible && styles.textInputWithSuggestions,
            ]}
            value={query}
            onChangeText={handleTextChange}
            placeholder={placeholder}
            placeholderTextColor={COLORS.gray}
            editable={!disabled}
            onFocus={() => {
              // Solo mostrar sugerencias si tenemos resultados y no acabamos de seleccionar
              if (suggestions.length > 0 && !justSelected && !isSelecting) {
                setDropdownVisible(true);
              }
            }}
            onBlur={() => {
              // Solo cerrar si no estamos en proceso de selección
              if (!isSelecting) {
                blurTimeoutRef.current = setTimeout(() => {
                  setDropdownVisible(false);
                }, 150); // Tiempo reducido pero suficiente
              }
            }}
          />
          
          {loading && (
            <ActivityIndicator
              size="small"
              color={COLORS.primary}
              style={styles.loadingIndicator}
            />
          )}
        </View>

        {/* Botón GPS */}
        <TouchableOpacity
          style={[
            styles.gpsButton,
            disabled && styles.gpsButtonDisabled,
          ]}
          onPress={handleCurrentLocation}
          disabled={disabled || loading}
        >
          <Text style={styles.gpsButtonText}>
            📍 GPS
          </Text>
        </TouchableOpacity>

        {/* Lista de sugerencias */}
        {dropdownVisible && suggestions.length > 0 && !isSelecting && (
          <>
            {/* Overlay invisible para cerrar el dropdown */}
            <TouchableOpacity
              style={styles.overlay}
              onPress={() => setDropdownVisible(false)}
              activeOpacity={1}
            />
            <View style={styles.suggestionsContainer}>
              {suggestions.map((item, index) => renderSuggestion(item, index))}
            </View>
          </>
        )}
      </View>

      {/* Mensaje de error */}
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {/* Texto de ayuda */}
      <Text style={styles.helperText}>
        💡 Escribe al menos 3 caracteres para ver sugerencias
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  autocompleteContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1500,
    backgroundColor: 'transparent',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: COLORS.white,
    marginRight: 8,
  },
  textInputDisabled: {
    backgroundColor: COLORS.lightGray,
    color: COLORS.gray,
  },
  textInputWithSuggestions: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  loadingIndicator: {
    position: 'absolute',
    right: 16,
  },
  gpsButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  gpsButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  gpsButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 78, // Espacio para el botón GPS (70px + 8px margin)
    zIndex: 2000,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8, // Aumentado para Android
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  suggestionItemLast: {
    borderBottomWidth: 0,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  suggestionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  suggestionIcon: {
    marginLeft: 8,
  },
  suggestionIconText: {
    fontSize: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default LocationAutocomplete;
