import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { validateRegistrationForm, hasFormErrors } from '../../utils/validation';
import { COLORS, SUCCESS_MESSAGES } from '../../utils/constants';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const RegisterScreen = ({ navigation }) => {
  const { register, loading, clearError } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    clearError();
  }, []);

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

  const handleSubmit = async () => {
    // Validate form
    const errors = validateRegistrationForm(formData);
    
    if (hasFormErrors(errors)) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      // Prepare data for API (remove confirmPassword)
      const { confirmPassword, ...registrationData } = formData;
      registrationData.role = 'USER'; // Set default role
      
      // Use the same email for both primary and subscription emails
      registrationData.subscriptionEmail = registrationData.email;

      const result = await register(registrationData);
      
      if (result.success) {
        Alert.alert(
          'Éxito',
          SUCCESS_MESSAGES.REGISTRATION_SUCCESS,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (err) {
      Alert.alert('Error', 'Ha ocurrido un error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.header}>
          <Text style={styles.logo}>🐾</Text>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Únete a la comunidad PetSignal</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Usuario *"
            value={formData.username}
            onChangeText={(value) => handleInputChange('username', value)}
            placeholder="Elige un nombre de usuario"
            error={formErrors.username}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Email *"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            placeholder="tu@email.com"
            error={formErrors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Contraseña *"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            placeholder="Mínimo 6 caracteres"
            error={formErrors.password}
            secureTextEntry
            showPasswordToggle
          />

          <Input
            label="Confirmar Contraseña *"
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
            placeholder="Repite tu contraseña"
            error={formErrors.confirmPassword}
            secureTextEntry
            showPasswordToggle
          />

          <Input
            label="Teléfono"
            value={formData.phoneNumber}
            onChangeText={(value) => handleInputChange('phoneNumber', value)}
            placeholder="+34123456789"
            error={formErrors.phoneNumber}
            keyboardType="phone-pad"
          />

          <Text style={styles.requiredNote}>* Campos obligatorios</Text>

          <Button
            title="Registrarse"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.registerButton}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginLink}>Inicia sesión aquí</Text>
            </TouchableOpacity>
          </View>
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
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  requiredNote: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  loginLink: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default RegisterScreen;
