import React, { useState, useRef } from 'react';
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

const FoundDogAlertScreen = ({ navigation }) => {
  const autoCompleteRef = useRef(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [foundDate, setFoundDate] = useState(new Date().toISOString().slice(0, 16)); // yyyy-mm-ddThh:mm
  const [chipStatus, setChipStatus] = useState('no_sabe'); // 'no_sabe', 'si', 'no'
  const [chipNumber, setChipNumber] = useState('');
  const [dogSafe, setDogSafe] = useState('si'); // 'si', 'no'
  const [notes, setNotes] = useState('');

  // Usar ubicación actual
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
      // Intentar obtener dirección legible
      let address = null;
      try {
        let geo = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geo && geo.length > 0) {
          address = `${geo[0].street || ''} ${geo[0].name || ''}, ${geo[0].city || ''}, ${geo[0].region || ''}`;
        }
      } catch {}
      const finalAddress = address || `${latitude}, ${longitude}`;
      setLocation(finalAddress);
      autoCompleteRef.current?.setAddressText(finalAddress);
    } catch (e) {
      Alert.alert('Error', 'No se pudo obtener la ubicación.');
    }
    setGettingLocation(false);
  };

  // Elegir foto
  const pickImage = async () => {
    if (photos.length >= 5) return;
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotos([...photos, result.assets[0].uri].slice(0, 5));
    }
  };

  // Eliminar foto
  const removePhoto = (idx) => {
    setPhotos(photos.filter((_, i) => i !== idx));
  };

  // Enviar alerta
  const handleSubmit = () => {
    if (!description || !location) {
      Alert.alert('Completa todos los campos obligatorios');
      return;
    }
    // Aquí se podría guardar la alerta en un backend o localmente
    Alert.alert('Alerta creada', 'Tu alerta ha sido registrada correctamente.', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
    setDescription('');
    setLocation('');
    setPhotos([]);
    setFoundDate(new Date().toISOString().slice(0, 16));
    setChipStatus('no_sabe');
    setChipNumber('');
    setDogSafe('si');
    setNotes('');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 160 }} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Perro Encontrado</Text>
        <Text style={styles.subtitle}>
          Completa este formulario para avisar a la comunidad sobre un perro encontrado en la calle.
        </Text>

        {/* Fotos */}
        <Text style={styles.label}>Subir fotos (máx 5)</Text>
        <TouchableOpacity
          style={[styles.uploadButton, photos.length >= 5 && { opacity: 0.5 }]}
          onPress={pickImage}
          activeOpacity={0.8}
          disabled={photos.length >= 5}
        >
          <Text style={styles.uploadButtonText}>Agregar foto</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 12 }}>
          {photos.map((uri, idx) => (
            <View key={uri} style={{ marginRight: 8, marginBottom: 8 }}>
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

        {/* Descripción */}
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, { minHeight: 60, textAlignVertical: 'top' }]}
          placeholder="Color, tamaño, raza, collar, heridas, temperamento, etc."
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {/* Ubicación */}
        <Text style={styles.label}>¿Dónde lo encontraste?</Text>
        <GooglePlacesAutocomplete
          ref={autoCompleteRef}
          placeholder="Buscar dirección..."
          minLength={3}
          fetchDetails={true}
          predefinedPlaces={[]}
          onPress={(data, details = null) => {
            if (details && details.formatted_address) {
              setLocation(details.formatted_address);
              autoCompleteRef.current?.setAddressText(details.formatted_address);
            } else {
              setLocation(data.description);
              autoCompleteRef.current?.setAddressText(data.description);
            }
          }}
          query={{
            key: Constants.expoConfig.extra.googlePlacesApiKey,
            language: 'es',
            components: 'country:cl',
          }}
          styles={{
            textInput: styles.input,
          }}
          textInputProps={{
            placeholder: 'Buscar dirección...'
          }}
        />
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

        {/* Fecha y hora */}
        <Text style={styles.label}>¿Cuándo lo encontraste?</Text>
        <TextInput
          style={styles.input}
          value={foundDate}
          onChangeText={setFoundDate}
          placeholder="Fecha y hora"
        />
        <Text style={styles.fieldHelp}>Formato: YYYY-MM-DDThh:mm</Text>

        {/* Chip */}
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

        {/* ¿Está seguro? */}
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

        {/* Notas */}
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
        >
          <Text style={styles.buttonText}>Crear Alerta</Text>
        </TouchableOpacity>        </ScrollView>
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
    backgroundColor: '#4CAF50', // verde de perros encontrados
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

export default FoundDogAlertScreen;
