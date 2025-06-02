import React, { createContext, useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiServiceInstance } from '../services/apiService';
const apiService = getApiServiceInstance();

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Para la carga inicial de la app y procesos de auth
  const [profileOpLoading, setProfileOpLoading] = useState(false); // Para operaciones de carga/actualización de perfil

  // Verificar si hay un token guardado al iniciar la app
  const checkAuth = useCallback(async () => {
    console.log('[AuthContext] checkAuth: STARTING');
    try {
      console.log('[AuthContext] checkAuth: TRY block entered.');
      console.log('[AuthContext] checkAuth: Attempting to get userToken from AsyncStorage...');
      const storedToken = await AsyncStorage.getItem('userToken');
      console.log('[AuthContext] checkAuth: userToken from AsyncStorage -', storedToken ? 'Exists' : 'null');
      console.log('[AuthContext] checkAuth: Attempting to get userData from AsyncStorage...');
      const storedUser = await AsyncStorage.getItem('userData');
      console.log('[AuthContext] checkAuth: userData from AsyncStorage -', storedUser ? 'Exists' : 'null');
      
      if (storedToken && storedUser) {
        apiService.setAuthHeader(storedToken);
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        console.log('[AuthContext] checkAuth: Session restored. User and Token SET.');
        setIsAuthenticated(true);
        
        // Obtener perfil completo
        try {
          console.log('🔄 AuthContext: Calling getProfile() in checkAuth...');
          const profile = await apiService.getProfile();
          console.log('✅ AuthContext: Profile data from getProfile() in checkAuth:', profile);
          const fullUser = { ...JSON.parse(storedUser), ...profile }; // Combinar datos básicos con perfil completo
          setUser(fullUser);
          await AsyncStorage.setItem('userData', JSON.stringify(fullUser));
        } catch (profileError) {
          console.error('❌ AuthContext: Error fetching profile in checkAuth:', profileError);
          setUser(JSON.parse(storedUser)); // Usar datos básicos si el perfil falla
        }
      } else {
        console.log('[AuthContext] checkAuth: No active session found in AsyncStorage.');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('💥 [AuthContext] checkAuth: ERROR in TRY block -', error);
    } finally {
      console.log('[AuthContext] checkAuth: FINALLY block reached.');
      setLoading(false);
      console.log('[AuthContext] checkAuth: setLoading(false) CALLED.');
    }
  }, []);

  const login = useCallback(async (email, password) => {
    console.log(`[AuthContext] login: Attempting login for ${email}`);
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
        console.log('[AuthContext] login: Login successful. Token received:', response.token);
        apiService.setAuthHeader(response.token); // Crucial: Set auth header for subsequent calls
        console.log('[AuthContext] login: Auth header set in apiService with new token.');
        
        // Obtener perfil completo después del login
        try {
          console.log('🔄 AuthContext: Calling getProfile() after login...');
          const profile = await apiService.getProfile();
          console.log('✅ AuthContext: Profile data from getProfile() after login:', JSON.stringify(profile, null, 2));
          setUser(profile); 
          await AsyncStorage.setItem('userData', JSON.stringify(profile));
          console.log('[AuthContext] login: User state and AsyncStorage updated with profile:', JSON.stringify(profile, null, 2));
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
  }, []);

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

  const logout = useCallback(async () => {
    console.log('[AuthContext] logout: Starting logout process.');
    setLoading(true);
    try {
      await AsyncStorage.removeItem('userToken');
      console.log('[AuthContext] logout: userToken removed from AsyncStorage.');
      await AsyncStorage.removeItem('userData');
      console.log('[AuthContext] logout: userData removed from AsyncStorage.');
      
      apiService.clearAuthHeader(); // Crucial: Clear auth header
      console.log('[AuthContext] logout: Auth header cleared in apiService.');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      console.log('[AuthContext] logout: User state reset. Logout complete.');
    } catch (error) {
      console.error('💥 [AuthContext] logout: ERROR -', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Método para actualizar el perfil del usuario
  const fetchUserProfile = useCallback(async () => {
    setProfileOpLoading(true); // Indicar que la operación de carga está en curso
    try {
      console.log('🔄 AuthContext: Calling getProfile() in fetchUserProfile...');
      const profileData = await apiService.getProfile();
      console.log('✅ AuthContext: Profile data from getProfile() in fetchUserProfile:', profileData);
      setUser(profileData);
      await AsyncStorage.setItem('userData', JSON.stringify(profileData));
      return { success: true, user: profileData };
    } catch (error) {
      // Este console.error pertenece a fetchUserProfile, el de checkAuth ya está arriba.
      console.error('❌ AuthContext: Error fetching profile in fetchUserProfile:', error);
      let errorMessage = 'No se pudo cargar tu perfil.';
      if (error.message === 'TOKEN_EXPIRED') {
        await logout(); // logout() ya maneja la limpieza y el estado de autenticación
        errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert('Error', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setProfileOpLoading(false); // Finalizar el estado de carga de la actualización
    }
  }, [logout]); // Agregado logout a las dependencias de useCallback

  const updateProfile = useCallback(async (userData) => {
    setProfileOpLoading(true); // Indicar que la operación de actualización está en curso
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
      setProfileOpLoading(false); // Finalizar el estado de carga de la actualización
    }
  }, [logout]); // Agregado logout a las dependencias de useCallback

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isAuthenticated: !!token, 
      loading, 
      profileOpLoading, // Exponer el nuevo estado de carga
      login, 
      logout, 
      register, 
      checkAuth,
      updateProfile,
      fetchUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
