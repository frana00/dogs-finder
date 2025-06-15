import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { COLORS, ALERT_TYPES } from '../../utils/constants';
import { getCurrentLocation } from '../../utils/location';
import { getAlertsNearby, formatDistanceText } from '../../services/proximity';

// Conditional import for maps to avoid errors in different environments
let MapView = null;
let Marker = null;
let PROVIDER_GOOGLE = null;

try {
  if (Platform.OS !== 'web') {
    // Primero intentamos react-native-maps (compatible con Expo Go)
    try {
      const Maps = require('react-native-maps');
      MapView = Maps.default;
      Marker = Maps.Marker;
      PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
      console.log('📍 Using react-native-maps (Expo Go compatible)');
    } catch (rnMapsError) {
      // Si react-native-maps no está disponible, intentamos expo-maps
      try {
        const ExpoMaps = require('expo-maps');
        MapView = ExpoMaps.MapView;
        Marker = ExpoMaps.Marker;
        PROVIDER_GOOGLE = ExpoMaps.PROVIDER_GOOGLE;
        console.log('📍 Using expo-maps (EAS Build)');
      } catch (expoMapsError) {
        console.warn('📍 No maps library available:', expoMapsError.message);
      }
    }
  }
} catch (error) {
  console.warn('📍 Maps not available:', error.message);
}

const AlertsMap = ({ 
  alerts = [], 
  userLocation = null, 
  onMarkerPress = null,
  showUserLocation = true,
  radius = 10,
  style = {}
}) => {
  const [mapRegion, setMapRegion] = useState(null);
  const [nearbyAlerts, setNearbyAlerts] = useState(alerts);
  const [loading, setLoading] = useState(false);
  const [userPos, setUserPos] = useState(userLocation);

  // Configurar región inicial del mapa
  useEffect(() => {
    if (userPos) {
      setMapRegion({
        latitude: userPos.latitude,
        longitude: userPos.longitude,
        latitudeDelta: 0.05, // Zoom level
        longitudeDelta: 0.05,
      });
    } else if (nearbyAlerts.length > 0) {
      // Si no hay ubicación del usuario, centrar en las alertas
      const firstAlert = nearbyAlerts.find(alert => alert.latitude && alert.longitude);
      if (firstAlert) {
        setMapRegion({
          latitude: firstAlert.latitude,
          longitude: firstAlert.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        });
      }
    }
  }, [userPos, nearbyAlerts]);

  // Obtener ubicación actual si no se proporciona
  useEffect(() => {
    if (!userPos && showUserLocation) {
      getCurrentUserLocation();
    }
  }, []);

  const getCurrentUserLocation = async () => {
    try {
      setLoading(true);
      const location = await getCurrentLocation();
      if (location) {
        setUserPos(location);
      }
    } catch (error) {
      console.error('Error getting user location:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyAlerts = async () => {
    if (!userPos) {
      Alert.alert('Ubicación requerida', 'Necesitamos tu ubicación para buscar alertas cercanas');
      return;
    }

    try {
      setLoading(true);
      const alerts = await getAlertsNearby({
        lat: userPos.latitude,
        lng: userPos.longitude,
        radius: radius
      });
      setNearbyAlerts(alerts);
    } catch (error) {
      console.error('Error loading nearby alerts:', error);
      Alert.alert('Error', 'No se pudieron cargar las alertas cercanas');
    } finally {
      setLoading(false);
    }
  };

  const getMarkerColor = (alertType) => {
    switch (alertType) {
      case ALERT_TYPES.LOST:
        return '#FF6B6B'; // Rojo para perdidos
      case ALERT_TYPES.SEEN:
        return '#4ECDC4'; // Verde para encontrados
      default:
        return '#FFE66D'; // Amarillo para otros
    }
  };

  const getMarkerTitle = (alert) => {
    const type = alert.type === ALERT_TYPES.LOST ? '🔍 PERDIDO' : '👀 ENCONTRADO';
    return `${type}: ${alert.title || alert.breed}`;
  };

  const getMarkerDescription = (alert) => {
    let description = `${alert.breed} • ${alert.color}`;
    if (alert.distanceKm) {
      description += ` • ${formatDistanceText(alert.distanceKm)}`;
    }
    return description;
  };

  // Fallback para cuando los mapas no están disponibles
  if (!MapView) {
    return (
      <View style={[styles.fallbackContainer, style]}>
        <View style={styles.fallbackContent}>
          <Text style={styles.fallbackIcon}>🗺️</Text>
          <Text style={styles.fallbackTitle}>Mapa no disponible</Text>
          <Text style={styles.fallbackText}>
            {Platform.OS === 'web' 
              ? 'Los mapas no están disponibles en la versión web'
              : 'Error al cargar el componente de mapas'
            }
          </Text>
          
          {/* Lista de alertas como fallback */}
          {nearbyAlerts.length > 0 && (
            <View style={styles.alertsList}>
              <Text style={styles.alertsListTitle}>Alertas cercanas:</Text>
              {nearbyAlerts.slice(0, 3).map((alert, index) => (
                <TouchableOpacity
                  key={alert.id || index}
                  style={styles.alertItem}
                  onPress={() => onMarkerPress?.(alert)}
                >
                  <Text style={styles.alertEmoji}>
                    {alert.type === ALERT_TYPES.LOST ? '😢' : '😊'}
                  </Text>
                  <View style={styles.alertInfo}>
                    <Text style={styles.alertName}>
                      {alert.title || alert.breed || 'Mascota'}
                    </Text>
                    {alert.distanceKm && (
                      <Text style={styles.alertDistance}>
                        {formatDistanceText(alert.distanceKm)}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {showUserLocation && !userPos && (
            <TouchableOpacity
              style={styles.locationButton}
              onPress={getCurrentUserLocation}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.locationButtonText}>📍 Obtener ubicación</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  if (!mapRegion) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando mapa...</Text>
        {!userPos && (
          <TouchableOpacity style={styles.locationButton} onPress={getCurrentUserLocation}>
            <Text style={styles.locationButtonText}>📍 Obtener mi ubicación</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={mapRegion}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={true}
        onRegionChangeComplete={setMapRegion}
      >
        {/* Marcadores de alertas */}
        {nearbyAlerts
          .filter(alert => alert.latitude && alert.longitude)
          .map((alert) => (
            <Marker
              key={alert.id}
              coordinate={{
                latitude: alert.latitude,
                longitude: alert.longitude,
              }}
              pinColor={getMarkerColor(alert.type)}
              title={getMarkerTitle(alert)}
              description={getMarkerDescription(alert)}
              onPress={() => onMarkerPress?.(alert)}
            />
          ))
        }

        {/* Marcador de usuario (si se proporciona ubicación específica) */}
        {userPos && !showUserLocation && (
          <Marker
            coordinate={{
              latitude: userPos.latitude,
              longitude: userPos.longitude,
            }}
            pinColor="#2196F3"
            title="Tu ubicación"
            description="Ubicación actual"
          />
        )}
      </MapView>

      {/* Controles superpuestos */}
      <View style={styles.controls}>
        {userPos && (
          <TouchableOpacity 
            style={[styles.controlButton, loading && styles.controlButtonDisabled]} 
            onPress={loadNearbyAlerts}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.controlButtonText}>🔍 Buscar cercanas</Text>
            )}
          </TouchableOpacity>
        )}
        
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF6B6B' }]} />
            <Text style={styles.legendText}>Perdidos</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#4ECDC4' }]} />
            <Text style={styles.legendText}>Encontrados</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  locationButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  locationButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  map: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    top: 10,
    right: 10,
    gap: 10,
  },
  controlButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  controlButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  controlButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  legend: {
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.text,
  },
  // Fallback styles
  fallbackContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fallbackContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  fallbackIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  fallbackTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  fallbackText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  alertsList: {
    width: '100%',
    marginTop: 20,
  },
  alertsListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  alertEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  alertInfo: {
    flex: 1,
  },
  alertName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  alertDistance: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

export default AlertsMap;
