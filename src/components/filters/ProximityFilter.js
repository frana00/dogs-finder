/**
 * ProximityFilter - Componente para filtrar alertas de mascotas por proximidad geográfica
 * 
 * Este componente permite al usuario seleccionar un radio de búsqueda (1km, 5km, 10km, 20km)
 * y filtrar las alertas de mascotas basadas en la cercanía a la ubicación actual del usuario.
 * Muestra tanto opciones de radio como botones para activar/desactivar el filtro.
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../../utils/constants';

/**
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onFilterNearby - Función callback cuando se activa el filtro de proximidad
 * @param {Function} props.onShowAll - Función callback para mostrar todas las alertas (desactivar filtro)
 * @param {boolean} props.loading - Indica si se está cargando la información de proximidad
 * @param {boolean} props.isNearbyActive - Indica si el filtro de proximidad está activo
 * @param {number} props.nearbyCount - Número de alertas encontradas en el radio seleccionado
 */
const ProximityFilter = ({ 
  onFilterNearby, 
  onShowAll, 
  loading = false, 
  isNearbyActive = false,
  nearbyCount = 0
}) => {
  // Estado para almacenar el radio seleccionado (en kilómetros)
  const [selectedRadius, setSelectedRadius] = useState(10);

  // Opciones de radio disponibles para el usuario
  const radiusOptions = [
    { value: 1, label: '1km' },
    { value: 5, label: '5km' },
    { value: 10, label: '10km' },
    { value: 20, label: '20km' },
  ];

  // Manejador para activar el filtro con el radio seleccionado
  const handleNearbyFilter = () => {
    onFilterNearby?.(selectedRadius);
  };

  return (
    <View style={styles.container}>
      {/* Encabezado con título y contador de resultados */}
      <View style={styles.header}>
        <Text style={styles.title}>📍 Filtrar por proximidad</Text>
        {isNearbyActive && nearbyCount > 0 && (
          <Text style={styles.count}>{nearbyCount} cercanas</Text>
        )}
      </View>

      {/* Selectores de radio */}
      <View style={styles.radiusSelector}>
        {radiusOptions.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.radiusButton,
              selectedRadius === option.value && styles.radiusButtonActive
            ]}
            onPress={() => setSelectedRadius(option.value)}
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

      {/* Botones de acción */}
      <View style={styles.actions}>
        {/* Botón para activar filtro por proximidad con indicador de carga */}
        <TouchableOpacity 
          style={[styles.actionButton, styles.nearbyButton, loading && styles.actionButtonDisabled]}
          onPress={handleNearbyFilter}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.actionButtonText}>📍 Buscar cerca de mí</Text>
              <Text style={styles.actionButtonSubtext}>Radio: {selectedRadius}km</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Botón para mostrar todas las alertas (solo visible cuando el filtro está activo) */}
        {isNearbyActive && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.allButton]}
            onPress={onShowAll}
          >
            <Text style={[styles.actionButtonText, { color: COLORS.primary }]}>
              🌍 Ver todas las alertas
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Caja informativa que muestra el radio actual (solo visible cuando el filtro está activo) */}
      {isNearbyActive && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ℹ️ Mostrando alertas en un radio de {selectedRadius}km desde tu ubicación
          </Text>
        </View>
      )}
    </View>
  );
};

// Estilos del componente organizados por secciones
const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
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
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  count: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  // Contenedor de los botones de selección de radio
  radiusSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  // Estilos para los botones de selección de radio normal y activo
  radiusButton: {
    flex: 1, // Distribuye el espacio equitativamente
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
  // Contenedor de botones de acción
  actions: {
    gap: 8,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  nearbyButton: {
    backgroundColor: COLORS.primary,
  },
  allButton: {
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  actionButtonSubtext: {
    fontSize: 12,
    color: COLORS.white,
    marginTop: 2,
    opacity: 0.9,
  },
  // Caja informativa sobre el filtro activo
  infoBox: {
    marginTop: 12,
    padding: 8,
    backgroundColor: COLORS.primary + '10', // Color primario con 10% de opacidad
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.primary,
    fontStyle: 'italic',
  },
});

export default ProximityFilter;
