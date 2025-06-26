import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAlert } from '../../context/AlertContext';
import { useAuth } from '../../context/AuthContext';
import { uploadToS3 } from '../../services/photos';
import { COLORS } from '../../utils/constants';
import AlertForm from '../../components/forms/AlertForm';
import Button from '../../components/common/Button';

const CreateEditAlertScreen = ({ route, navigation }) => {
  const { alertId, alertData } = route.params || {};
  const { createNewAlert, updateExistingAlert, loading, error } = useAlert();
  const { user, isAuthenticated } = useAuth();
  // Initialize formData directly with alertData if available to avoid timing issues
  const [formData, setFormData] = useState(alertData || null);
  const [localLoading, setLocalLoading] = useState(false);

  const isEditing = Boolean(alertId);
  
  // Use local loading for editing to avoid context loading interference
  const formLoading = isEditing ? localLoading : loading;

  // Debug component removed to save screen space

  useEffect(() => {
    // Only update if alertData exists and is different from current formData
    if (alertData && alertData !== formData) {
      setFormData(alertData);
      console.log('🔄 SETTING FORM DATA IN CREATE/EDIT SCREEN:', {
        alertData,
        petNameInAlertData: alertData.petName,
        titleInAlertData: alertData.title
      });
    }
  }, [alertData]);

  const handleFormSubmit = async (data) => {
    try {
      // Separate photos from form data
      const { photos, ...alertFormData } = data;
      
      // Validate user authentication before proceeding
      if (!user || !user.username) {
        Alert.alert(
          'Error de autenticación',
          'No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.',
          [
            {
              text: 'Ir al login',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
        return;
      }
      
      // Add username to the alert data (required by backend)
      alertFormData.username = user.username;
      
      if (isEditing) {
        // Update existing alert with local loading
        setLocalLoading(true);
        const updatedAlert = await updateExistingAlert(alertId, alertFormData);
        setLocalLoading(false);
        
        // TODO: Handle photo updates for existing alerts
        Alert.alert('Éxito', 'Alerta actualizada correctamente');
        navigation.goBack();
      } else {
        // Create new alert - use the new flow with photoFilenames
        const newAlert = await createNewAlert(alertFormData);
        
        // Handle photos using the new S3 presigned URL flow
        if (photos && photos.length > 0) {
          try {
            // Check if the alert creation response includes photoUrls
            if (newAlert.photoUrls && newAlert.photoUrls.length > 0) {
              // Upload each photo directly to S3 using presigned URLs
              const uploadPromises = photos.map(async (photo, index) => {
                const photoUrl = newAlert.photoUrls[index];
                if (photoUrl && photoUrl.presignedUrl) {
                  await uploadToS3(photo.uri, photoUrl.presignedUrl);
                  return { success: true, s3ObjectKey: photoUrl.s3ObjectKey };
                } else {
                  return { success: false, error: 'No presigned URL' };
                }
              });
              
              const uploadResults = await Promise.all(uploadPromises);
              const successCount = uploadResults.filter(r => r.success).length;
              const failureCount = uploadResults.length - successCount;
              
              if (failureCount > 0) {
                Alert.alert(
                  'Alerta creada',
                  `La alerta se creó correctamente. ${successCount} de ${photos.length} foto(s) se subieron exitosamente.`,
                  [
                    {
                      text: 'Ver alerta',
                      onPress: () => navigation.replace('AlertDetail', { alertId: newAlert.id }),
                    },
                    {
                      text: 'Ir al inicio',
                      onPress: () => navigation.navigate('Home'),
                    },
                  ]
                );
              } else {
                Alert.alert(
                  'Éxito',
                  `Alerta creada correctamente con ${photos.length} foto(s).`,
                  [
                    {
                      text: 'Ver alerta',
                      onPress: () => navigation.replace('AlertDetail', { alertId: newAlert.id }),
                    },
                    {
                      text: 'Ir al inicio',
                      onPress: () => navigation.navigate('Home'),
                    },
                  ]
                );
              }
            } else {
              Alert.alert(
                'Alerta creada',
                'La alerta se creó correctamente, pero las fotos no se pudieron procesar. Puedes intentar subirlas más tarde.',
                [
                  {
                    text: 'Ver alerta',
                    onPress: () => navigation.replace('AlertDetail', { alertId: newAlert.id }),
                  },
                  {
                    text: 'Ir al inicio',
                    onPress: () => navigation.navigate('Home'),
                  },
                ]
              );
            }
          } catch (photoError) {
            Alert.alert(
              'Alerta creada',
              'La alerta se creó correctamente, pero hubo un error al subir las fotos. Puedes intentar subirlas más tarde.',
              [
                {
                  text: 'Ver alerta',
                  onPress: () => navigation.replace('AlertDetail', { alertId: newAlert.id }),
                },
                {
                  text: 'Ir al inicio', 
                  onPress: () => navigation.navigate('Home'),
                },
              ]
            );
          }
        } else {
          Alert.alert(
            'Éxito',
            'Alerta creada correctamente',
            [
              {
                text: 'Ver alerta',
                onPress: () => navigation.replace('AlertDetail', { alertId: newAlert.id }),
              },
              {
                text: 'Ir al inicio',
                onPress: () => navigation.navigate('Home'),
              },
            ]
          );
        }
      }
    } catch (error) {
      if (isEditing) {
        setLocalLoading(false);
      }
      Alert.alert('Error', error.message || 'Error al procesar la alerta');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Button
          title="← Cancelar"
          onPress={() => navigation.goBack()}
          variant="text"
          style={styles.cancelButton}
        />
        
        <Text style={styles.headerTitle}>
          {isEditing ? 'Editar Alerta' : 'Nueva Alerta'}
        </Text>
        
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        enabled
      >
        {/* Show loading while waiting for initial data in edit mode */}
        {isEditing && !formData ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando datos de la alerta...</Text>
          </View>
        ) : (
          <AlertForm
            initialData={formData}
            onSubmit={handleFormSubmit}
            loading={formLoading}
            style={styles.form}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  cancelButton: {
    minWidth: 80,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerRight: {
    minWidth: 80,
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  form: {
    flex: 1,
    minHeight: '100%', // Ensure form takes full height
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default CreateEditAlertScreen;
