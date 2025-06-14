import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as authService from '../services/auth';
import { getUserData, saveUserData, saveUserDataForUser, getCredentials } from '../utils/storage';

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        loading: false,
      };
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      console.log('🔍 AuthContext: Checking authentication status...');
      const isValid = await authService.validateSession();
      console.log('🔍 AuthContext: Session validation result:', isValid);
      
      if (isValid) {
        const user = await authService.getCurrentUser();
        console.log('🔍 AuthContext: Current user data:', user);
        console.log('🔍 AuthContext: User username:', user?.username);
        
        if (user && user.username) {
          dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: user });
          console.log('✅ AuthContext: Authentication successful with user data');
        } else {
          console.warn('⚠️ AuthContext: Session valid but user data incomplete');
          console.warn('⚠️ AuthContext: User object:', user);
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } else {
        console.log('❌ AuthContext: Session validation failed, logging out');
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    } catch (error) {
      console.error('❌ AuthContext: Error checking auth status:', error);
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  const login = async (username, password) => {
    try {
      console.log(`🔐 AuthContext: Attempting login for user: ${username}`);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      
      const user = await authService.login(username, password);
      console.log(`✅ AuthContext: Login successful for user: ${username}`);
      console.log(`🔍 AuthContext: User data received:`, user);
      console.log(`🔍 AuthContext: User username:`, user?.username);
      
      if (user && user.username) {
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: user });
        console.log(`✅ AuthContext: User data stored in context`);
        return { success: true };
      } else {
        console.error(`❌ AuthContext: Login response missing username`);
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: 'Error de autenticación: datos de usuario incompletos' });
        return { success: false, error: 'Datos de usuario incompletos' };
      }
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: user });
      
      return { success: true };
    } catch (error) {
      console.log(`❌ Login failed for user: ${username}`, error.message);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      
      await authService.register(userData);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      
      return { success: true };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      return { success: true };
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if logout fails, clear local state
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      return { success: true };
    }
  };

  const updateUser = async (userData) => {
    try {
      // Update the context state
      dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: userData });
      
      // Also save to local storage to persist between sessions
      const currentUserData = await getUserData();
      const credentials = await getCredentials();
      
      if (currentUserData && credentials) {
        const updatedUserData = { ...currentUserData, ...userData };
        
        // Save both globally and for specific user
        await saveUserData(updatedUserData);
        await saveUserDataForUser(credentials.username, updatedUserData);
        
        console.log('📱 Updated user data saved to storage:', updatedUserData);
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
