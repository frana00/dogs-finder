import React, { createContext, useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/apiService';

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
        const parsedUser = JSON.parse(storedUser);
        setIsAuthenticated(true);
        
        // Obtener perfil completo
        try {
          console.log('🔄 AuthContext: Calling getProfile() in checkAuth...');
          const profile = await apiService.getProfile();
          console.log('✅ AuthContext: Profile data from getProfile() in checkAuth:', profile);
          const fullUser = { ...parsedUser, ...profile }; // Combinar datos básicos con perfil completo
          setUser(fullUser);
          await AsyncStorage.setItem('userData', JSON.stringify(fullUser));
        } catch (profileError) {
          console.error('❌ AuthContext: Error fetching profile in checkAuth:', profileError);
          setUser(parsedUser); // Usar datos básicos si el perfil falla
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      if (!email || !password) {
        throw new Error('Por favor ingresa tu correo y contraseña');
      }

      const response = await apiService.login(email, password);
      
      if (response && response.token && response.user) {
        await AsyncStorage.setItem('userToken', response.token);
        
        setToken(response.token);
        setIsAuthenticated(true);
        
        // Obtener perfil completo después del login
        try {
          console.log('🔄 AuthContext: Calling getProfile() after login...');
          const profile = await apiService.getProfile();
          console.log('✅ AuthContext: Profile data from getProfile() after login:', profile);
          setUser(profile); 
          await AsyncStorage.setItem('userData', JSON.stringify(profile));
        } catch (profileError) {
          console.error('❌ AuthContext: Error fetching profile after login:', profileError);
          setUser(response.user); // Usar datos básicos del login si el perfil falla
          await AsyncStorage.setItem('userData', JSON.stringify(response.user));
        }
        
        return { success: true };
      } else {
        throw new Error(response.message || 'Error en el login');
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.message === 'TOKEN_EXPIRED') {
        errorMessage = 'Sesión expirada, por favor inicia sesión nuevamente';
      } else if (error.message.includes('401')) {
        errorMessage = 'Usuario o contraseña incorrectos';
      } else if (error.message.includes('400')) {
        errorMessage = 'Datos inválidos';
      } else if (error.message.includes('500')) {
        errorMessage = 'Error del servidor, intenta más tarde';
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        errorMessage = 'No se puede conectar al servidor. Verifica tu conexión a internet.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      console.log('🔐 Intentando registro con backend:', userData.email);
      
      const response = await apiService.register(userData);
      
      // Después del registro exitoso, usualmente se hace login automáticamente o se pide al usuario que inicie sesión.
      // Si el backend devuelve un token y datos de usuario aquí, similar al login:
      if (response && response.token && response.user) {
        await AsyncStorage.setItem('userToken', response.token);
        setToken(response.token);
        setIsAuthenticated(true);
        // Obtener perfil completo después del registro (si el backend loguea automáticamente)
        try {
          console.log('🔄 AuthContext: Calling getProfile() after register...');
          const profile = await apiService.getProfile();
          console.log('✅ AuthContext: Profile data from getProfile() after register:', profile);
          setUser(profile);
          await AsyncStorage.setItem('userData', JSON.stringify(profile));
        } catch (profileError) {
          console.error('❌ AuthContext: Error fetching profile after register:', profileError);
          setUser(response.user); // Usar datos básicos si el perfil falla
          await AsyncStorage.setItem('userData', JSON.stringify(response.user));
        }
      } else {
        // Manejar registro exitoso sin login automático (e.g. mostrar mensaje para verificar email o loguear)
        console.log('🎉 Registro exitoso, por favor inicia sesión.', response);
      }
      return response; // Devolver la respuesta completa del registro
    } catch (error) {
      console.error('❌ Error en registro:', error);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      
      let errorMessage = 'Error al registrar usuario';
      
      if (error.message.includes('409')) {
        errorMessage = 'Este email ya está registrado';
      } else if (error.message.includes('400')) {
        errorMessage = 'Datos inválidos. Verifica que todos los campos estén correctos.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Error del servidor, intenta más tarde';
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        errorMessage = 'No se puede conectar al servidor. Verifica tu conexión a internet.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
      return { success: false, error: errorMessage };
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

  // Método para actualizar el perfil del usuario
  const updateProfile = async (userData) => {
    setLoading(true);
    try {
      const updatedUser = await apiService.updateProfile(userData);
      
      // Actualizar datos locales
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      let errorMessage = 'Error al actualizar perfil';
      
      if (error.message === 'TOKEN_EXPIRED') {
        await logout();
        errorMessage = 'Sesión expirada, por favor inicia sesión nuevamente';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
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
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
