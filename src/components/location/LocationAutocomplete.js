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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);
  const [justSelected, setJustSelected] = useState(false); // Evitar mostrar sugerencias después de selección
  
  const searchTimeoutRef = useRef(null);
  const inputRef = useRef(null);

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
      setShowSuggestions(false);
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
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.error('Error searching places:', error);
      setError('Error al buscar lugares');
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlace = async (place) => {
    console.log('🟠 handleSelectPlace called with:', JSON.stringify(place)); // LOG
    setJustSelected(true);
    setShowSuggestions(false);
    setSuggestions([]);
    Keyboard.dismiss();

    try {
      if (place.placeId) {
        setLoading(true);
        const details = await getPlaceDetails(place.placeId);
        console.log('🟠 handleSelectPlace got details:', JSON.stringify(details)); // LOG
        
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
      setTimeout(() => setJustSelected(false), 50);
    }
  };

  const handleCurrentLocation = async () => {
    if (disabled) return;

    setLoading(true);
    try {
      const location = await getCurrentLocation();
      if (location) {
        // Aquí podrías convertir a dirección si quieres
        const coords = `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
        setQuery(`📍 ${coords}`);
        setShowSuggestions(false);

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
      setShowSuggestions(false);
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
        console.log('🟡 SUGGESTION PRESSED:', JSON.stringify(item)); // LOG
        handleSelectPlace(item);
      }}
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
              showSuggestions && styles.textInputWithSuggestions,
            ]}
            value={query}
            onChangeText={handleTextChange}
            placeholder={placeholder}
            placeholderTextColor={COLORS.gray}
            editable={!disabled}
            onFocus={() => {
              // Solo mostrar sugerencias si tenemos resultados y no acabamos de seleccionar
              if (suggestions.length > 0 && !justSelected) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              // Dar tiempo para que se procese la selección si el usuario hizo tap en una sugerencia
              setTimeout(() => {
                setShowSuggestions(false);
              }, 200);
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
        {showSuggestions && suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={(item, index) => item.placeId || item.title || index.toString()}
            renderItem={({ item, index }) => renderSuggestion(item, index)}
            style={[styles.suggestionsContainer, { zIndex: 9999, position: 'absolute', top: '100%', left: 0, right: 78 }]}
            pointerEvents="auto"
            keyboardShouldPersistTaps="always"
          />
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5, // Para Android
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
