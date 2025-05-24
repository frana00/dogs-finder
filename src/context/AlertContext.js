import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import apiService from '../services/apiService';
import { dummyLostDogs, dummyFoundDogs } from '../data/dummyData';

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [lostDogs, setLostDogs] = useState([]);
  const [foundDogs, setFoundDogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to convert dummy data to API format
  const convertDummyDataToApiFormat = (dummyDogs, type) => {
    return dummyDogs.map(dog => ({
      id: dog.id,
      title: dog.name || `${dog.breed} ${type === 'LOST' ? 'perdido' : 'encontrado'}`,
      breed: dog.breed,
      description: dog.description,
      date: dog.date,
      latitude: dog.coordinates?.latitude,
      longitude: dog.coordinates?.longitude,
      photoFilenames: dog.images,
      userId: dog.contact?.id,
      type: type,
      status: 'ACTIVE',
      // Additional fields for found dogs
      chipStatus: dog.chipStatus,
      dogSafe: dog.dogSafe,
      notes: dog.notes
    }));
  };

  // Helper function to use dummy data as fallback
  const useDummyDataFallback = useCallback((type) => {
    console.log(`Using dummy data fallback for ${type} dogs`);
    if (type === 'LOST') {
      const convertedData = convertDummyDataToApiFormat(dummyLostDogs, 'LOST');
      setLostDogs(convertedData);
      return convertedData;
    } else {
      const convertedData = convertDummyDataToApiFormat(dummyFoundDogs, 'FOUND');
      setFoundDogs(convertedData);
      return convertedData;
    }
  }, []);

  // Obtener perros perdidos
  const fetchLostDogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // First try with type filter
      let alerts;
      try {
        alerts = await apiService.getAlerts({ type: 'LOST', status: 'ACTIVE' });
      } catch (typeError) {
        console.log('Type filter failed, trying without filter:', typeError.message);
        // If type filter fails, get all alerts and filter locally
        const allAlerts = await apiService.getAlerts();
        alerts = allAlerts.content ? 
          allAlerts.content.filter(alert => alert.type === 'LOST' && alert.status === 'ACTIVE') :
          (Array.isArray(allAlerts) ? allAlerts.filter(alert => alert.type === 'LOST' && alert.status === 'ACTIVE') : []);
      }
      
      const dogsData = alerts.content || alerts || [];
      setLostDogs(dogsData);
      return dogsData;
    } catch (err) {
      console.error('Error al obtener perros perdidos:', err);
      
      // Check if it's a network/connection error
      if (err.message.includes('fetch') || err.message.includes('timeout') || 
          err.message.includes('Network') || err.message.includes('Failed to fetch')) {
        console.log('Backend not accessible, using dummy data for lost dogs');
        return useDummyDataFallback('LOST');
      }
      
      const errorMessage = err.message === 'TOKEN_EXPIRED' 
        ? 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
        : 'No se pudieron cargar los perros perdidos. Mostrando datos de ejemplo.';
      setError(errorMessage);
      return useDummyDataFallback('LOST');
    } finally {
      setLoading(false);
    }
  }, [useDummyDataFallback]);

  // Obtener perros encontrados
  const fetchFoundDogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // First try with type filter
      let alerts;
      try {
        alerts = await apiService.getAlerts({ type: 'FOUND', status: 'ACTIVE' });
      } catch (typeError) {
        console.log('Type filter failed, trying without filter:', typeError.message);
        // If type filter fails, get all alerts and filter locally
        const allAlerts = await apiService.getAlerts();
        alerts = allAlerts.content ? 
          allAlerts.content.filter(alert => alert.type === 'FOUND' && alert.status === 'ACTIVE') :
          (Array.isArray(allAlerts) ? allAlerts.filter(alert => alert.type === 'FOUND' && alert.status === 'ACTIVE') : []);
      }
      
      const dogsData = alerts.content || alerts || [];
      setFoundDogs(dogsData);
      return dogsData;
    } catch (err) {
      console.error('Error al obtener perros encontrados:', err);
      
      // Check if it's a network/connection error
      if (err.message.includes('fetch') || err.message.includes('timeout') || 
          err.message.includes('Network') || err.message.includes('Failed to fetch')) {
        console.log('Backend not accessible, using dummy data for found dogs');
        return useDummyDataFallback('FOUND');
      }
      
      const errorMessage = err.message === 'TOKEN_EXPIRED' 
        ? 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
        : 'No se pudieron cargar los perros encontrados. Mostrando datos de ejemplo.';
      setError(errorMessage);
      return useDummyDataFallback('FOUND');
    } finally {
      setLoading(false);
    }
  }, [useDummyDataFallback]);

  // Obtener una alerta específica por ID
  const getAlert = useCallback(async (id) => {
    try {
      const alert = await apiService.getAlert(id);
      return alert;
    } catch (err) {
      console.error('Error al obtener alerta:', err);
      throw new Error(err.message === 'TOKEN_EXPIRED' 
        ? 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
        : 'No se pudo cargar la alerta.');
    }
  }, []);

  // Crear nueva alerta de perro perdido
  const createLostDogAlert = useCallback(async (alertData) => {
    setLoading(true);
    setError(null);
    try {
      const newAlert = await apiService.createAlert({
        ...alertData,
        type: 'LOST',
        status: 'ACTIVE',
      });
      
      // Actualizar la lista local agregando la nueva alerta
      setLostDogs(prev => [newAlert, ...prev]);
      return newAlert;
    } catch (err) {
      console.error('Error al crear alerta de perro perdido:', err);
      const errorMessage = err.message === 'TOKEN_EXPIRED' 
        ? 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
        : 'No se pudo crear la alerta. Intenta de nuevo.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nueva alerta de perro encontrado
  const createFoundDogAlert = useCallback(async (alertData) => {
    setLoading(true);
    setError(null);
    try {
      const newAlert = await apiService.createAlert({
        ...alertData,
        type: 'FOUND',
        status: 'ACTIVE',
      });
      
      // Actualizar la lista local agregando la nueva alerta
      setFoundDogs(prev => [newAlert, ...prev]);
      return newAlert;
    } catch (err) {
      console.error('Error al crear alerta de perro encontrado:', err);
      const errorMessage = err.message === 'TOKEN_EXPIRED' 
        ? 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
        : 'No se pudo crear la alerta. Intenta de nuevo.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar una alerta existente
  const updateAlert = useCallback(async (id, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedAlert = await apiService.updateAlert(id, updateData);
      
      // Actualizar en las listas locales
      setLostDogs(prev => prev.map(alert => 
        alert.id === id ? updatedAlert : alert
      ));
      setFoundDogs(prev => prev.map(alert => 
        alert.id === id ? updatedAlert : alert
      ));
      
      return updatedAlert;
    } catch (err) {
      console.error('Error al actualizar alerta:', err);
      const errorMessage = err.message === 'TOKEN_EXPIRED' 
        ? 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
        : 'No se pudo actualizar la alerta.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar una alerta
  const deleteAlert = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.deleteAlert(id);
      
      // Remover de las listas locales
      setLostDogs(prev => prev.filter(alert => alert.id !== id));
      setFoundDogs(prev => prev.filter(alert => alert.id !== id));
      
      return true;
    } catch (err) {
      console.error('Error al eliminar alerta:', err);
      const errorMessage = err.message === 'TOKEN_EXPIRED' 
        ? 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
        : 'No se pudo eliminar la alerta.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize data when the provider mounts
  useEffect(() => {
    const initializeData = async () => {
      await fetchLostDogs();
      await fetchFoundDogs();
    };
    
    initializeData();
  }, [fetchLostDogs, fetchFoundDogs]);

  return (
    <AlertContext.Provider
      value={{
        lostDogs,
        foundDogs,
        loading,
        error,
        fetchLostDogs,
        fetchFoundDogs,
        getAlert,
        createLostDogAlert,
        createFoundDogAlert,
        updateAlert,
        deleteAlert,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts debe ser usado dentro de un AlertProvider');
  }
  return context;
};
