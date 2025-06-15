import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../../utils/constants';

const EmbeddedProximityFilter = ({ 
  onFilterNearby, 
  onShowAll, 
  loading = false, 
  isNearbyActive = false,
  nearbyCount = 0,
  currentRadius = 10,
  onRadiusChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState(currentRadius);

  const radiusOptions = [
    { value: 1, label: '1km' },
    { value: 5, label: '5km' },
    { value: 10, label: '10km' },
    { value: 20, label: '20km' },
  ];

  const handleRadiusSelect = (radius) => {
    setSelectedRadius(radius);
    if (onRadiusChange) {
      onRadiusChange(radius);
    }
  };

  const handleNearbyFilter = () => {
    onFilterNearby?.(selectedRadius);
    setIsExpanded(false);
  };

  const handleToggleExpanded = () => {
    if (isNearbyActive) {
      // Si está activo, al hacer clic lo desactivamos
      onShowAll?.();
    } else {
      // Si no está activo, expandimos para mostrar opciones
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header compacto */}
      <TouchableOpacity
        style={[
          styles.header,
          isNearbyActive && styles.headerActive,
          isExpanded && styles.headerExpanded
        ]}
        onPress={handleToggleExpanded}
        disabled={loading}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>📍</Text>
          <View style={styles.headerText}>
            <Text style={[
              styles.headerTitle,
              isNearbyActive && styles.headerTitleActive
            ]}>
              {isNearbyActive ? `${selectedRadius}km` : 'Cerca de ti'}
            </Text>
            {isNearbyActive && nearbyCount > 0 && (
              <Text style={styles.headerSubtitle}>
                {nearbyCount} encontradas
              </Text>
            )}
          </View>
        </View>
        
        {loading ? (
          <ActivityIndicator size="small" color={isNearbyActive ? COLORS.white : COLORS.primary} />
        ) : (
          <Text style={[
            styles.headerToggle,
            isNearbyActive && styles.headerToggleActive,
            isExpanded && styles.headerToggleExpanded
          ]}>
            {isNearbyActive ? '✕' : (isExpanded ? '▲' : '▼')}
          </Text>
        )}
      </TouchableOpacity>

      {/* Opciones expandibles */}
      {isExpanded && !isNearbyActive && (
        <View style={styles.expandedContent}>
          <Text style={styles.sectionTitle}>Selecciona el radio de búsqueda:</Text>
          
          {/* Selectores de radio */}
          <View style={styles.radiusSelector}>
            {radiusOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.radiusButton,
                  selectedRadius === option.value && styles.radiusButtonActive
                ]}
                onPress={() => handleRadiusSelect(option.value)}
              >
                <Text style={[
                  styles.radiusButtonText,
                  selectedRadius === option.value && styles.radiusButtonTextActive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Botón de aplicar */}
          <TouchableOpacity 
            style={[styles.applyButton, loading && styles.applyButtonDisabled]}
            onPress={handleNearbyFilter}
            disabled={loading}
          >
            <Text style={styles.applyButtonText}>
              📍 Buscar cerca de mí
            </Text>
            <Text style={styles.applyButtonSubtext}>
              Radio: {selectedRadius}km
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
  },
  headerActive: {
    backgroundColor: COLORS.primary,
  },
  headerExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerTitleActive: {
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 2,
  },
  headerToggle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  headerToggleActive: {
    color: COLORS.white,
  },
  headerToggleExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  expandedContent: {
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 12,
  },
  radiusSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  radiusButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
  },
  radiusButtonActive: {
    backgroundColor: COLORS.primary,
  },
  radiusButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  radiusButtonTextActive: {
    color: COLORS.white,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  applyButtonSubtext: {
    fontSize: 12,
    color: COLORS.white,
    marginTop: 2,
    opacity: 0.9,
  },
});

export default EmbeddedProximityFilter;
