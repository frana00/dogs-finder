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
import { validateLoginForm, hasFormErrors } from '../../utils/validation';
import { COLORS } from '../../utils/constants';
import { showDebugInfo, showConnectivityInfo, showStoredUserData } from '../../utils/debug';
import { clearAllStoredData, getStorageDebugInfo, getUserDebugInfo, listAllStoredUsers } from '../../utils/testHelpers';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

const LoginScreen = ({ navigation }) => {
  const { login, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Clear any previous errors when component mounts
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
    const errors = validateLoginForm(formData);
    
    if (hasFormErrors(errors)) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      const result = await login(formData.username, formData.password);
      
      if (result.success) {
        // Navigation will be handled automatically by the AuthContext
        // The app navigator will detect the authentication change
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (err) {
      Alert.alert('Error', 'Ha ocurrido un error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  if (loading && !isSubmitting) {
    return <Loading message="Verificando sesión..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>🐾</Text>
          <Text style={styles.title}>PetSignal</Text>
          <Text style={styles.subtitle}>Encuentra y reporta mascotas perdidas</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Usuario"
            value={formData.username}
            onChangeText={(value) => handleInputChange('username', value)}
            placeholder="Ingresa tu usuario"
            error={formErrors.username}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Contraseña"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            placeholder="Ingresa tu contraseña"
            error={formErrors.password}
            secureTextEntry
            showPasswordToggle
          />

          <Button
            title="Iniciar Sesión"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.loginButton}
          />

          <TouchableOpacity 
            style={styles.forgotPasswordContainer}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text style={styles.registerLink}>Regístrate aquí</Text>
            </TouchableOpacity>
          </View>

          {/* Debug buttons - only in development */}
          {__DEV__ && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>🔧 Debug Tools</Text>
              <View style={styles.debugButtons}>
                <TouchableOpacity 
                  style={styles.debugButton} 
                  onPress={showDebugInfo}
                >
                  <Text style={styles.debugButtonText}>ℹ️ Info</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.debugButton} 
                  onPress={showConnectivityInfo}
                >
                  <Text style={styles.debugButtonText}>🌐 Test</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.debugButton} 
                  onPress={showStoredUserData}
                >
                  <Text style={styles.debugButtonText}>📱 Datos</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.debugButtons}>
                <TouchableOpacity 
                  style={[styles.debugButton, styles.clearButton]} 
                  onPress={() => clearAllStoredData().then(() => Alert.alert('Debug', 'Datos borrados'))}
                >
                  <Text style={styles.debugButtonText}>🗑️ Limpiar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.debugButton} 
                  onPress={() => getStorageDebugInfo()}
                >
                  <Text style={styles.debugButtonText}>🔍 Storage</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.debugButton} 
                  onPress={() => listAllStoredUsers()}
                >
                  <Text style={styles.debugButtonText}>👥 Users</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
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
  loginButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  registerLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  forgotPasswordContainer: {
    marginVertical: 12,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  debugContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  debugButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 8,
  },
  debugButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.background,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  clearButton: {
    backgroundColor: '#ffe6e6',
    borderColor: '#ffcccc',
  },
  debugButtonText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

export default LoginScreen;
