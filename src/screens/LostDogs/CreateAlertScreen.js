import React, { useState, useEffect } from 'react';
import Constants from 'expo-constants';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, Image } from 'react-native';
import * as Location from 'expo-location';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import * as ImagePicker from 'expo-image-picker';

const CreateAlertScreen = ({ navigation }) => {
  const [dogName, setDogName] = useState('');
  const [description, setDescription] = useState('');
  const [chip, setChip] = useState('');
  const [location, setLocation] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [photos, setPhotos] = useState([]); // Para varias imágenes (máx 5)

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

  const handleSubmit = () => {
    if (!dogName || !description || !location) {
      Alert.alert('Completa todos los campos');
      return;
    }
    // Aquí se podría guardar la alerta en un backend o localmente
    Alert.alert('Alerta creada', 'Tu alerta ha sido registrada correctamente.', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
    setDogName('');
    setDescription('');
    setLocation('');
    setChip('');
    setPhotos([]);
    // navigation.goBack(); // Si quieres regresar automáticamente
  };

  // Función para elegir imagen
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

  // Eliminar foto por índice
  const removePhoto = (idx) => {
    setPhotos(photos.filter((_, i) => i !== idx));
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
          style={[styles.input, { height: 80 }]}
          placeholder="Color, tamaño, características..."
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <Text style={styles.label}>Chip (opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Número de chip"
          value={chip}
          onChangeText={setChip}
        />

        <Text style={[styles.label, {marginTop: 16}]}>¿Dónde se perdió?</Text>
        <GooglePlacesAutocomplete
          placeholder="Buscar dirección o lugar"
          minLength={2}
          fetchDetails={true}
          onPress={(data, details = null) => {
            if (details && details.formatted_address) {
              setLocation(details.formatted_address);
            } else {
              setLocation(data.description);
            }
          }}
          query={{
            key: Constants.expoConfig.extra.googlePlacesApiKey,
            language: 'es',
            components: 'country:cl',
          }}
          predefinedPlaces={[]}
          styles={{
            textInput: styles.input,
            listView: { zIndex: 10 },
          }}
          enablePoweredByContainer={false}
          debounce={200}
          nearbyPlacesAPI="GooglePlacesSearch"
          textInputProps={{
            value: location,
            onChangeText: setLocation,
            placeholderTextColor: '#aaa',
          }}
        />
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
        <TouchableOpacity style={styles.button} onPress={handleSubmit} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Crear Alerta</Text>
        </TouchableOpacity>
        <View style={{ height: 80 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
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
