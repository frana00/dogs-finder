import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Dimensions,
  FlatList,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { COLORS, ALERT_TYPES } from '../../utils/constants';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import AlertCard from '../../components/alerts/AlertCard';

import EmbeddedProximityFilter from '../../components/filters/EmbeddedProximityFilter';
import { getCurrentLocation } from '../../utils/location';
import { getAlertsNearby } from '../../services/proximity';
import { getAlerts } from '../../services/alerts';

// Conditional import for FlatGrid to avoid NativeEventEmitter errors on web
let FlatGrid = null;
if (Platform.OS !== 'web') {
  try {
    const SuperGrid = require('react-native-super-grid');
    FlatGrid = SuperGrid.FlatGrid;
  } catch (error) {
    console.warn('FlatGrid not available:', error);
  }
}

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { 
    alerts, 
    loading, 
    error, 
    refreshing, 
    filters,
    pagination,
    alertCounts,
    refreshAlerts, 
    loadMoreAlerts, 
    filterByType, 
    clearFilters,
    getFilteredCount,
    getAlertsByType 
  } = useAlert();

  // State for proximity filter
  const [proximityFilter, setProximityFilter] = useState({
    enabled: false,
    radius: 5, // km
    location: null
  });
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [proximityLoading, setProximityLoading] = useState(false);
  useEffect(() => {
    console.log('🏠 HomeScreen: Refreshing alerts on mount');
    refreshAlerts();
  }, []);

  // Add focus listener to refresh alerts when returning to screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('🏠 HomeScreen: Screen focused, refreshing alerts');
      refreshAlerts();
    });

    return unsubscribe;
  }, [navigation, refreshAlerts]);

  const handleAlertPress = (alert) => {
    navigation.navigate('AlertDetail', { alertId: alert.id });
  };

  const handleCreateAlert = () => {
    navigation.navigate('CreateEditAlert');
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  const handleMapPress = () => {
    navigation.navigate('Map', { 
      initialAlerts: getDisplayAlerts(),
      userLocation: proximityFilter.location,
      proximityFilter: proximityFilter.enabled ? proximityFilter : null
    });
  };

  // Función para obtener las alertas a mostrar (filtradas por proximidad o todas)
  const getDisplayAlerts = () => {
    return proximityFilter.enabled ? filteredAlerts : (alerts || []);
  };

  const handleProximityFilterApply = async (radius) => {
    try {
      setProximityLoading(true);
      const location = await getCurrentLocation();
      if (location) {
        // Filtrar alertas por proximidad usando el servicio
        const nearbyAlerts = await getAlertsNearby({
          lat: location.latitude,
          lng: location.longitude,
          radius: radius,
          alerts: alerts || []
        });

        setProximityFilter({
          enabled: true,
          radius: radius,
          location: location
        });
        setFilteredAlerts(nearbyAlerts);
        
        Alert.alert(
          'Filtro aplicado',
          `Se encontraron ${nearbyAlerts.length} alertas dentro de ${radius}km de tu ubicación`
        );
      } else {
        Alert.alert(
          'Error',
          'No se pudo obtener tu ubicación para aplicar el filtro'
        );
      }
    } catch (error) {
      console.error('Error applying proximity filter:', error);
      Alert.alert('Error', 'No se pudo aplicar el filtro de proximidad');
    } finally {
      setProximityLoading(false);
    }
  };

  const handleProximityFilterClear = () => {
    setProximityFilter({
      enabled: false,
      radius: 5,
      location: null
    });
    setFilteredAlerts([]);
  };

  const renderFilterButton = (type, label, icon) => {
    const isActive = filters.type === type;
    // Use the new logic with alertCounts
    let count;
    if (!type) { // "Todos"
      count = getFilteredCount();
    } else if (isActive) { // Active filter button
      count = (alerts || []).length;
    } else { // Inactive filter button
      count = alertCounts[type] || 0;
    }
    
    return (
      <TouchableOpacity
        key={type || 'all'}
        style={[
          styles.filterButton,
          isActive && styles.filterButtonActive,
          isActive && { 
            backgroundColor: type === ALERT_TYPES.LOST ? COLORS.primary : COLORS.secondary 
          }
        ]}
        onPress={() => filterByType(type)}
      >
        <Text style={[
          styles.filterButtonIcon,
          isActive && styles.filterButtonIconActive
        ]}>
          {icon}
        </Text>
        <Text style={[
          styles.filterButtonText,
          isActive && styles.filterButtonTextActive
        ]}>
          {label}
        </Text>
        <Text style={[
          styles.filterButtonCount,
          isActive && styles.filterButtonCountActive
        ]}>
          {count}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeText}>
          <Text style={styles.welcomeTitle}>¡Hola, {user?.username}!</Text>
          <Text style={styles.welcomeSubtitle}>
            Ayuda a reunir mascotas con sus familias
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={handleProfilePress}
          accessibilityLabel="Ir a perfil"
          accessibilityRole="button"
        >
          <Text style={styles.profileButtonText}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {filters.type === ALERT_TYPES.LOST 
              ? (alerts || []).length 
              : alertCounts[ALERT_TYPES.LOST] || 0}
          </Text>
          <Text style={styles.statLabel}>Perdidos</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {filters.type === ALERT_TYPES.SEEN 
              ? (alerts || []).length 
              : alertCounts[ALERT_TYPES.SEEN] || 0}
          </Text>
          <Text style={styles.statLabel}>Encontrados</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {alertCounts.total || 0}
          </Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Filter Section */}
      <View style={styles.filterSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {renderFilterButton(null, 'Todos', '🔍')}
          {renderFilterButton(ALERT_TYPES.LOST, 'Perdidos')}
          {renderFilterButton(ALERT_TYPES.SEEN, 'Encontrados')}
        </ScrollView>
        
        {filters.type && (
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={clearFilters}
          >
            <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Map Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.mapButton}
          onPress={handleMapPress}
        >
          <Text style={styles.mapButtonIcon}>🗺️</Text>
          <Text style={styles.mapButtonText}>Ver en Mapa</Text>
        </TouchableOpacity>
      </View>

      {/* Embedded Proximity Filter */}
      <EmbeddedProximityFilter
        onFilterNearby={handleProximityFilterApply}
        onShowAll={handleProximityFilterClear}
        loading={proximityLoading}
        isNearbyActive={proximityFilter.enabled}
        nearbyCount={proximityFilter.enabled ? filteredAlerts.length : 0}
        currentRadius={proximityFilter.radius}
        onRadiusChange={(radius) => setProximityFilter(prev => ({ ...prev, radius }))}
      />
    </View>
  );

  const renderEmptyState = () => {
    if (filters.type) {
      return (
        <EmptyState
          icon="🔍"
          title="No hay alertas"
          message={`No se encontraron alertas de tipo "${filters.type === ALERT_TYPES.LOST ? 'Perdidos' : 'Encontrados'}"`}
          action={{
            text: 'Ver todas',
            onPress: clearFilters,
          }}
        />
      );
    }

    return (
      <EmptyState
        icon="🐾"
        title="No hay alertas aún"
        message="Sé el primero en crear una alerta para ayudar a las mascotas"
        action={{
          text: 'Crear alerta',
          onPress: handleCreateAlert,
        }}
      />
    );
  };

  const renderFooter = () => {
    if (!pagination.hasMore && (alerts || []).length > 0) {
      return (
        <View style={styles.footerMessage}>
          <Text style={styles.footerText}>
            No hay más alertas para mostrar
          </Text>
        </View>
      );
    }
    return null;
  };

  if (loading && (alerts || []).length === 0) {
    return <Loading message="Cargando alertas..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      {error ? (
        <ErrorMessage 
          message={error} 
          onRetry={() => refreshAlerts()}
        />
      ) : Platform.OS !== 'web' && FlatGrid ? (
        <FlatGrid
          itemDimension={150}
          data={getDisplayAlerts()}
          style={styles.gridList}
          spacing={16}
          renderItem={({ item }) => (
            <AlertCard alert={item} onPress={handleAlertPress} />
          )}
          onEndReached={() => {
            // Solo cargar más si no estamos filtrando por proximidad
            if (!proximityFilter.enabled) {
              loadMoreAlerts();
            }
          }}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshAlerts}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      ) : (
        // Web fallback using FlatList
        <FlatList
          data={getDisplayAlerts()}
          renderItem={({ item }) => (
            <View style={styles.webListItem}>
              <AlertCard alert={item} onPress={handleAlertPress} />
            </View>
          )}
          numColumns={Math.floor(width / 180)}
          key={Math.floor(width / 180)}
          onEndReached={() => {
            // Solo cargar más si no estamos filtrando por proximidad
            if (!proximityFilter.enabled) {
              loadMoreAlerts();
            }
          }}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshAlerts}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.webListContainer}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateAlert}
        activeOpacity={0.8}
        accessibilityLabel="Crear nueva alerta"
        accessibilityRole="button"
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  profileButtonText: {
    fontSize: 20,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.lightGray,
  },
  filterSection: {
    paddingBottom: 16,
  },
  filterContainer: {
    paddingHorizontal: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  filterButtonActive: {
    borderColor: COLORS.primary,
  },
  filterButtonIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  filterButtonIconActive: {
    // Active icon styling
  },
  filterButtonText: {
    fontSize: 14,
    color: COLORS.text,
    marginRight: 6,
  },
  filterButtonTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  filterButtonCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.white,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    textAlign: 'center',
  },
  filterButtonCountActive: {
    color: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  clearFiltersButton: {
    alignSelf: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  clearFiltersText: {
    fontSize: 14,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  actionsSection: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  mapButtonIcon: {
    fontSize: 16,
  },
  mapButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
  gridList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  // Web-specific styles
  webListContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  webListItem: {
    flex: 1,
    margin: 8,
    maxWidth: 180,
  },
  footerMessage: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
