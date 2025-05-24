import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const ErrorHandler = ({ 
  error, 
  onRetry, 
  showRetry = true, 
  message = null,
  style = {} 
}) => {
  const getErrorMessage = () => {
    if (message) return message;
    
    if (typeof error === 'string') return error;
    
    if (error?.message) {
      // Personalizar mensajes de error comunes
      if (error.message.includes('Network Error') || error.message.includes('fetch')) {
        return 'Error de conexión. Verifica tu conexión a internet.';
      }
      if (error.message.includes('timeout')) {
        return 'La conexión tardó demasiado. Inténtalo de nuevo.';
      }
      if (error.message.includes('401')) {
        return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      }
      if (error.message.includes('403')) {
        return 'No tienes permisos para realizar esta acción.';
      }
      if (error.message.includes('404')) {
        return 'El recurso solicitado no fue encontrado.';
      }
      if (error.message.includes('500')) {
        return 'Error del servidor. Inténtalo más tarde.';
      }
      return error.message;
    }
    
    return 'Ha ocurrido un error inesperado.';
  };

  return (
    <View style={[styles.container, style]}>
      <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" style={styles.icon} />
      <Text style={styles.errorText}>{getErrorMessage()}</Text>
      {showRetry && onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Ionicons name="refresh-outline" size={20} color="#fff" style={styles.retryIcon} />
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    margin: 20,
  },
  icon: {
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#FF9800',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  retryIcon: {
    marginRight: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ErrorHandler;
