import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, Image } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Callout } from 'react-native-maps';
import { dummyLostDogs, dummyFoundDogs } from '../data/dummyData'; // Import dog data

const MapScreen = ({ navigation }) => {
  const [showLostList, setShowLostList] = useState(false);
  const [showFoundList, setShowFoundList] = useState(false);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        console.log('Permission to access location was denied');
        setLocation(null); // Ensure location is null if permission denied
        setLoading(false);
        return;
      }

      try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        console.log('User location:', currentLocation);
      } catch (error) {
        setErrorMsg('Error fetching location');
        console.error('Error fetching location:', error);
        setLocation(null); // Ensure location is null on error
      }
      setLoading(false);
    })();
  }, []);

  const defaultRegion = {
    latitude: -33.45,
    longitude: -70.65,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const getInitialRegion = () => {
    if (location && location.coords) {
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }
    return defaultRegion;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading map...</Text>
      </View>
    );
  }

  if (errorMsg && !location) { // Only show error if location couldn't be determined
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <Text style={styles.errorText}>Displaying default map region.</Text>
        <MapView
          style={styles.map}
          initialRegion={defaultRegion}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Título y resumen */}
      <View style={styles.headerBox}>
        <Text style={styles.title}>Mapa de perros perdidos y encontrados</Text>
        <Text style={styles.subtitle}>
          {dummyLostDogs.length} perdidos · {dummyFoundDogs.length} encontrados
        </Text>
      </View>
      <MapView
        style={styles.map}
        initialRegion={getInitialRegion()}
        showsUserLocation={true}
      >
        {/* Markers para perros perdidos */}
        {dummyLostDogs.map(dog => (
          <Marker
            key={dog.id}
            coordinate={dog.coordinates}
            pinColor="orange"
          >
            <Callout tooltip>
              <View style={styles.calloutBoxLost}>
                <Text style={styles.calloutTitle}>{dog.name} (Perdido)</Text>
                <Text>Raza: {dog.breed}</Text>
                <Text>Última vez visto: {dog.lastSeen || 'N/D'}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
        {/* Markers para perros encontrados */}
        {dummyFoundDogs.map(dog => (
          <Marker
            key={dog.id}
            coordinate={dog.coordinates}
            pinColor="green"
          >
            <Callout tooltip>
              <View style={styles.calloutBoxFound}>
                <Text style={styles.calloutTitle}>{dog.breed} (Encontrado)</Text>
                <Text>¿Reconoces este perro?</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      {/* Botones flotantes para ver perdidos/encontrados */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fabLost} onPress={() => setShowLostList(true)}>
          <Text style={styles.fabText}>Ver perdidos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.fabFound} onPress={() => setShowFoundList(true)}>
          <Text style={styles.fabText}>Ver encontrados</Text>
        </TouchableOpacity>
      </View>

      {/* Modal lista perdidos */}
      {showLostList && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Perros perdidos</Text>
            <ScrollView style={{marginTop: 10}} showsVerticalScrollIndicator={false}>
              {dummyLostDogs.map(dog => (
  <TouchableOpacity
    key={dog.id}
    onPress={() => navigation.navigate('LostDogDetailScreen', { dogId: dog.id })}
    activeOpacity={0.8}
  >
    <View style={styles.cardLost}>
      {dog.images && dog.images[0] && (
        <Image source={{ uri: dog.images[0] }} style={styles.cardImage} />
      )}
      <View style={styles.cardTextContainer}> 
        <Text style={styles.cardTitle}>{dog.name}</Text>
        <Text style={styles.cardText}>Raza: {dog.breed}</Text>
        <Text style={styles.cardText}>Última vez visto: {dog.lastSeen || 'N/D'}</Text>
      </View>
    </View>
  </TouchableOpacity>
))}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowLostList(false)}>
              <Text style={styles.closeBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* Modal lista encontrados */}
      {showFoundList && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Perros encontrados</Text>
            <ScrollView style={{marginTop: 10}} showsVerticalScrollIndicator={false}>
              {dummyFoundDogs.map(dog => (
  <TouchableOpacity
    key={dog.id}
    onPress={() => navigation.navigate('FoundDogDetailScreen', { dogId: dog.id })}
    activeOpacity={0.8}
  >
    <View style={styles.cardFound}>
      {dog.images && dog.images[0] && (
        <Image source={{ uri: dog.images[0] }} style={styles.cardImage} />
      )}
      <View style={styles.cardTextContainer}> 
        <Text style={styles.cardTitle}>{dog.name}</Text>
        <Text style={styles.cardText}>Raza: {dog.breed}</Text>
        <Text style={styles.cardText}>Encontrado: {dog.date || 'N/D'}</Text>
      </View>
    </View>
  </TouchableOpacity>
))}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowFoundList(false)}>
              <Text style={styles.closeBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {errorMsg && !loading && (
        <Text style={styles.errorToast}>
          {errorMsg}. Mostrando región por defecto.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerBox: {
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingBottom: 4,
    alignItems: 'center',
    zIndex: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#222',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  map: {
    flex: 1,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 32,
    right: 24, 
    flexDirection: 'row', 
    gap: 12, 
    zIndex: 10, 
  },
  fabLost: {
    backgroundColor: '#ff9800',
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 1, height: 2 },
    shadowRadius: 3,
  },
  fabFound: {
    backgroundColor: '#4caf50',
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 1, height: 2 },
    shadowRadius: 3,
  },
  fabText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  calloutBoxLost: {
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    padding: 8,
    minWidth: 140,
    alignItems: 'flex-start',
    borderColor: '#ff9800',
    borderWidth: 1,
  },
  calloutBoxFound: {
    backgroundColor: '#e0ffe6',
    borderRadius: 8,
    padding: 8,
    minWidth: 120,
    alignItems: 'flex-start',
    borderColor: '#4caf50',
    borderWidth: 1,
  },
  calloutTitle: {
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#222',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)', 
    justifyContent: 'flex-end',
    zIndex: 1000, 
  },
  modalBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12, 
    paddingHorizontal: 20,
    paddingBottom: 20,
    minHeight: 250,
    maxHeight: '65%', 
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 10,
    elevation: 10,
  },
  modalHandle: {
    width: 45,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#d0d0d0', 
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  cardLost: {
    backgroundColor: '#fff8e1',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderColor: '#ffe0b2',
    borderWidth: 1,
    flexDirection: 'row', 
    alignItems: 'center', 
  },
  cardFound: {
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderColor: '#c8e6c9',
    borderWidth: 1,
    flexDirection: 'row', 
    alignItems: 'center', 
  },
  cardImage: { 
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  cardTextContainer: { 
    flex: 1, 
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#424242',
  },
  cardText: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 2,
    lineHeight: 20,
  },
  closeBtn: {
    marginTop: 15,
    backgroundColor: '#607d8b', 
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignSelf: 'center',
    borderRadius: 25,
    elevation: 2,
  },
  closeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorToast: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: 'white',
    padding: 10,
    borderRadius: 5,
    textAlign: 'center',
    zIndex: 1,
  },
});

export default MapScreen;
