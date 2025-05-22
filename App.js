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

import { Platform, Text } from 'react-native';

export default function App() {
  if (Platform.OS === 'web') {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#fffbe6', height:'100vh', width:'100vw'}}>
        <Text style={{fontSize:28, fontWeight:'bold', marginBottom:16, color:'#ff9800', textAlign:'center'}}>
          ¡Solo disponible en móvil!
        </Text>
        <Text style={{fontSize:18, color:'#333', textAlign:'center', maxWidth:400}}>
          Descarga la app desde la App Store o Google Play para usar todas las funciones.
        </Text>
      </View>
    );
  }
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
