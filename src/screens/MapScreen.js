import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
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
      <MapView
        style={styles.map}
        initialRegion={getInitialRegion()}
        showsUserLocation={true} // Shows the user's current location blue dot
      >
        {/* Markers for Lost Dogs */}
        {dummyLostDogs.map(dog => (
          <Marker
            key={dog.id}
            coordinate={dog.coordinates}
            pinColor="orange"
            title={dog.name}
            description="Perdido"
          />
        ))}

        {/* Markers for Found Dogs */}
        {dummyFoundDogs.map(dog => (
          <Marker
            key={dog.id}
            coordinate={dog.coordinates}
            pinColor="green"
            title={dog.breed} // Using breed as per instruction, could be name if available
            description="Encontrado"
          />
        ))}
      </MapView>
      {errorMsg && !loading && ( // Display error message subtly if location was denied/failed but we have a fallback
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
  },
  map: {
    ...StyleSheet.absoluteFillObject,
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
  errorToast: { // For a less intrusive error message when map still loads
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: 'white',
    padding: 10,
    borderRadius: 5,
    textAlign: 'center',
    zIndex: 1, // Ensure toast is above map elements if it overlaps
  },
});

export default MapScreen;
