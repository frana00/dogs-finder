import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const EmptyState = ({ 
  icon = 'paw-outline',
  title = 'No hay datos',
  message = 'No se encontraron elementos.',
  actionText = null,
  onAction = null,
  style = {},
  iconColor = '#ccc',
  type = 'default' // 'default', 'lost', 'found'
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'lost':
        return {
          iconColor: '#FFB74D',
          actionColor: '#FF9800'
        };
      case 'found':
        return {
          iconColor: '#81C784',
          actionColor: '#4CAF50'
        };
      default:
        return {
          iconColor: iconColor,
          actionColor: '#FF9800'
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <View style={[styles.container, style]}>
      <Ionicons 
        name={icon} 
        size={80} 
        color={typeStyles.iconColor} 
        style={styles.icon} 
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionText && onAction && (
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: typeStyles.actionColor }]} 
          onPress={onAction}
        >
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Componentes específicos para diferentes tipos
const EmptyLostDogs = ({ onCreateAlert }) => (
  <EmptyState
    icon="search-outline"
    title="No hay perros perdidos"
    message="Afortunadamente, no hay reportes de perros perdidos en este momento."
    actionText="Reportar perro perdido"
    onAction={onCreateAlert}
    type="lost"
  />
);

const EmptyFoundDogs = ({ onCreateAlert }) => (
  <EmptyState
    icon="heart-outline"
    title="No hay perros encontrados"
    message="No hay reportes de perros encontrados en este momento."
    actionText="Reportar perro encontrado"
    onAction={onCreateAlert}
    type="found"
  />
);

const EmptySearch = ({ searchTerm }) => (
  <EmptyState
    icon="search-outline"
    title="Sin resultados"
    message={`No se encontraron resultados para "${searchTerm}".`}
    iconColor="#999"
  />
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    margin: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export { EmptyLostDogs, EmptyFoundDogs, EmptySearch };
export default EmptyState;
