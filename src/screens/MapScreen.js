import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Callout } from 'react-native-maps';
import { dummyLostDogs, dummyFoundDogs } from '../data/dummyData'; // Import dog data

const MapScreen = () => {
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
      {/* Botón flotante para ver lista (solo UI) */}
      <View style={styles.fabBox}>
        <Text style={styles.fabText}>Ver lista</Text>
      </View>
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
  fabBox: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    backgroundColor: '#ff9800',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 4,
    zIndex: 10,
  },
  fabText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
