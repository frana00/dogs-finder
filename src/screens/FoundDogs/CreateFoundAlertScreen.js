import React, { useState, useRef, useContext } from 'react';
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

const FoundDogAlertScreen = ({ navigation }) => {
  try {
    const authContext = useContext(AuthContext);
    
    if (!authContext) {
      console.error('AuthContext not found in FoundDogAlertScreen');
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Error: Contexto de autenticación no disponible</Text>
        </View>
      );
    }
    
    const { user } = authContext;
    const autoCompleteRef = useRef(null);
    const [description, setDescription] = useState('');
    const [locationAddress, setLocationAddress] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [countryCode, setCountryCode] = useState('');
    const [gettingLocation, setGettingLocation] = useState(false);
    const [photos, setPhotos] = useState([]); 
    const [foundDate, setFoundDate] = useState(new Date().toISOString()); 
    const [chipStatus, setChipStatus] = useState('no_sabe'); 
    const [chipNumber, setChipNumber] = useState('');
    const [dogSafe, setDogSafe] = useState('si'); 
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [title, setTitle] = useState(''); 
    const [sex, setSex] = useState('UNKNOWN'); 
    const [breed, setBreed] = useState(''); 

    const handleUseCurrentLocation = async () => {
      setGettingLocation(true);
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setGettingLocation(false);
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
      setGettingLocation(false);
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

    const removePhoto = (idx) => {
      setPhotos((prevPhotos) => {
        const safePhotos = Array.isArray(prevPhotos) ? prevPhotos : [];
        return safePhotos.filter((_, i) => i !== idx);
      });
    };

    const handleSubmit = async () => {
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

      if (!description || !locationAddress || !title.trim() || !postalCode.trim()) {
        Alert.alert('Campos incompletos', 'Por favor, completa todos los campos obligatorios: Título, Descripción, Ubicación y Código Postal.');
        return;
      }

      setIsLoading(true);

      try {
        const photoFilenames = photos.map(p => p.filename);
        let fullDescription = description.trim();
        if (notes.trim()) {
          fullDescription += `\nNotas Adicionales: ${notes.trim()}`;
        }
        fullDescription += dogSafe === 'si' ? ' (El perro está resguardado)' : ' (El perro NO está resguardado, podría necesitar ayuda urgente)';

        const alertData = {
          username: user.username,
          type: 'SEEN',
          chipNumber: chipStatus === 'si' ? chipNumber.trim() : "",
          status: 'ACTIVE',
          sex: sex, 
          date: new Date(foundDate).toISOString(), 
          title: title.trim(), 
          description: fullDescription,
          breed: breed.trim() || 'Mestizo', 
          postalCode: postalCode, 
          countryCode: countryCode.toUpperCase(), 
          photoFilenames: photoFilenames, // El backend procesará esto
        };

        // El backend crea la alerta y maneja la subida de las fotos internamente.
        const response = await apiService.createAlert(alertData);
        
        console.log('Respuesta completa del backend en handleSubmit:', JSON.stringify(response)); // DEBUG

        setIsLoading(false);
        if (response && response.id) {
          // Éxito al crear la alerta en la BD, ahora subir fotos a S3 si hay
          let allUploadsSuccessful = true;
          if (response.photoUrls && response.photoUrls.length > 0 && photos.length > 0) {
            console.log('Iniciando subida de fotos a S3...');
            setIsLoading(true); // Mostrar indicador de carga para las subidas S3
            try {
              for (let i = 0; i < response.photoUrls.length; i++) {
                const photoDataForS3 = response.photoUrls[i];
                const localPhoto = photos[i]; // Asumimos que el orden coincide

                if (photoDataForS3 && photoDataForS3.presignedUrl && localPhoto && localPhoto.uri) {
                  console.log(`Subiendo foto ${i + 1} a ${photoDataForS3.presignedUrl}`);
                  // Determinar fileType (MIME type)
                  let fileType = localPhoto.type || 'image/jpeg'; // Default a jpeg
                  if (localPhoto.uri.endsWith('.png')) fileType = 'image/png';
                  else if (localPhoto.uri.endsWith('.jpg') || localPhoto.uri.endsWith('.jpeg')) fileType = 'image/jpeg';
                  // Puedes añadir más tipos si es necesario o usar una librería para detectar MIME

                  await uploadToS3(photoDataForS3.presignedUrl, localPhoto.uri, fileType);
                } else {
                  console.warn(`Datos incompletos para subir foto ${i + 1}:`, { photoDataForS3, localPhoto });
                }
              }
            } catch (uploadError) {
              console.error('Error durante la subida de una o más fotos a S3:', uploadError);
              allUploadsSuccessful = false;
              Alert.alert('Error de Subida', 'La alerta se creó, pero ocurrió un error al subir una o más fotos. Por favor, intenta editar la alerta para añadir las fotos.');
            }
            setIsLoading(false);
          }

          if (allUploadsSuccessful) {
            const photoInfoForDebug = response.photoUrls ? JSON.stringify(response.photoUrls) : (response.photos ? JSON.stringify(response.photos) : 'No photo data');
            Alert.alert(
              'Alerta Registrada',
              `ID: ${response.id}. Fotos procesadas y subidas: ${photoInfoForDebug}`,
              [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
          } // El caso de error de subida ya mostró una alerta
          
        } else {
          const errorMessage = response && response.message ? response.message : 'No se pudo obtener el ID de la alerta o hubo un error desconocido.';
          Alert.alert('Error', errorMessage);
        }

        // Limpiar formulario
        setDescription('');
        setLocationAddress('');
        setPostalCode('');
        setCountryCode('');
        setPhotos([]);
        setFoundDate(new Date().toISOString()); 
        setChipStatus('no_sabe');
        setChipNumber('');
        setDogSafe('si');
        setNotes('');
        setTitle('');
        setSex('UNKNOWN');
        setBreed('');

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

            <Text style={styles.label}>Fecha y Hora en que fue Encontrado</Text>
            <TextInput
              style={[styles.input, { alignSelf: 'center', width: 340, maxWidth: '95%' }]}
              value={foundDate.slice(0,16).replace('T', ' ')} 
              placeholder="YYYY-MM-DDTHH:MM"
              onChangeText={(text) => setFoundDate(text)} 
            />

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
              disabled={gettingLocation}
            >
              {gettingLocation ? (
                <ActivityIndicator size="small" color="#444" />
              ) : (
                <Text style={styles.geoButtonText}>Usar mi ubicación actual</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.label}>Código Postal *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 9876543"
              value={postalCode}
              onChangeText={setPostalCode}
              keyboardType="numeric" // O "default" si puede tener letras
            />

            <Text style={styles.label}>Fotos (máx 5)</Text>
            <TouchableOpacity
              style={[styles.uploadButton, (Array.isArray(photos) ? photos.length : 0) >= 5 && { opacity: 0.5 }]}
              onPress={pickImage}
              activeOpacity={0.8}
              disabled={(Array.isArray(photos) ? photos.length : 0) >= 5}
            >
              <Text style={styles.uploadButtonText}>Agregar foto</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 12 }}>
              {Array.isArray(photos) && photos.map((uri, idx) => (
                <View key={uri.uri} style={{ marginRight: 8, marginBottom: 8 }}>
                  <Image source={{ uri: uri.uri }} style={{ width: 80, height: 80, borderRadius: 10, borderWidth: 1, borderColor: '#ccc' }} />
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
                value={chipNumber}
                onChangeText={setChipNumber}
                placeholder="Número de chip (si lo tienes)"
              />
            )}

            <Text style={styles.label}>¿El perro está seguro contigo?</Text>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              <TouchableOpacity
                style={[styles.chipOption, dogSafe === 'si' && styles.chipOptionSelected]}
                onPress={() => setDogSafe('si')}
              >
                <Text style={styles.chipOptionText}>Sí, lo tengo en casa/refugio</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chipOption, dogSafe === 'no' && styles.chipOptionSelected]}
                onPress={() => setDogSafe('no')}
              >
                <Text style={styles.chipOptionText}>No, sigue en la calle</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Notas adicionales</Text>
            <TextInput
              style={[styles.input, { minHeight: 60, textAlignVertical: 'top', alignSelf: 'center', width: 340, maxWidth: '95%' }]}
              placeholder="Cualquier otro dato relevante"
              value={notes}
              onChangeText={setNotes}
              multiline
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
            <TouchableOpacity
              style={[styles.button, { alignSelf: 'center', width: 340, maxWidth: '95%' }]}
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Crear Alerta</Text>
              )}
            </TouchableOpacity>        
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  } catch (error) {
    console.error('Error en CreateFoundAlertScreen:', error);
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
  fieldHelp: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
    marginLeft: 2,
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
    console.log('Archivo subido a S3 exitosamente:', presignedUrl.split('?')[0]); // Log sin query params
    return uploadResponse;
  } catch (error) {
    console.error('Excepción durante la subida a S3:', error);
    throw error; // Re-throw para que sea capturado por el llamador
  }
}

export default FoundDogAlertScreen;
