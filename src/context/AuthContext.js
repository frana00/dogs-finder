import { createContext, useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/apiService';
import { login as dummyLogin, register as dummyRegister, getCurrentUser as getDummyCurrentUser } from '../data/dummyData';

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
        
        // Opcional: Verificar que el token sigue siendo válido
        try {
          const profile = await apiService.getProfile();
          setUser(profile);
        } catch (error) {
          // Si el token no es válido, limpiar datos
          if (error.message === 'TOKEN_EXPIRED') {
            await logout();
          }
        }
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
      
      if (!response.token || !response.user) {
        throw new Error('Respuesta inválida del servidor');
      }

      // Guardar en AsyncStorage
      await AsyncStorage.setItem('userToken', response.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.user));

      setToken(response.token);
      setUser(response.user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error('Error en login:', error);
      
      // Si es un error de red, intentar login local
      if (error.message === 'Network request failed' || 
          error.message.includes('network') || 
          error.message.includes('fetch')) {
        
        console.log('Backend no disponible, intentando login local');
        return await loginLocalFallback(email, password);
      }
      
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.message === 'TOKEN_EXPIRED') {
        errorMessage = 'Sesión expirada, por favor inicia sesión nuevamente';
      } else if (error.message.includes('401')) {
        errorMessage = 'Usuario o contraseña incorrectos';
      } else if (error.message.includes('400')) {
        errorMessage = 'Datos inválidos';
      } else if (error.message.includes('500')) {
        errorMessage = 'Error del servidor, intenta más tarde';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Función de fallback para login local
  const loginLocalFallback = async (email, password) => {
    try {
      const user = dummyLogin(email, password);
      
      if (!user) {
        Alert.alert('Error', 'Usuario o contraseña incorrectos');
        return { success: false, error: 'Usuario o contraseña incorrectos' };
      }

      // Simular token
      const token = `local_token_${Date.now()}`;

      // Guardar en AsyncStorage
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));

      setToken(token);
      setUser(user);
      setIsAuthenticated(true);

      Alert.alert(
        'Login Local', 
        'Backend no disponible. Has iniciado sesión localmente.'
      );

      return { success: true };
    } catch (error) {
      console.error('Error en login local:', error);
      Alert.alert('Error', 'Usuario o contraseña incorrectos');
      return { success: false, error: 'Usuario o contraseña incorrectos' };
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await apiService.register(userData);
      
      // Después del registro exitoso, iniciar sesión automáticamente
      if (response.success) {
        const loginResult = await login(userData.email, userData.password);
        return loginResult;
      }
      
      return { success: true, user: response.user || userData };
    } catch (error) {
      console.error('Error en registro:', error);
      
      // Si es un error de red, usar fallback local
      if (error.message === 'Network request failed' || 
          error.message.includes('network') || 
          error.message.includes('fetch')) {
        
        console.log('Backend no disponible, usando registro local');
        return await registerLocalFallback(userData);
      }
      
      let errorMessage = 'Error al registrar usuario';
      
      if (error.message.includes('409')) {
        errorMessage = 'Este email ya está registrado';
      } else if (error.message.includes('400')) {
        errorMessage = 'Datos inválidos';
      } else if (error.message.includes('500')) {
        errorMessage = 'Error del servidor, intenta más tarde';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Función de fallback para registro local
  const registerLocalFallback = async (userData) => {
    try {
      // Usar la función de registro dummy
      const newUser = dummyRegister(userData);

      // Simular token
      const token = `local_token_${Date.now()}`;

      // Guardar en AsyncStorage
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(newUser));

      setToken(token);
      setUser(newUser);
      setIsAuthenticated(true);

      Alert.alert(
        'Registro Local', 
        'Backend no disponible. Tu cuenta se ha creado localmente y se sincronizará cuando se restablezca la conexión.'
      );

      return { success: true, user: newUser };
    } catch (error) {
      console.error('Error en registro local:', error);
      const errorMessage = error.message || 'No se pudo completar el registro';
      Alert.alert('Error', errorMessage);
      return { success: false, error: errorMessage };
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
