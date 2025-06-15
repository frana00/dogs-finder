import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../../utils/constants';
import { getCurrentLocation, formatCoordinates, coordinatesToAddress } from '../../utils/location';
import Input from '../common/Input';

const LocationPicker = ({ 
  onLocationSelect, 
  initialLocation = '',
  initialLatitude = null,
  initialLongitude = null,
  error,
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);
  const [manualLocation, setManualLocation] = useState(initialLocation);
  const [coordinates, setCoordinates] = useState({
    latitude: initialLatitude,
    longitude: initialLongitude
  });

  const handleGetCurrentLocation = async () => {
    if (disabled) return;
    
    setLoading(true);
    
    try {
      const location = await getCurrentLocation();
      
      if (location) {
        // Try to get address from coordinates
        try {
          const address = await coordinatesToAddress(location.latitude, location.longitude);
          const displayLocation = address || formatCoordinates(location.latitude, location.longitude);
          
          setCoordinates({
            latitude: location.latitude,
            longitude: location.longitude
          });
          
          setManualLocation(displayLocation);
          
          // Notificar al componente padre con la dirección convertida
          onLocationSelect?.({
            location: displayLocation,
            latitude: location.latitude,
            longitude: location.longitude,
            source: 'GPS'
          });
        } catch (addressError) {
          console.error('Error converting coordinates to address:', addressError);
          
          // Fallback to coordinates if address conversion fails
          const formattedCoords = formatCoordinates(location.latitude, location.longitude);
          
          setCoordinates({
            latitude: location.latitude,
            longitude: location.longitude
          });
          
          setManualLocation(formattedCoords);
          
          onLocationSelect?.({
            location: formattedCoords,
            latitude: location.latitude,
            longitude: location.longitude,
            source: 'GPS'
          });
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualLocationChange = (value) => {
    setManualLocation(value);
    
    // Si el usuario borra las coordenadas GPS, limpiar también las coordenadas
    const isGPSFormat = value.includes('📍');
    if (!isGPSFormat && coordinates.latitude) {
      setCoordinates({ latitude: null, longitude: null });
    }
    
    // Notificar al componente padre
    onLocationSelect?.({
      location: value,
      latitude: isGPSFormat ? coordinates.latitude : null,
      longitude: isGPSFormat ? coordinates.longitude : null,
      source: isGPSFormat ? 'GPS' : 'MANUAL'
    });
  };

  return (
    <View style={styles.container}>
      <Input
        label="Ubicación *"
        value={manualLocation}
        onChangeText={handleManualLocationChange}
        placeholder="Ej: Parque Central, Barrio Norte"
        error={error}
        editable={!disabled}
        multiline={false}
      />
      
      <TouchableOpacity 
        style={[
          styles.gpsButton,
          disabled && styles.gpsButtonDisabled,
          loading && styles.gpsButtonLoading
        ]}
        onPress={handleGetCurrentLocation}
        disabled={disabled || loading}
        activeOpacity={0.7}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.white} />
            <Text style={styles.gpsButtonText}>Obteniendo ubicación...</Text>
          </View>
        ) : (
          <Text style={[
            styles.gpsButtonText,
            disabled && styles.gpsButtonTextDisabled
          ]}>
            📍 Obtener mi ubicación actual
          </Text>
        )}
      </TouchableOpacity>
      
      {coordinates.latitude && (
        <View style={styles.coordinatesInfo}>
          <Text style={styles.coordinatesText}>
            ✅ Ubicación GPS detectada con precisión
          </Text>
        </View>
      )}
      
      <Text style={styles.helperText}>
        💡 Usa GPS para mayor precisión, o escribe la ubicación manualmente
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  gpsButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  gpsButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  gpsButtonLoading: {
    backgroundColor: COLORS.primary + 'CC', // Slightly transparent
  },
  gpsButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  gpsButtonTextDisabled: {
    color: COLORS.lightGray,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coordinatesInfo: {
    backgroundColor: COLORS.success + '20',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success,
  },
  coordinatesText: {
    color: COLORS.success,
    fontSize: 14,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 6,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default LocationPicker;
