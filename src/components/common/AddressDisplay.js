import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useGeocoding } from '../../hooks/useGeocoding';
import { COLORS } from '../../utils/constants';

/**
 * Componente que muestra una dirección convertida desde coordenadas
 * @param {Object} props
 * @param {number} props.latitude 
 * @param {number} props.longitude 
 * @param {Object} props.style - Estilos adicionales
 * @param {Object} props.textStyle - Estilos del texto
 * @param {boolean} props.showLoading - Si mostrar indicador de carga
 * @param {string} props.fallback - Texto a mostrar si no hay coordenadas
 */
const AddressDisplay = ({ 
  latitude, 
  longitude, 
  style, 
  textStyle, 
  showLoading = true,
  fallback = 'Sin ubicación'
}) => {
  const { address, loading, error } = useGeocoding(latitude, longitude);

  // Si no hay coordenadas, mostrar fallback
  if (!latitude || !longitude) {
    return (
      <View style={[styles.container, style]}>
        <Text style={[styles.text, styles.fallback, textStyle]}>
          {fallback}
        </Text>
      </View>
    );
  }

  // Mostrar loading si está habilitado
  if (loading && showLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={[styles.text, styles.loading, textStyle]}>
          Obteniendo dirección...
        </Text>
      </View>
    );
  }

  // Mostrar error si ocurrió
  if (error) {
    return (
      <View style={[styles.container, style]}>
        <Text style={[styles.text, styles.error, textStyle]}>
          📍 {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </Text>
      </View>
    );
  }

  // Mostrar dirección convertida
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.text, textStyle]}>
        {address || `📍 ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  fallback: {
    fontStyle: 'italic',
    color: COLORS.gray,
  },
  loading: {
    marginLeft: 8,
    fontStyle: 'italic',
    color: COLORS.gray,
  },
  error: {
    color: COLORS.textSecondary,
  },
});

export default AddressDisplay;
