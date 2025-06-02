import React, { useState, useEffect, useContext } from 'react';
import Constants from 'expo-constants';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, Image } from 'react-native';
import * as Location from 'expo-location';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import * as ImagePicker from 'expo-image-picker';
import apiService from '../../services/apiService';
import { AuthContext } from '../../context/AuthContext';

const CreateAlertScreen = ({ navigation, route }) => {
  try {
    const authContext = useContext(AuthContext);
    
    if (!authContext) {
      console.error('AuthContext not found');
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Error: Contexto de autenticación no disponible</Text>
        </View>
      );
    }
    
    const { user } = authContext;
    
    // Determine if we're in edit mode and get existing data
    const existingAlert = route.params?.existingAlert;
    const isEditMode = !!existingAlert;
    const alertId = existingAlert?.id;
    
    const [dogName, setDogName] = useState(existingAlert?.title?.replace('Perro perdido: ', '') || '');
    const [breed, setBreed] = useState(existingAlert?.breed || '');
    const [description, setDescription] = useState(existingAlert?.description || '');
    const [chip, setChip] = useState(existingAlert?.chipNumber || '');
    const [locationAddress, setLocationAddress] = useState(existingAlert?.locationAddress || '');
    const [postalCode, setPostalCode] = useState(existingAlert?.postalCode || '');
    const [countryCode, setCountryCode] = useState(existingAlert?.countryCode || '');
    const [gettingLocation, setGettingLocation] = useState(false);
    const [photos, setPhotos] = useState(existingAlert?.photoUrls?.map(p => ({ uri: p.presignedUrl, s3ObjectKey: p.s3ObjectKey, id: p.s3ObjectKey, type: 'existing' })) || []); 
    const [isLoading, setIsLoading] = useState(false);
    const [title, setTitle] = useState(existingAlert?.title || '');
    const [sex, setSex] = useState(existingAlert?.sex || 'UNKNOWN');

    console.log('🔍 CreateAlertScreen: Component rendered, photos:', photos);
    console.log('🔍 CreateAlertScreen: user:', user);
    console.log('🔍 CreateAlertScreen: photos type:', typeof photos, 'isArray:', Array.isArray(photos));

  useEffect(() => {
    const getCurrentLocation = async () => {
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
          let addresses = await Location.reverseGeocodeAsync({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude
          });
          if (addresses && addresses.length > 0) {
            const addr = addresses[0];
            const fullAddress = `${addr.street || ''} ${addr.name || ''}, ${addr.city || addr.district || ''}, ${addr.region || ''}, ${addr.country || ''}`.replace(/, ,/g, ',').trim();
            setLocationAddress(fullAddress);
            setPostalCode(addr.postalCode || '');
            setCountryCode(addr.isoCountryCode || addr.country || '');
          } else {
            setLocationAddress(`${loc.coords.latitude.toFixed(5)}, ${loc.coords.longitude.toFixed(5)}`);
            setPostalCode('');
            setCountryCode('');
          }
        }
      } catch (e) {
        Alert.alert('Error', `No se pudo obtener la ubicación: ${e.message}`);
        setPostalCode('');
        setCountryCode('');
      }
      setGettingLocation(false);
    };
    getCurrentLocation();
  }, []);

  const handleSubmit = async () => {
    console.log('🚀 handleSubmit: Starting...');
    console.log('🔍 handleSubmit: photos:', photos);
    console.log('🔍 handleSubmit: user:', user);
    console.log('🔍 handleSubmit: isEditMode:', isEditMode);
    
    if (!dogName || !description || !locationAddress || !title) {
      Alert.alert('Campos incompletos', 'Por favor, completa todos los campos obligatorios: Nombre, Título, Descripción y Ubicación.');
      return;
    }

    if (!user || !user.username) {
      Alert.alert('Error de autenticación', 'Por favor, inicia sesión para crear una alerta.');
      return;
    }

    setIsLoading(true);

    try {
      const photoFilenames = photos.map(p => p.filename);

      const alertData = {
        username: user.username,
        type: 'LOST',
        chipNumber: chip || "",
        status: 'ACTIVE',
        sex: sex,
        date: isEditMode ? existingAlert.date : new Date().toISOString(),
        title: title.trim(),
        description: description.trim(),
        breed: breed.trim() || 'Mestizo',
        postalCode: postalCode,
        countryCode: countryCode.toUpperCase(),
        photoFilenames: photoFilenames,
      };

      let response;
      if (isEditMode && alertId) {
        // Update existing alert
        console.log('Updating alert with ID:', alertId);
        response = await apiService.updateAlert(alertId, alertData);
      } else {
        // Create new alert
        response = await apiService.createAlert(alertData);
      }
      
      console.log('Respuesta completa del backend en handleSubmit (LostDog):', JSON.stringify(response));

      setIsLoading(false);
      if (response && response.id) { 
        let feedbackMessage = isEditMode 
          ? `Tu alerta (ID: ${response.id}) ha sido actualizada.`
          : `Tu alerta (ID: ${response.id}) ha sido registrada.`;
        
        if (photoFilenames.length > 0) {
          if (response.photoUrls && response.photoUrls.length > 0) {
            feedbackMessage += `\n${response.photoUrls.length} foto(s) procesada(s).`;
          } else {
            feedbackMessage += `\nLas fotos no pudieron ser procesadas por el servidor.`;
          }
        }

        const alertTitle = isEditMode ? 'Alerta Actualizada' : 'Alerta Registrada';
        Alert.alert(alertTitle, feedbackMessage, [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);

        if (!isEditMode) {
          // Clear form only for new alerts
          setDogName('');
          setBreed('');
          setDescription('');
          setLocationAddress('');
          setPostalCode('');
          setCountryCode('');
          setChip('');
          setPhotos([]);
          setTitle('');
          setSex('UNKNOWN');
        }

      } else {
        const errorMessage = response && response.message ? response.message : 'No se pudo obtener el ID de la alerta o hubo un error desconocido.'; 
        Alert.alert('Error', errorMessage);
      }
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

  const pickImage = async () => {
    const currentPhotos = Array.isArray(photos) ? photos : [];
    if (currentPhotos.length >= 5) return;
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const uri = asset.uri;
      const filename = asset.fileName || `photo_${Date.now()}.${asset.uri.split('.').pop()}`;
      const mimeType = asset.mimeType || asset.type; // Get MIME type
      const photoId = `new_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`; // Generate unique ID
      
      setPhotos([...currentPhotos, { id: photoId, uri, filename, mimeType, type: 'new' }].slice(0, 5));
    }
  };

  const removePhoto = (idx) => {
    setPhotos((prevPhotos) => {
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
        <Text style={styles.title}>{isEditMode ? 'Editar Perro Perdido' : 'Perro Perdido'}</Text>
        <Text style={styles.subtitle}>{isEditMode ? 'Actualiza los datos de esta alerta.' : 'Completa este formulario para avisar a la comunidad que se perdió este perro.'}</Text>

        <Text style={styles.label}>Nombre del Perro</Text>
        <TextInput style={styles.input} placeholder="Ej: Bobby, Luna" value={dogName} onChangeText={setDogName} />

        <Text style={styles.label}>Título de la Alerta</Text>
        <TextInput style={styles.input} placeholder="Ej: Se busca urgentemente en [Barrio]" value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Raza</Text>
        <TextInput style={styles.input} placeholder="Ej: Labrador, Mestizo" value={breed} onChangeText={setBreed} />

        <Text style={styles.label}>Sexo del Perro *</Text>
        <View style={styles.sexSelectorContainer}>
          <TouchableOpacity 
            style={[styles.sexOption, sex === 'MALE' && styles.sexOptionSelected]} 
            onPress={() => setSex('MALE')}
          >
            <Text style={[styles.sexOptionText, sex === 'MALE' && styles.sexOptionSelectedText]}>Macho</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sexOption, sex === 'FEMALE' && styles.sexOptionSelected]} 
            onPress={() => setSex('FEMALE')}
          >
            <Text style={[styles.sexOptionText, sex === 'FEMALE' && styles.sexOptionSelectedText]}>Hembra</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sexOption, sex === 'UNKNOWN' && styles.sexOptionUnknownSelected]} 
            onPress={() => setSex('UNKNOWN')}
          >
            <Text style={[styles.sexOptionText, sex === 'UNKNOWN' && styles.sexOptionSelectedText]}>No sé</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Número de Chip (opcional)</Text>
        <TextInput style={styles.input} placeholder="Número de identificación del chip" value={chip} onChangeText={setChip} keyboardType="numeric" />

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
                  setLocationAddress(details.formatted_address || data.description);
                  const postalCodeComponent = details.address_components.find(
                    component => component.types.includes('postal_code')
                  );
                  if (postalCodeComponent) {
                    setPostalCode(postalCodeComponent.long_name || postalCodeComponent.short_name);
                  } else {
                    setPostalCode(null); 
                    console.warn('Postal code not found in Google Places details');
                  }
                } else if (data && data.description) {
                  setLocationAddress(data.description);
                  setPostalCode(null); 
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
                setLocationAddress(text);
              }
            }}
          />
        ) : (
          <TextInput
            style={styles.input}
            placeholder="Ingresa la ubicación manualmente"
            value={locationAddress}
            onChangeText={setLocationAddress}
          />
        )}
        <Text style={styles.label}>Código Postal</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 7500000 (Opcional si Google lo encuentra)"
          value={postalCode || ''}
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
          {(Array.isArray(photos) ? photos : []).map((photo, idx) => (
            <View key={photo.id || photo.uri || idx} style={{ marginRight: 8, marginBottom: 8 }}>
              <Image source={{ uri: photo.uri }} style={{ width: 80, height: 80, borderRadius: 10, borderWidth: 1, borderColor: '#ccc' }} />
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
            <Text style={styles.buttonText}>{isEditMode ? 'Guardar Cambios' : 'Crear Alerta'}</Text>
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
  sexSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  sexOption: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  sexOptionSelected: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  sexOptionUnknownSelected: {
    backgroundColor: '#aaa',
    borderColor: '#aaa',
  },
  sexOptionText: {
    color: '#333',
    fontWeight: '500',
  },
  sexOptionSelectedText: {
    color: '#fff',
  }
});

export default CreateAlertScreen;
