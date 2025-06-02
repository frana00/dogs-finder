import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { getApiServiceInstance } from '../services/apiService';
const apiService = getApiServiceInstance();

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [lostDogs, setLostDogs] = useState([]);
  const [foundDogs, setFoundDogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener perros perdidos
  const fetchLostDogs = useCallback(async () => {
    console.log('🔍 fetchLostDogs: Starting...');
    setLoading(true);
    setError(null);
    try {
      // First try with type filter
      let alerts;
      try {
        console.log('🔍 fetchLostDogs: Trying with type filter...');
        alerts = await apiService.getAlerts({ type: 'LOST', status: 'ACTIVE' });
        console.log('✅ fetchLostDogs: Got alerts with type filter:', alerts);
      } catch (typeError) {
        console.log('⚠️ Type filter failed, trying without filter:', typeError.message);
        // If type filter fails, get all alerts and filter locally
        const allAlerts = await apiService.getAlerts();
        console.log('🔍 fetchLostDogs: Got all alerts:', allAlerts);
        console.log('🔍 fetchLostDogs: typeof allAlerts:', typeof allAlerts);
        console.log('🔍 fetchLostDogs: allAlerts.content:', allAlerts?.content);
        console.log('🔍 fetchLostDogs: Array.isArray(allAlerts):', Array.isArray(allAlerts));
        console.log('🔍 fetchLostDogs: Array.isArray(allAlerts.content):', Array.isArray(allAlerts?.content));
        
        // Safe filtering with multiple fallbacks
        let filteredAlerts = [];
        if (allAlerts?.content && Array.isArray(allAlerts.content)) {
          console.log('🔍 fetchLostDogs: Filtering allAlerts.content...');
          filteredAlerts = allAlerts.content.filter(alert => {
            console.log('🔍 fetchLostDogs: Processing alert:', alert);
            return alert && alert.type === 'LOST' && alert.status === 'ACTIVE';
          });
        } else if (Array.isArray(allAlerts)) {
          console.log('🔍 fetchLostDogs: Filtering allAlerts directly...');
          filteredAlerts = allAlerts.filter(alert => {
            console.log('🔍 fetchLostDogs: Processing alert:', alert);
            return alert && alert.type === 'LOST' && alert.status === 'ACTIVE';
          });
        } else {
          console.log('⚠️ fetchLostDogs: allAlerts is neither array nor has content array');
        }
        console.log('🔍 fetchLostDogs: filteredAlerts:', filteredAlerts);
        alerts = filteredAlerts;
      }
      
      const dogsData = alerts?.content || alerts || [];
      console.log('✅ fetchLostDogs: Final dogs data:', dogsData);
      setLostDogs(dogsData);
      return dogsData;
    } catch (err) {
      console.error('❌ Error al obtener perros perdidos:', err);
      console.error('❌ Error message:', err.message);
      console.error('❌ Error stack:', err.stack);
      
      const errorMessage = err.message === 'TOKEN_EXPIRED' 
        ? 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
        : 'No se pudieron cargar los perros perdidos. Verifica tu conexión a internet.';
      setError(errorMessage);
      setLostDogs([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener perros encontrados
  const fetchFoundDogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // First try with type filter
      let alerts;
      try {
        alerts = await apiService.getAlerts({ type: 'SEEN', status: 'ACTIVE' });
      } catch (typeError) {
        console.log('Type filter failed, trying without filter:', typeError.message);
        // If type filter fails, get all alerts and filter locally
        const allAlerts = await apiService.getAlerts();
        
        // Safe filtering with multiple fallbacks
        let filteredAlerts = [];
        if (allAlerts?.content && Array.isArray(allAlerts.content)) {
          filteredAlerts = allAlerts.content.filter(alert => alert.type === 'SEEN' && alert.status === 'ACTIVE');
        } else if (Array.isArray(allAlerts)) {
          filteredAlerts = allAlerts.filter(alert => alert.type === 'SEEN' && alert.status === 'ACTIVE');
        }
        alerts = filteredAlerts;
      }
       const dogsData = alerts.content || alerts || [];
      setFoundDogs(dogsData);
      return dogsData;
    } catch (err) {
      console.error('❌ Error al obtener perros encontrados:', err);
      
      const errorMessage = err.message === 'TOKEN_EXPIRED' 
        ? 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
        : 'No se pudieron cargar los perros encontrados. Verifica tu conexión a internet.';
      setError(errorMessage);
      setFoundDogs([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

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
      setLostDogs(prev => [newAlert, ...(Array.isArray(prev) ? prev : [])]);
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
        type: 'SEEN',
        status: 'ACTIVE',
      });
      
      // Actualizar la lista local agregando la nueva alerta
      setFoundDogs(prev => [newAlert, ...(Array.isArray(prev) ? prev : [])]);
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
      setLostDogs(prev => Array.isArray(prev) ? prev.map(alert => 
        alert.id === id ? updatedAlert : alert
      ) : []);
      setFoundDogs(prev => Array.isArray(prev) ? prev.map(alert => 
        alert.id === id ? updatedAlert : alert
      ) : []);
      
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
      setLostDogs(prev => (Array.isArray(prev) ? prev.filter(alert => alert.id !== id) : []));
      setFoundDogs(prev => (Array.isArray(prev) ? prev.filter(alert => alert.id !== id) : []));
      
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

  // Initialize data when the provider mounts - TEMPORARILY DISABLED
  // useEffect(() => {
  //   console.log('🔍 AlertProvider: useEffect starting data initialization...');
  //   const initializeData = async () => {
  //     try {
  //       console.log('🔍 AlertProvider: About to call fetchLostDogs...');
  //       await fetchLostDogs();
  //       console.log('✅ AlertProvider: fetchLostDogs completed');
        
  //       console.log('🔍 AlertProvider: About to call fetchFoundDogs...');
  //       await fetchFoundDogs();
  //       console.log('✅ AlertProvider: fetchFoundDogs completed');
  //     } catch (error) {
  //       console.error('❌ AlertProvider: Error during initialization:', error);
  //     }
  //   };
    
  //   initializeData();
  // }, [fetchLostDogs, fetchFoundDogs]);

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
