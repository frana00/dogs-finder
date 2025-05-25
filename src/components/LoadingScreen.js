import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

const LoadingScreen = ({ 
  message = 'Cargando...', 
  size = 'large', 
  color = '#FF9800',
  style = {},
  transparent = false 
}) => {
  return (
    <View style={[
      transparent ? styles.transparentContainer : styles.container, 
      style
    ]}>
      <ActivityIndicator size={size} color={color} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
};

const LoadingOverlay = ({ 
  visible, 
  message = 'Cargando...', 
  children,
  backgroundColor = 'rgba(255, 255, 255, 0.9)'
}) => {
  if (!visible) return children;

  return (
    <View style={styles.overlayContainer}>
      {children}
      <View style={[styles.overlay, { backgroundColor }]}>
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={styles.overlayText}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  transparentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  overlayContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export { LoadingScreen, LoadingOverlay };
export default LoadingScreen;
