import { createContext, useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  // Verificar si hay un token guardado al iniciar la app
  const checkAuth = useCallback(async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUser = await AsyncStorage.getItem('userData');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
    }
  }, []);

  // URL base del backend - importada desde la configuración
  const API_BASE_URL = API_CONFIG.BASE_URL;

  const login = async (email, password) => {
    setLoading(true);
    try {
      console.log('Iniciando sesión con:', { email: email ? 'presente' : 'ausente', password: password ? 'presente' : 'ausente' });
      
      if (!email || !password) {
        console.error('Email o contraseña vacíos');
        throw new Error('Por favor ingresa tu correo y contraseña');
      }

      // Simular una respuesta exitosa del servidor
      const mockUser = {
        id: '123',
        email: email,
        name: email.split('@')[0], // Usar la parte antes del @ como nombre
        role: 'user'
      };

      const mockToken = 'mock-jwt-token-' + Date.now();

      // Simular un retraso de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Guardar token y datos del usuario
      try {
        await AsyncStorage.setItem('userToken', mockToken);
        await AsyncStorage.setItem('userData', JSON.stringify(mockUser));
        
        setToken(mockToken);
        setUser(mockUser);
        setIsAuthenticated(true);
        
        console.log('Inicio de sesión simulado exitosamente');
        return { success: true };
      } catch (storageError) {
        console.error('Error al guardar los datos de autenticación:', storageError);
        throw new Error('Error al guardar los datos de la sesión');
      }
    } catch (error) {
      console.error('Error en login:', error);
      Alert.alert('Error', error.message || 'Error al iniciar sesión');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      console.log('Registrando usuario:', userData);
      
      // Simular un retraso de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular registro exitoso
      console.log('Usuario registrado exitosamente:', userData);
      
      // Iniciar sesión automáticamente después del registro
      const loginResult = await login(userData.email, userData.password);
      
      return { 
        success: loginResult.success,
        user: userData 
      };
    } catch (error) {
      console.error('Error en registro:', error);
      Alert.alert('Error', error.message || 'Error al registrar usuario');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        loading,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
