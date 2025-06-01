import React, { useState, useRef, useContext, useEffect } from 'react';
import Constants from 'expo-constants';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import apiService from '../../services/apiService';
import { AuthContext } from '../../context/AuthContext';

const FoundDogAlertScreen = ({ navigation, route }) => {
  const authContext = useContext(AuthContext);
  const { user } = authContext;

  // Determinar si estamos en modo edición y obtener datos existentes
  const existingAlert = route.params?.existingAlert;
  const isEditMode = !!existingAlert;
  const alertId = existingAlert?.id;

  // Estados del formulario inicializados para creación o edición
  const [title, setTitle] = useState(existingAlert?.title || '');
  const [description, setDescription] = useState(existingAlert?.description || '');
  const [photos, setPhotos] = useState(existingAlert?.photoUrls?.map(p => ({ uri: p.presignedUrl, s3ObjectKey: p.s3ObjectKey, id: p.s3ObjectKey })) || []); 
  const [breed, setBreed] = useState(existingAlert?.breed || '');
  const [sex, setSex] = useState(existingAlert?.sex || 'UNKNOWN');
  const [location, setLocation] = useState(existingAlert?.location ? { latitude: existingAlert.location.latitude, longitude: existingAlert.location.longitude } : null);
  const [locationAddress, setLocationAddress] = useState(existingAlert?.locationAddress || '');
  const [postalCode, setPostalCode] = useState(existingAlert?.postalCode || '');
  const [countryCode, setCountryCode] = useState(existingAlert?.countryCode || '');

  // Estados refactorizados para el chip
  const [chipStatus, setChipStatus] = useState('no_sabe'); // 'si', 'no', 'no_sabe'
  const [actualChipNumber, setActualChipNumber] = useState(''); // El valor numérico del chip

  // Nuevos estados para manejar la edición de fotos
  const [photosToDelete, setPhotosToDelete] = useState(new Set()); // Almacena s3ObjectKey de fotos existentes a eliminar

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const autoCompleteRef = useRef(null);

  useEffect(() => {
    if (isEditMode && existingAlert) {
      console.log('CreateFoundAlertScreen en MODO EDICIÓN. Alerta existente:', JSON.stringify(existingAlert));
      // Inicializar estados del chip basados en existingAlert
      const ecn = existingAlert.chipNumber;
      if (ecn && ecn !== 'NO_SABE' && ecn !== 'NO_TIENE_CHIP' && ecn !== 'no_sabe' && ecn !== 'no') {
        setChipStatus('si');
        setActualChipNumber(ecn);
      } else if (ecn === 'NO_SABE' || ecn === 'no_sabe') {
        setChipStatus('no_sabe');
        setActualChipNumber('');
      } else { // Incluye '', 'NO_TIENE_CHIP', 'no', o cualquier otro caso no reconocido como 'si' o 'no_sabe'
        setChipStatus('no');
        setActualChipNumber('');
      }
    }
  }, [isEditMode, existingAlert]);

  const handleUseCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'No se pudo obtener la ubicación.');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      let address = null;
      let currentPostalCode = '';
      let currentCountryCode = '';
      try {
        let geo = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geo && geo.length > 0) {
          const addr = geo[0];
          address = `${addr.street || ''} ${addr.name || ''}, ${addr.city || ''}, ${addr.region || ''}`.replace(/, ,/g, ',').trim();
          currentPostalCode = addr.postalCode || '';
          currentCountryCode = addr.isoCountryCode || addr.country || '';
        }
      } catch (geoError) { console.error("Error en geocodificación inversa: ", geoError); }
      const finalAddress = address || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      setLocationAddress(finalAddress);
      setPostalCode(currentPostalCode);
      setCountryCode(currentCountryCode);
      autoCompleteRef.current?.setAddressText(finalAddress);
    } catch (e) {
      Alert.alert('Error', `No se pudo obtener la ubicación: ${e.message}`);
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
      const filename = asset.fileName || `photo_${Date.now()}.${uri.split('.').pop()}`;
      setPhotos([...currentPhotos, { uri, filename }].slice(0, 5));
    }
  };

  const removePhoto = (photoToRemove) => {
    if (photoToRemove.s3ObjectKey) { // Es una foto existente
      setPhotosToDelete(prev => new Set(prev).add(photoToRemove.s3ObjectKey));
      // También la quitamos de 'photos' para que desaparezca de la UI inmediatamente
      setPhotos(prevPhotos => prevPhotos.filter(p => p.s3ObjectKey !== photoToRemove.s3ObjectKey));
    } else { // Es una foto nueva, aún no subida
      setPhotos(prevPhotos => prevPhotos.filter(p => p.uri !== photoToRemove.uri));
    }
  };

  const handleSubmit = async () => {
    console.log('USER OBJECT INSIDE HANDLE_SUBMIT:', JSON.stringify(user, null, 2)); // LOG DEL USER DENTRO DE HANDLESUBMIT
    console.log('🚀 handleSubmit FoundDog: Starting...');
    console.log('🔍 Values before validation:');
    console.log('  - Title:', title);
    console.log('  - Description:', description);
    console.log('  - LocationAddress:', locationAddress);
    console.log('  - PostalCode:', postalCode);

    if (!user || !user.username) {
      Alert.alert('Error de autenticación', 'Por favor, inicia sesión para crear una alerta.');
      return;
    }

    let newErrors = {};
    if (!title.trim()) newErrors.title = 'El título es requerido.';
    if (!description.trim()) newErrors.description = 'La descripción es requerida.';
    if (!locationAddress) newErrors.locationAddress = 'La dirección es requerida.';
    if (!postalCode) newErrors.postalCode = 'El código postal es requerido.';
    // No validamos photos aquí porque en edición podrían no añadirse nuevas

    const currentErrors = newErrors;
    console.log('VALIDATION ERRORS:', JSON.stringify(currentErrors, null, 2)); // LOG DE ERRORES DE VALIDACIÓN
    setErrors(currentErrors);

    if (Object.keys(currentErrors).length > 0) {
      return;
    }

    try {
      setIsLoading(true);
      if (isEditMode && alertId) {
        // Lógica de Actualización (PUT /alerts/{id})
        const textDataToUpdate = {
          username: user?.email,
          type: 'SEEN',
          status: 'ACTIVE',
          title,
          description,
          breed,
          sex,
          chipNumber: chipStatus === 'si' ? actualChipNumber : (chipStatus === 'no_sabe' ? 'NO_SABE' : 'NO_TIENE_CHIP'),
          location,
          locationAddress,
          postalCode,
          countryCode,
          date: existingAlert?.date,
        };
        
        console.log(`MODO EDICIÓN: Alert ID: ${alertId}`);
        console.log('MODO EDICIÓN: textDataToUpdate:', JSON.stringify(textDataToUpdate, null, 2));

        // Preparar fotos nuevas (solo URIs locales sin s3ObjectKey)
        const newLocalPhotos = photos
          .filter(p => p.uri && !p.s3ObjectKey && p.uri.startsWith('file:'))
          .map(p => p.uri);
        
        // Preparar fotos para eliminar (s3ObjectKeys marcados para eliminación)
        const photosToDeleteArray = Array.from(photosToDelete);

        console.log('MODO EDICIÓN: Nuevas fotos a subir:', newLocalPhotos);
        console.log('MODO EDICIÓN: Fotos a eliminar:', photosToDeleteArray);

        try {
          const updateResponse = await apiService.updateAlertWithPhotos(alertId, textDataToUpdate, {
            newPhotos: newLocalPhotos,
            photosToDelete: photosToDeleteArray
          });
          
          console.log('✅ Respuesta de updateAlertWithPhotos:', updateResponse);
          
          setIsLoading(false);
          Alert.alert(
            'Alerta Actualizada',
            `La alerta ha sido actualizada exitosamente.`, 
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
          
        } catch (error) {
          console.error('❌ ERROR en updateAlertWithPhotos:', error);
          setIsLoading(false);
          Alert.alert('Error al Actualizar', `Hubo un problema al actualizar la alerta: ${error.message}`);
        }

      } else {
        const alertData = {
          username: user?.email, // CAMBIADO A user.email PARA PRUEBA Y CONSISTENCIA
          type: 'SEEN',
          status: 'ACTIVE',
          title,
          description,
          breed,
          sex,
          // Chip number logic for creation
          chipNumber: chipStatus === 'si' ? actualChipNumber : (chipStatus === 'no_sabe' ? 'NO_SABE' : 'NO_TIENE_CHIP'),
          location, // Objeto { latitude, longitude }
          locationAddress,
          postalCode,
          countryCode,
          date: new Date().toISOString(), // Para nuevas alertas, usar la fecha actual
          photoFilenames: photos.filter(p => !p.s3ObjectKey).map(photo => photo.filename || photo.uri.split('/').pop()), 
        };

        console.log('Datos a enviar:', JSON.stringify(alertData)); 
        console.log('Fotos actuales (estado):', JSON.stringify(photos)); 

        const response = await apiService.createAlert(alertData);
        console.log('Respuesta completa del backend en handleSubmit:', JSON.stringify(response)); 

        setIsLoading(false);
        if (response && response.id) {
          let allUploadsSuccessful = true;
          if (response.photoUrls && response.photoUrls.length > 0 && photos.filter(p => !p.s3ObjectKey).length > 0) {
            console.log('Iniciando subida de fotos NUEVAS a S3...');
            setIsLoading(true); 
            try {
              const newPhotosToUpload = photos.filter(p => !p.s3ObjectKey);
              for (let i = 0; i < response.photoUrls.length; i++) {
                const photoDataForS3 = response.photoUrls[i]; 
                const localPhoto = newPhotosToUpload.find(p => (p.filename || p.uri.split('/').pop()) === photoDataForS3.s3ObjectKey.split('__').pop()); 

                if (photoDataForS3 && photoDataForS3.presignedUrl && localPhoto && localPhoto.uri) {
                  console.log(`Subiendo NUEVA foto ${i + 1} (${localPhoto.uri}) a ${photoDataForS3.presignedUrl}`);
                  let fileType = localPhoto.type || 'image/jpeg';
                  if (localPhoto.uri.endsWith('.png')) fileType = 'image/png';
                  else if (localPhoto.uri.endsWith('.jpg') || localPhoto.uri.endsWith('.jpeg')) fileType = 'image/jpeg';
                  await uploadToS3(photoDataForS3.presignedUrl, localPhoto.uri, fileType);
                } else {
                  console.warn(`Datos incompletos para subir NUEVA foto ${i + 1}:`, { photoDataForS3, localPhoto });
                }
              }
            } catch (uploadError) {
              console.error('Error durante la subida de una o más fotos NUEVAS a S3:', uploadError);
              allUploadsSuccessful = false;
              Alert.alert('Error de Subida', 'La alerta se creó, pero ocurrió un error al subir una o más fotos nuevas. Por favor, intenta editar la alerta para añadir las fotos.');
            }
            setIsLoading(false);
          }

          if (allUploadsSuccessful) {
            Alert.alert(
              'Alerta Registrada',
              `ID: ${response.id}. Fotos procesadas y subidas.`,
              [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
          } 
          
        } else {
          const errorMessage = response && response.message ? response.message : 'No se pudo obtener el ID de la alerta o hubo un error desconocido.';
          Alert.alert('Error', errorMessage);
        }
      }
    } catch (error) {
      setIsLoading(false);
      let errorMessage = 'No se pudo crear la alerta.';
      if (error.message === 'TOKEN_EXPIRED') {
        errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView 
          contentContainerStyle={{ padding: 20, paddingBottom: 160 }} 
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Perro Encontrado</Text>
          <Text style={styles.subtitle}>Completa este formulario para ayudar a este perro a volver a casa.</Text>

          <Text style={styles.label}>Título de la Alerta</Text>
          <TextInput
            style={[styles.input, { alignSelf: 'center', width: 340, maxWidth: '95%' }]}
            placeholder="Ej: Encontrado perro pequeño en [Parque]"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Descripción Principal</Text>
          <TextInput
            style={[styles.input, { minHeight: 80, textAlignVertical: 'top', alignSelf: 'center', width: 340, maxWidth: '95%' }]}
            placeholder="Describe al perro: color, tamaño, comportamiento, collar, etc."
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.label}>Raza (si se conoce)</Text>
          <TextInput
            style={[styles.input, { alignSelf: 'center', width: 340, maxWidth: '95%' }]}
            placeholder="Ej: Labrador, Mestizo"
            value={breed}
            onChangeText={setBreed}
          />

          <Text style={styles.label}>Sexo del Perro Encontrado</Text>
          <View style={styles.sexSelectorContainer}>
            <TouchableOpacity 
              style={[styles.sexOption, sex === 'MALE' && styles.sexOptionSelectedFound]} 
              onPress={() => setSex('MALE')}
            >
              <Text style={[styles.chipOptionText, sex === 'MALE' && styles.sexOptionSelectedText]}>Macho</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.sexOption, sex === 'FEMALE' && styles.sexOptionSelectedFound]} 
              onPress={() => setSex('FEMALE')}
            >
              <Text style={[styles.chipOptionText, sex === 'FEMALE' && styles.sexOptionSelectedText]}>Hembra</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.sexOption, sex === 'UNKNOWN' && styles.sexOptionUnknownSelectedFound]} 
              onPress={() => setSex('UNKNOWN')}
            >
              <Text style={[styles.chipOptionText, sex === 'UNKNOWN' && styles.sexOptionSelectedText]}>No sé</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Ubicación donde se encontró</Text>
          <GooglePlacesAutocomplete
            ref={autoCompleteRef}
            placeholder="Buscar dirección..."
            minLength={3}
            fetchDetails={true}
            onPress={(data, details = null) => {
              console.log('GooglePlacesAutocomplete onPress triggered');
              console.log('  - data:', JSON.stringify(data));
              console.log('  - details:', JSON.stringify(details));
              if (details) {
                const addressToSet = details.formatted_address || data.description;
                console.log('  - Setting locationAddress (from details):', addressToSet);
                setLocationAddress(addressToSet);
                setPostalCode(details.address_components?.find(comp => comp.types.includes('postal_code'))?.short_name || '');
                setCountryCode(details.address_components?.find(comp => comp.types.includes('country'))?.short_name || '');
              } else {
                const addressToSet = data.description;
                console.log('  - Setting locationAddress (from data.description as fallback):', addressToSet);
                setLocationAddress(addressToSet);
              }
              Keyboard.dismiss();
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
            predefinedPlaces={[]} 
            textInputProps={{}} 
            debounce={300}
            listViewDisplayed="auto"
            keyboardShouldPersistTaps="handled"
            suppressDefaultStyles={false}
          />
          <View style={{ height: 60 }} />
          <TouchableOpacity
            style={styles.geoButton}
            onPress={handleUseCurrentLocation}
          >
            <Text style={styles.geoButtonText}>Usar mi ubicación actual</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Código Postal *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 9876543"
            value={postalCode}
            onChangeText={setPostalCode}
            keyboardType="numeric" 
          />

          <Text style={styles.label}>Fotos (máx. 5)</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 12 }}>
            {photos.map((photoItem, idx) => (
              <View key={photoItem.id || photoItem.uri} style={{ marginRight: 8, marginBottom: 8, position: 'relative' }}>
                <Image source={{ uri: photoItem.uri }} style={{ width: 80, height: 80, borderRadius: 10, borderWidth: 1, borderColor: '#ccc' }} />
                <TouchableOpacity
                  onPress={() => removePhoto(photoItem)} // Pasar el objeto photoItem completo
                  style={styles.removePhotoButton}
                >
                  <Text style={styles.removePhotoButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            {photos.length < 5 && (
              <TouchableOpacity
                style={{
                  backgroundColor: '#eee',
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 18,
                  alignSelf: 'flex-start',
                  marginBottom: 8,
                  marginTop: 4,
                }}
                onPress={pickImage}
                activeOpacity={0.8}
              >
                <Text style={{ color: '#333', fontWeight: '500', fontSize: 15 }}>Agregar foto</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.label}>¿El perro tiene chip?</Text>
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <TouchableOpacity
              style={[styles.chipOption, chipStatus === 'no_sabe' && styles.chipOptionSelected]}
              onPress={() => setChipStatus('no_sabe')}
            >
              <Text style={styles.chipOptionText}>No sé</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.chipOption, chipStatus === 'si' && styles.chipOptionSelected]}
              onPress={() => setChipStatus('si')}
            >
              <Text style={styles.chipOptionText}>Sí</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.chipOption, chipStatus === 'no' && styles.chipOptionSelected]}
              onPress={() => setChipStatus('no')}
            >
              <Text style={styles.chipOptionText}>No</Text>
            </TouchableOpacity>
          </View>
          {chipStatus === 'si' && (
            <TextInput
              style={styles.input}
              value={actualChipNumber} // Usar actualChipNumber
              onChangeText={setActualChipNumber} // Modificar actualChipNumber
              placeholder="Número de chip (si lo tienes)"
              keyboardType="numeric"
            />
          )}

          <TouchableOpacity
            style={[styles.button, { alignSelf: 'center', width: 340, maxWidth: '95%' }]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{isEditMode ? 'Guardar Cambios' : 'Crear Alerta'}</Text>
            )}
          </TouchableOpacity>        
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    marginTop: 10,
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    marginBottom: 8,
    backgroundColor: '#fafafa',
  },
  geoButton: {
    backgroundColor: '#4CAF50', 
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  geoButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 15,
  },
  chipOption: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
    backgroundColor: '#fafafa',
  },
  chipOptionSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  chipOptionText: {
    color: '#333',
    fontWeight: '500',
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
  sexOptionSelectedFound: {
    backgroundColor: '#4CAF50', 
    borderColor: '#4CAF50',
  },
  sexOptionUnknownSelectedFound: {
    backgroundColor: '#aaa',
    borderColor: '#aaa',
  },
  sexOptionSelectedText: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignSelf: 'stretch',
    marginTop: 18,
    marginBottom: 18,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  removePhotoButton: {
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
  },
  removePhotoButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    lineHeight: 18, // Ajustar para centrar la '×'
  },
});

// Función auxiliar para subir un archivo a S3 usando la URL pre-firmada
async function uploadToS3(presignedUrl, localFileUri, fileType) {
  try {
    // Fetch local asset
    const assetResponse = await fetch(localFileUri);
    const blob = await assetResponse.blob();

    console.log(`Subiendo blob (type: ${blob.type}, size: ${blob.size}) a S3 con Content-Type: ${fileType}`);

    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': fileType, 
      },
      body: blob,
    });

    if (!uploadResponse.ok) {
      let errorBody = 'Error desconocido durante la subida a S3.';
      try {
        errorBody = await uploadResponse.text();
      } catch (e) { /* ignorar error al leer el cuerpo */ }
      console.error(`Error subiendo a S3 (status ${uploadResponse.status}): ${errorBody}`);
      throw new Error(`Fallo al subir archivo a S3: ${uploadResponse.status} - ${errorBody}`);
    }
    console.log('Archivo subido a S3 exitosamente:', presignedUrl.split('?')[0]); 
    return uploadResponse;
  } catch (error) {
    console.error('Excepción durante la subida a S3:', error);
    throw error; 
  }
}

export default FoundDogAlertScreen;
