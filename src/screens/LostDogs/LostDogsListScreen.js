// src/screens/LostDogs/LostDogsListScreen.js
// (Este es el código correcto que te di en la respuesta ANTERIOR)

import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image } from 'react-native'; // Asegúrate que Image esté importado
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { dummyLostDogs } from '../../data/dummyData'; // <--- IMPORTANTE: Importa desde dummyData

// NO debe existir la constante DUMMY_DATA aquí dentro

const LostDogsListScreen = () => {
  const navigation = useNavigation();

  const renderDogItem = ({ item }) => (
    <TouchableOpacity
      style={styles.dogCard}
      onPress={() => navigation.navigate('LostDogDetail', { dog: item })} // Navega con el 'dog' completo
    >
      <View style={styles.dogIconContainer}>
        {/* Muestra la imagen si existe, si no, el icono */}
        {item.images && item.images.length > 0 ? (
           <Image source={{ uri: item.images[0] }} style={styles.dogImagePreview} />
        ) : (
           <Ionicons name="paw-outline" size={30} color="#FF9800" />
        )}
      </View>
      <View style={styles.dogInfo}>
        <Text style={styles.dogName}>{item.name}</Text>
        <Text style={styles.dogBreed}>{item.breed}</Text>
        <Text style={styles.dogLocation}>
          <Ionicons name="location-outline" size={14} color="#666" /> {item.location}
        </Text>
        <Text style={styles.dogDate}>
          <Ionicons name="calendar-outline" size={14} color="#666" /> {item.date}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={dummyLostDogs} // <--- IMPORTANTE: Usa los datos importados
        renderItem={renderDogItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('CreateAlert')}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

// Estilos (incluyendo dogImagePreview y overflow: 'hidden' en dogIconContainer)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  listContent: {
    padding: 15,
    paddingBottom: 80,
  },
  dogCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  dogIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden', // Necesario para recortar la imagen
  },
  dogImagePreview: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
  },
  dogInfo: {
    flex: 1,
  },
  dogName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  dogBreed: {
    fontSize: 15,
    color: '#555',
    marginBottom: 5,
  },
  dogLocation: {
    fontSize: 13,
    color: '#777',
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dogDate: {
    fontSize: 13,
    color: '#777',
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default LostDogsListScreen;