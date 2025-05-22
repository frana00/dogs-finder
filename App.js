import 'react-native-get-random-values';
import React, { useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// Importar contextos
import { AuthContext, AuthProvider } from './src/context/AuthContext';
import { AlertProvider } from './src/context/AlertContext';

// Importar stacks de navegación
import AuthStack from './src/navigation/AuthStack';
import RootStackNavigator from './src/navigation/RootStackNavigator';

// Componente para manejar la navegación basada en autenticación
const Navigation = () => {
  const { isAuthenticated, loading, checkAuth } = useContext(AuthContext);

  useEffect(() => {
    // Verificar si hay una sesión guardada al cargar la app
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
      </View>
    );
  }

  return isAuthenticated ? <RootStackNavigator /> : <AuthStack />;
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AuthProvider>
        <AlertProvider>
          <NavigationContainer>
            <Navigation />
          </NavigationContainer>
        </AlertProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
