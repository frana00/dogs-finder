import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../utils/constants';
import { AlertsMap } from '../../components/maps';
import { getAlertsNearby } from '../../services/proximity';
import { getCurrentLocation } from '../../utils/location';

const MapScreen = ({ route, navigation }) => {
  const { initialAlerts = [], userLocation = null } = route.params || {};
  
  const [alerts, setAlerts] = useState(initialAlerts);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userPos, setUserPos] = useState(userLocation);

  useEffect(() => {
    if (!userPos) {
      getCurrentUserLocation();
    }
  }, []);

  const getCurrentUserLocation = async () => {
    try {
      const location = await getCurrentLocation();
      if (location) {
        setUserPos(location);
        // Auto-cargar alertas cercanas cuando obtenemos ubicación
        loadNearbyAlerts(location);
      }
    } catch (error) {
      console.error('Error getting user location:', error);
    }
  };

  const loadNearbyAlerts = async (location = userPos) => {
    if (!location) return;

    try {
      setLoading(true);
      const nearbyAlerts = await getAlertsNearby({
        lat: location.latitude,
        lng: location.longitude,
        radius: 10 // Default 10km
      });
      setAlerts(nearbyAlerts);
    } catch (error) {
      console.error('Error loading nearby alerts:', error);
      Alert.alert('Error', 'No se pudieron cargar las alertas del mapa');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerPress = (alert) => {
    setSelectedAlert(alert);
  };

  const navigateToAlertDetail = () => {
    if (selectedAlert) {
      setSelectedAlert(null);
      navigation.navigate('AlertDetail', { alertId: selectedAlert.id });
    }
  };

  const closeModal = () => {
    setSelectedAlert(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mapa de Alertas</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => loadNearbyAlerts()}
        >
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Mapa */}
      <AlertsMap
        alerts={alerts}
        userLocation={userPos}
        onMarkerPress={handleMarkerPress}
        showUserLocation={true}
        radius={10}
        style={styles.map}
      />

      {/* Modal de detalles de alerta */}
      <Modal
        visible={!!selectedAlert}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedAlert && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {selectedAlert.type === 'LOST' ? '🔍' : '👀'} {selectedAlert.title}
                  </Text>
                  <TouchableOpacity onPress={closeModal}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <Text style={styles.modalBreed}>
                    {selectedAlert.breed} • {selectedAlert.color}
                  </Text>
                  
                  {selectedAlert.location && (
                    <Text style={styles.modalLocation}>
                      📍 {selectedAlert.location}
                    </Text>
                  )}

                  {selectedAlert.distanceKm && (
                    <Text style={styles.modalDistance}>
                      📏 A {selectedAlert.distanceKm < 1 
                        ? `${Math.round(selectedAlert.distanceKm * 1000)}m` 
                        : `${selectedAlert.distanceKm.toFixed(1)}km`} de distancia
                    </Text>
                  )}

                  <Text style={styles.modalDescription} numberOfLines={3}>
                    {selectedAlert.description}
                  </Text>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.detailButton}
                    onPress={navigateToAlertDetail}
                  >
                    <Text style={styles.detailButtonText}>Ver detalles completos</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Estadísticas flotantes */}
      <View style={styles.stats}>
        <Text style={styles.statsText}>
          📍 {alerts.length} alerta{alerts.length !== 1 ? 's' : ''} en el mapa
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  refreshButton: {
    padding: 4,
  },
  refreshButtonText: {
    fontSize: 18,
  },
  map: {
    flex: 1,
  },
  stats: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  statsText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  closeButton: {
    fontSize: 20,
    color: COLORS.gray,
    paddingLeft: 16,
  },
  modalBody: {
    marginBottom: 20,
  },
  modalBreed: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  modalLocation: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  modalDistance: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  modalActions: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 16,
  },
  detailButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MapScreen;
