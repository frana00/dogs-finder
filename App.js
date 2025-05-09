import 'react-native-get-random-values';
import React, { useState, createContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Importar stacks de navegación
import AuthStack from './src/navigation/AuthStack';
import AppStack from './src/navigation/AppStack';

// Crea el contexto de autenticación
export const AuthContext = createContext();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Funciones simplificadas para autenticación
  const authContext = {
    isAuthenticated,
    loading,
    login: () => {
      setLoading(true);
      setTimeout(() => {
        setIsAuthenticated(true);
        setLoading(false);
      }, 1000);
    },
    register: () => {
      setLoading(true);
      setTimeout(() => {
        setIsAuthenticated(true);
        setLoading(false);
      }, 1000);
    },
    logout: () => {
      setIsAuthenticated(false);
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AuthContext.Provider value={authContext}>
        <NavigationContainer>
          {isAuthenticated ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
      </AuthContext.Provider>
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
