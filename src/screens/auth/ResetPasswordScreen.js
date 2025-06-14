import React, { useState, useEffect } from 'react';
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
import { verifyResetToken, resetPassword } from '../../services/auth';
import { validatePassword, hasFormErrors } from '../../utils/validation';
import { COLORS } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

const ResetPasswordScreen = ({ navigation, route }) => {
  const { token } = route.params || {};
  const { isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [passwordReset, setPasswordReset] = useState(false);

  useEffect(() => {
    verifyToken();
  }, []);

  const verifyToken = async () => {
    if (!token) {
      const errorAction = isAuthenticated 
        ? () => navigation.navigate('Home')
        : () => navigation.navigate('Login');
        
      Alert.alert(
        'Error',
        'Token de recuperación no válido',
        [{ text: 'OK', onPress: errorAction }]
      );
      return;
    }

    // Development mode: Skip backend validation for test tokens
    if (__DEV__ && token.includes('9KzqQN5K3H9v3nC2nB7V8dT6sL4M1xY0zP9wQ2eR3uI')) {
      console.log('🔧 Development mode: Using test token, skipping backend validation');
      setTokenValid(true);
      setUserEmail('test@example.com');
      setIsVerifying(false);
      
      Alert.alert(
        'Modo Desarrollo',
        'Usando token de prueba. En producción, este token será validado por el backend.',
        [{ text: 'Continuar' }]
      );
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyResetToken(token);
      if (result.valid) {
        setTokenValid(true);
        setUserEmail(result.email);
      } else {
        throw new Error('Token no válido');
      }
    } catch (error) {
      const errorAction = isAuthenticated 
        ? () => navigation.navigate('Home')
        : () => navigation.navigate('Login');
        
      Alert.alert(
        'Token expirado',
        'El enlace de recuperación ha expirado o no es válido. Por favor solicita uno nuevo.',
        [{ text: 'OK', onPress: errorAction }]
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate new password
    const passwordValidation = validatePassword(formData.newPassword);
    if (!passwordValidation.isValid) {
      errors.newPassword = passwordValidation.message;
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Por favor confirma tu contraseña';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
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
      // Development mode: Skip backend call for test tokens
      if (__DEV__ && token.includes('9KzqQN5K3H9v3nC2nB7V8dT6sL4M1xY0zP9wQ2eR3uI')) {
        console.log('🔧 Development mode: Simulating password reset');
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        Alert.alert(
          'Modo Desarrollo',
          'Contraseña simulada exitosamente. En producción, esto actualizaría la contraseña real.',
          [{ 
            text: 'OK', 
            onPress: () => setPasswordReset(true)
          }]
        );
        return;
      }

      await resetPassword(token, formData.newPassword);
      setPasswordReset(true);
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Hubo un problema al cambiar la contraseña. Por favor intenta de nuevo.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    if (isAuthenticated) {
      navigation.navigate('Home');
    } else {
      navigation.navigate('Login');
    }
  };

  if (isVerifying) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Loading />
          <Text style={styles.loadingText}>Verificando enlace...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!tokenValid) {
    return null; // Alert will handle navigation
  }

  if (passwordReset) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.successContainer}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>¡Contraseña actualizada!</Text>
            <Text style={styles.successMessage}>
              Tu contraseña ha sido cambiada exitosamente. 
              Ya puedes iniciar sesión con tu nueva contraseña.
            </Text>
            <Button
              title={isAuthenticated ? "Volver al Inicio" : "Iniciar sesión"}
              onPress={handleGoToLogin}
              style={styles.loginButton}
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
            <Text style={styles.title}>Nueva contraseña</Text>
            <Text style={styles.subtitle}>
              Crea una nueva contraseña para {userEmail}
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Nueva contraseña"
              value={formData.newPassword}
              onChangeText={(value) => handleInputChange('newPassword', value)}
              placeholder="Ingresa tu nueva contraseña"
              secureTextEntry
              error={formErrors.newPassword}
            />

            <Input
              label="Confirmar contraseña"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              placeholder="Confirma tu nueva contraseña"
              secureTextEntry
              error={formErrors.confirmPassword}
            />

            <Button
              title="Actualizar contraseña"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              style={styles.submitButton}
            />

            <Button
              title={isAuthenticated ? "Volver" : "Cancelar"}
              onPress={handleGoToLogin}
              variant="text"
              style={styles.cancelButton}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
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
  cancelButton: {
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
    marginBottom: 32,
  },
  loginButton: {
    marginTop: 8,
  },
});

export default ResetPasswordScreen;
