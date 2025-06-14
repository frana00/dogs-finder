import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { requestPasswordReset } from '../../services/auth';
import { validateEmail, hasFormErrors } from '../../utils/validation';
import { COLORS } from '../../utils/constants';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleEmailChange = (value) => {
    setEmail(value);
    
    // Clear error when user starts typing
    if (formErrors.email) {
      setFormErrors(prev => ({
        ...prev,
        email: null,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!validateEmail(email)) {
      errors.email = 'Por favor ingresa un email válido';
    }

    setFormErrors(errors);
    return !hasFormErrors(errors);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔐 Attempting password reset for:', email.trim().toLowerCase());
      
      // Debug: Show what URL we're hitting
      const { getApiBaseUrl } = require('../../utils/network');
      console.log('🌐 API Base URL:', getApiBaseUrl());
      console.log('🎯 Full endpoint:', getApiBaseUrl() + '/auth/forgot-password');
      
      await requestPasswordReset(email.trim().toLowerCase());
      console.log('✅ Password reset request completed');
      setEmailSent(true);
    } catch (error) {
      console.error('❌ Password reset error:', error);
      
      let errorMessage = 'Hubo un problema al enviar el email. Por favor intenta de nuevo.';
      
      // More specific error handling
      if (error.response) {
        console.log('Backend responded with status:', error.response.status);
        console.log('Backend error data:', error.response.data);
        
        if (error.response.status === 401) {
          errorMessage = 'Error de configuración del servidor. El backend dev necesita hacer el endpoint público.';
        } else if (error.response.status === 429) {
          errorMessage = 'Has hecho demasiados intentos. Espera un momento e intenta de nuevo.';
        } else if (error.response.status >= 500) {
          errorMessage = 'Error del servidor. Por favor intenta más tarde.';
        } else if (error.response.status === 404) {
          errorMessage = 'El endpoint /auth/forgot-password no está implementado en el backend.';
        }
      } else if (error.message.includes('Network Error') || error.code === 'NETWORK_ERROR') {
        errorMessage = 'Error de conexión. Verifica tu internet y que el servidor esté disponible.';
      }
      
      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  if (emailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.successContainer}>
            <Text style={styles.successIcon}>📧</Text>
            <Text style={styles.successTitle}>Email enviado</Text>
            <Text style={styles.successMessage}>
              Si el email está registrado en nuestro sistema, recibirás instrucciones 
              para recuperar tu contraseña en los próximos minutos.
            </Text>
            <Text style={styles.instructionsText}>
              Por favor revisa tu bandeja de entrada y la carpeta de spam.
            </Text>
            <Button
              title="Volver al inicio de sesión"
              onPress={handleBackToLogin}
              style={styles.backButton}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
            <Text style={styles.subtitle}>
              Ingresa tu email y te enviaremos instrucciones para crear una nueva contraseña.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={handleEmailChange}
              placeholder="tu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={formErrors.email}
            />

            <Button
              title="Enviar instrucciones"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              style={styles.submitButton}
            />

            <Button
              title="Volver al inicio de sesión"
              onPress={handleBackToLogin}
              variant="text"
              style={styles.backButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  submitButton: {
    marginTop: 20,
    marginBottom: 16,
  },
  backButton: {
    marginTop: 8,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  instructionsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    fontStyle: 'italic',
  },
});

export default ForgotPasswordScreen;
