import React, { useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAlerts } from '../../context/AlertContext';
import LoadingScreen from '../../components/LoadingScreen';
import ErrorHandler from '../../components/ErrorHandler';
import { EmptyFoundDogs } from '../../components/EmptyState';

const FoundDogsListScreen = () => {
  const navigation = useNavigation();
  const { foundDogs, loading, error, fetchFoundDogs } = useAlerts();

  useEffect(() => {
    fetchFoundDogs();
  }, [fetchFoundDogs]);

  const handleRefresh = () => {
    fetchFoundDogs();
  };
  const renderDogItem = ({ item }) => (
    <TouchableOpacity
      style={styles.dogCard}
      onPress={() => navigation.navigate('FoundDogDetail', { dog: item })}
    >
      <View style={styles.dogIconContainer}>
        {item.photoFilenames && item.photoFilenames.length > 0 ? (
           <Image source={{ uri: item.photoFilenames[0] }} style={styles.dogImagePreview} />
        ) : (
           <Ionicons name="search" size={40} color="#4CAF50" />
        )}
      </View>
      <View style={styles.dogInfo}>
        <Text style={styles.dogTitle}>{item.title}</Text>
        <Text style={styles.dogBreed}>{item.breed || 'Raza no especificada'}</Text>
        <Text style={styles.dogLocation}>
          <Ionicons name="location-outline" size={14} color="#666" /> {item.location || 'Ubicación no especificada'}
        </Text>
        <Text style={styles.dogDate}>
          <Ionicons name="calendar-outline" size={14} color="#666" /> {new Date(item.date).toLocaleDateString()}
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
      {loading && foundDogs.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Cargando alertas...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Intentar de nuevo</Text>
          </TouchableOpacity>
        </View>
      ) : foundDogs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No hay alertas de perros encontrados</Text>
          <Text style={styles.emptySubtext}>Desliza hacia abajo para actualizar</Text>
        </View>
      ) : (
        <FlatList
          data={foundDogs}
          renderItem={renderDogItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={handleRefresh}
              colors={['#4CAF50']}
              tintColor="#4CAF50"
            />
          }
        />
      )}
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
    overflow: 'hidden',
  },
  dogImagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  dogInfo: {
    flex: 1,
  },
  dogTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default FoundDogsListScreen;
