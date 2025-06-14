import React, { useEffect, useRef } from 'react';
import { Linking, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

/**
 * Component that initializes deep linking functionality
 * Must be used inside NavigationContainer
 */
const DeepLinkHandler = ({ children }) => {
  const navigation = useNavigation();
  const navigationRef = useRef(navigation);

  useEffect(() => {
    navigationRef.current = navigation;
  }, [navigation]);

  useEffect(() => {
    // Handle initial URL if app was opened via deep link
    const handleInitialURL = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          console.log('🔗 App opened with deep link:', initialUrl);
          handleDeepLink(initialUrl);
        }
      } catch (error) {
        console.error('❌ Error getting initial URL:', error);
      }
    };

    // Handle URL changes while app is running
    const handleURLChange = ({ url }) => {
      console.log('🔗 Deep link received:', url);
      handleDeepLink(url);
    };

    // Set up listeners
    handleInitialURL();
    const subscription = Linking.addEventListener('url', handleURLChange);

    // Cleanup
    return () => {
      subscription?.remove();
    };
  }, []);

  const handleDeepLink = (url) => {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      
      console.log('🔍 Processing deep link path:', path);

      // Handle password reset deep links
      if (path.startsWith('/reset-password')) {
        handlePasswordResetLink(urlObj);
      } else {
        console.log('ℹ️ Unhandled deep link path:', path);
      }
    } catch (error) {
      console.error('❌ Error processing deep link:', error);
      Alert.alert(
        'Enlace no válido',
        'El enlace que intentas abrir no es válido.',
        [{ text: 'OK' }]
      );
    }
  };

  const handlePasswordResetLink = (urlObj) => {
    const pathParts = urlObj.pathname.split('/');
    const token = pathParts[pathParts.length - 1]; // Get the last part of the path

    console.log('🔐 Password reset token received:', token?.substring(0, 8) + '...');

    if (!token || token.length < 10) {
      Alert.alert(
        'Token no válido',
        'El enlace de recuperación de contraseña no es válido.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Navigate to reset password screen with token
    try {
      navigationRef.current?.navigate('ResetPassword', { token });
      console.log('✅ Navigated to ResetPassword screen with token');
    } catch (error) {
      console.error('❌ Error navigating to ResetPassword:', error);
      Alert.alert(
        'Error de navegación',
        'Hubo un problema al abrir la pantalla de recuperación.',
        [{ text: 'OK' }]
      );
    }
  };

  return children || null;
};

export default DeepLinkHandler;
