import React, { useState, useEffect, useContext } from 'react';
import Constants from 'expo-constants';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, Image } from 'react-native';
import * as Location from 'expo-location';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import * as ImagePicker from 'expo-image-picker';
import apiService from '../../services/apiService';
import { AuthContext } from '../../context/AuthContext';

const CreateAlertScreen = ({ navigation }) => {
  try {
    const authContext = useContext(AuthContext);
    
    // Verificación de seguridad para el contexto
    if (!authContext) {
      console.error('AuthContext not found');
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Error: Contexto de autenticación no disponible</Text>
        </View>
      );
    }
    
    const { user } = authContext;
    
    // Inicializar states de forma segura
    const [dogName, setDogName] = useState('');
    const [description, setDescription] = useState('');
    const [chip, setChip] = useState('');
    const [location, setLocation] = useState('');
    const [postalCode, setPostalCode] = useState(null); // Initialize to null
    const [gettingLocation, setGettingLocation] = useState(false);
    const [photos, setPhotos] = useState([]); // Para varias imágenes (máx 5)
    const [isLoading, setIsLoading] = useState(false); // Estado para el indicador de carga

    console.log('🔍 CreateAlertScreen: Component rendered, photos:', photos);
    console.log('🔍 CreateAlertScreen: user:', user);
  console.log('🔍 CreateAlertScreen: photos type:', typeof photos, 'isArray:', Array.isArray(photos));

  useEffect(() => {
    const getLocation = async () => {
      setGettingLocation(true);
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setGettingLocation(false);
          Alert.alert('Permiso denegado', 'No se pudo obtener la ubicación.');
          return;
        }
        let loc = await Location.getCurrentPositionAsync({});
        if (loc && loc.coords) {
          // Reverse geocoding para obtener dirección legible
          let addresses = await Location.reverseGeocodeAsync({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude
          });
          if (addresses && addresses.length > 0) {
            const addr = addresses[0];
            // Concatenar partes relevantes de la dirección
            const fullAddress = `${addr.street || ''} ${addr.name || ''}, ${addr.city || addr.district || ''}, ${addr.region || ''}, ${addr.country || ''}`.replace(/, ,/g, ',').trim();
            setLocation(fullAddress);
          } else {
            setLocation(`${loc.coords.latitude.toFixed(5)}, ${loc.coords.longitude.toFixed(5)}`);
          }
        }
      } catch (e) {
        Alert.alert('Error', 'No se pudo obtener la ubicación.');
      }
      setGettingLocation(false);
    };
    getLocation();
  }, []);

  const handleSubmit = async () => {
    console.log('🚀 handleSubmit: Starting...');
    console.log('🔍 handleSubmit: photos:', photos);
    console.log('🔍 handleSubmit: user:', user);
    
    if (!dogName || !description || !location) {
      Alert.alert('Campos incompletos', 'Por favor, completa todos los campos obligatorios: nombre, descripción y ubicación.');
      return;
    }

    if (!user || !user.username) {
      Alert.alert('Error de autenticación', 'Por favor, inicia sesión para crear una alerta.');
      return;
    }

    setIsLoading(true);

    try {
      // Paso 1: Crear la alerta con datos textuales
      const alertData = {
        username: user.username,
        type: 'LOST',
        chipNumber: chip || null,
        status: 'ACTIVE',
        sex: 'UNKNOWN',
        date: new Date().toISOString(),
        title: dogName,
        description: description,
        breed: 'mixed',
        postalCode: postalCode,
        countryCode: 'CL', // Placeholder
      };

      const createdAlert = await apiService.createAlert(alertData);
      
      if (!createdAlert || !createdAlert.id) {
        throw new Error('No se recibió el ID de la alerta creada');
      }

      // Paso 2: Subir fotos si hay
      const validPhotos = Array.isArray(photos) ? photos : [];
      if (validPhotos.length > 0) {
        let allPhotosUploadedSuccessfully = true;
        const uploadErrors = [];

        for (const photoUri of validPhotos) {
          try {
            await apiService.uploadPhoto(createdAlert.id, photoUri);
          } catch (uploadError) {
            allPhotosUploadedSuccessfully = false;
            uploadErrors.push(uploadError.message);
            console.error(`Error subiendo foto ${photoUri}:`, uploadError);
          }
        }

        if (!allPhotosUploadedSuccessfully) {
          Alert.alert(
            'Subida Incompleta', 
            `La alerta fue creada pero algunas fotos no pudieron subirse: ${uploadErrors.join(', ')}`,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        } else {
          Alert.alert('Alerta Creada', 'Tu alerta y fotos han sido registradas correctamente.', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
        }
      } else {
        // No hay fotos para subir
        Alert.alert('Alerta Creada', 'Tu alerta ha sido registrada correctamente.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }

      // Limpiar formulario
      setDogName('');
      setDescription('');
      setLocation('');
      setPostalCode(null); // Clear postal code state to null
      setChip('');
      setPhotos([]);

    } catch (error) {
      console.error('Error en handleSubmit:', error);
      
      let errorMessage = 'No se pudo crear la alerta.';
      if (error.message === 'TOKEN_EXPIRED') {
        errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para elegir imagen
  const pickImage = async () => {
    // Asegurar que photos siempre sea un array
    const currentPhotos = Array.isArray(photos) ? photos : [];
    if (currentPhotos.length >= 5) return;
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newPhotos = [...currentPhotos, result.assets[0].uri];
      setPhotos(newPhotos.slice(0, 5));
    }
  };

  // Eliminar foto por índice
  const removePhoto = (idx) => {
    setPhotos((prevPhotos) => {
      // Asegurar que prevPhotos es siempre un array
      const safePhotos = Array.isArray(prevPhotos) ? prevPhotos : [];
      return safePhotos.filter((_, i) => i !== idx);
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start', padding: 24, backgroundColor: '#fff' }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Perro Perdido</Text>
        <Text style={styles.subtitle}>Completa este formulario para avisar a la comunidad que se perdió este perro.</Text>

        <Text style={styles.label}>Nombre del perro</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Rocky"
          value={dogName}
          onChangeText={setDogName}
        />
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={styles.input}
          placeholder="Describe al perro, ropa, señas particulares..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
        <Text style={styles.label}>Número de Chip (opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 900123000123456"
          value={chip}
          onChangeText={setChip}
          keyboardType="numeric"
        />
        <Text style={styles.label}>Ubicación donde se perdió/vio</Text>
        {Constants.expoConfig?.extra?.googlePlacesApiKey ? (
          <GooglePlacesAutocomplete
            placeholder="Buscar dirección o lugar"
            predefinedPlaces={[]}
            minLength={2}
            fetchDetails={true}
            onPress={(data, details = null) => {
              try {
                if (details) {
                  setLocation(details.formatted_address || data.description);
                  // Extract postal code
                  const postalCodeComponent = details.address_components.find(
                    component => component.types.includes('postal_code')
                  );
                  if (postalCodeComponent) {
                    setPostalCode(postalCodeComponent.long_name || postalCodeComponent.short_name);
                  } else {
                    setPostalCode(null); // Set to null if not found
                    console.warn('Postal code not found in Google Places details');
                  }
                } else if (data && data.description) {
                  setLocation(data.description);
                  setPostalCode(null); // Set to null if only description is available
                }
              } catch (error) {
                console.error('Error en GooglePlacesAutocomplete onPress:', error);
              }
            }}
            query={{
              key: Constants.expoConfig.extra.googlePlacesApiKey,
              language: 'es',
              components: 'country:cl',
            }}
            styles={{
              textInput: styles.input,
              listView: { 
                zIndex: 1000,
                elevation: 1000,
                position: 'absolute',
                top: 50,
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 8,
              },
            }}
            enablePoweredByContainer={false}
            debounce={300}
            listViewDisplayed="auto"
            keyboardShouldPersistTaps="handled"
            suppressDefaultStyles={false}
            textInputProps={{
              onChangeText: (text) => {
                // Fallback manual para ubicación
                setLocation(text);
              }
            }}
          />
        ) : (
          <TextInput
            style={styles.input}
            placeholder="Ingresa la ubicación manualmente"
            value={location}
            onChangeText={setLocation}
          />
        )}
        <Text style={styles.label}>Código Postal</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 7500000 (Opcional si Google lo encuentra)"
          value={postalCode || ''} // Show empty string if postalCode is null
          onChangeText={setPostalCode}
          keyboardType="numeric"
        />
        <Text style={styles.label}>Subir fotos (máx 5)</Text>
        <TouchableOpacity
          style={[styles.uploadButton, (Array.isArray(photos) ? photos.length : 0) >= 5 && { opacity: 0.5 }]}
          onPress={pickImage}
          activeOpacity={0.8}
          disabled={(Array.isArray(photos) ? photos.length : 0) >= 5}
        >
          <Text style={styles.uploadButtonText}>Agregar foto</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 12 }}>
          {(Array.isArray(photos) ? photos : []).map((uri, idx) => (
            <View key={uri || idx} style={{ marginRight: 8, marginBottom: 8 }}>
              <Image source={{ uri }} style={{ width: 80, height: 80, borderRadius: 10, borderWidth: 1, borderColor: '#ccc' }} />
              <TouchableOpacity
                onPress={() => removePhoto(idx)}
                style={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  backgroundColor: 'rgba(255,0,0,0.85)',
                  borderRadius: 14,
                  width: 28,
                  height: 28,
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                }}
                activeOpacity={0.8}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, lineHeight: 18 }}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSubmit} activeOpacity={0.8} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Crear Alerta</Text>
          )}
        </TouchableOpacity>
        <View style={{ height: 80 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
  } catch (error) {
    console.error('Error en CreateAlertScreen:', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 18, color: 'red', textAlign: 'center', marginBottom: 16 }}>
          Error al cargar la pantalla
        </Text>
        <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
          {error.message || 'Ha ocurrido un error inesperado'}
        </Text>
        <TouchableOpacity 
          style={{ marginTop: 20, padding: 12, backgroundColor: '#FF9800', borderRadius: 8 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: 'white', fontSize: 16 }}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  uploadButton: {
    backgroundColor: '#eee',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginTop: 4,
  },
  uploadButtonText: {
    color: '#333',
    fontWeight: '500',
    fontSize: 15,
  },
  label: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 4,
  },
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  locationHint: {
    position: 'absolute',
    right: 10,
    bottom: 2,
    fontSize: 12,
    color: '#FF9800',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  locationLoader: {
    position: 'absolute',
    right: 12,
    top: 16,
  },
});

export default CreateAlertScreen;
