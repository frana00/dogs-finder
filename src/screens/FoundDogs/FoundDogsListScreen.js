import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const DUMMY_DATA = [
  {
    id: '1',
    breed: 'Bulldog',
    location: 'Centro Comercial',
    date: '16/03/2025',
    description: 'Perro blanco y marrón, sin collar, amigable',
    images: [
      'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&w=400',
      'https://images.pexels.com/photos/733416/pexels-photo-733416.jpeg?auto=compress&w=400',
    ],
  },
  {
    id: '2',
    breed: 'Mestizo',
    location: 'Parque Sur',
    date: '14/03/2025',
    description: 'Perro mediano, color negro, collar verde',
    images: [
      'https://images.pexels.com/photos/164186/pexels-photo-164186.jpeg?auto=compress&w=400',
      'https://images.pexels.com/photos/356378/pexels-photo-356378.jpeg?auto=compress&w=400',
    ],
  },
  {
    id: '3',
    breed: 'Poodle',
    location: 'Avenida Central',
    date: '11/03/2025',
    description: 'Perro pequeño, blanco, muy asustado',
    images: [
      'https://images.pexels.com/photos/1108098/pexels-photo-1108098.jpeg?auto=compress&w=400',
    ],
  },
];

const FoundDogsListScreen = () => {
  const navigation = useNavigation();
  const renderDogItem = ({ item }) => (
    <TouchableOpacity
      style={styles.dogCard}
      onPress={() => navigation.navigate('FoundDogDetail', {
        dog: {
          description: item.description || '',
          location: item.location || '',
          foundDate: item.date || '',
          images: item.images || [],
          chipStatus: item.chipStatus || 'no_sabe',
          chipNumber: item.chipNumber || '',
          dogSafe: item.dogSafe || 'si',
          notes: item.notes || '',
        }
      })}
    >
      <View style={styles.dogIconContainer}>
        <Ionicons name="search" size={40} color="#4CAF50" />
      </View>
      <View style={styles.dogInfo}>
        <Text style={styles.dogBreed}>{item.breed}</Text>
        <Text style={styles.dogLocation}>
          <Ionicons name="location-outline" size={14} color="#666" /> {item.location}
        </Text>
        <Text style={styles.dogDate}>
          <Ionicons name="calendar-outline" size={14} color="#666" /> {item.date}
        </Text>
        <Text style={styles.dogDescription} numberOfLines={1}>
          {item.description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={DUMMY_DATA}
        renderItem={renderDogItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CreateFoundAlertScreen')}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  listContent: {
    padding: 15,
  },
  dogCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dogIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  dogInfo: {
    flex: 1,
  },
  dogBreed: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  dogLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  dogDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  dogDescription: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default FoundDogsListScreen;
