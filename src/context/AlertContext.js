import React, { createContext, useState, useContext, useCallback } from 'react';

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [lostDogs, setLostDogs] = useState([]);
  const [foundDogs, setFoundDogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Datos de ejemplo para perros perdidos
  const mockLostDogs = [
    {
      id: '1',
      title: 'Perdí a mi perro en el Parque Central',
      description: 'Golden Retriever macho, 3 años, responde al nombre de Max. Lleva collar azul con placa de identificación.',
      breed: 'Golden Retriever',
      color: 'Dorado',
      size: 'Grande',
      gender: 'Macho',
      lastSeen: '2025-05-15',
      location: 'Parque Central, Av. Principal #123',
      contact: 'maria@example.com',
      phone: '+1234567890',
      image: 'https://via.placeholder.com/300x200?text=Perro+Perdido+1',
      status: 'active',
      createdAt: '2025-05-15T10:30:00Z',
      userId: 'user1'
    },
    // Agregar más ejemplos según sea necesario
  ];

  // Datos de ejemplo para perros encontrados
  const mockFoundDogs = [
    {
      id: 'f1',
      title: 'Encontré un perro en la calle Principal',
      description: 'Perro mestizo, tamaño mediano, color negro con manchas blancas. Muy amigable y con collar rojo.',
      breed: 'Mestizo',
      color: 'Negro con blanco',
      size: 'Mediano',
      gender: 'Hembra',
      foundDate: '2025-05-16',
      location: 'Calle Principal #456',
      contact: 'juan@example.com',
      phone: '+1987654321',
      image: 'https://via.placeholder.com/300x200?text=Perro+Encontrado+1',
      status: 'active',
      createdAt: '2025-05-16T15:45:00Z',
      userId: 'user2'
    },
    // Agregar más ejemplos según sea necesario
  ];

  // Obtener perros perdidos
  const fetchLostDogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simular retraso de red
      await new Promise(resolve => setTimeout(resolve, 800));
      setLostDogs(mockLostDogs);
      return mockLostDogs;
    } catch (err) {
      console.error('Error al obtener perros perdidos:', err);
      setError('No se pudieron cargar los perros perdidos. Intenta de nuevo más tarde.');
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
      // Simular retraso de red
      await new Promise(resolve => setTimeout(resolve, 800));
      setFoundDogs(mockFoundDogs);
      return mockFoundDogs;
    } catch (err) {
      console.error('Error al obtener perros encontrados:', err);
      setError('No se pudieron cargar los perros encontrados. Intenta de nuevo más tarde.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nueva alerta de perro perdido
  const createLostDogAlert = useCallback(async (alertData) => {
    setLoading(true);
    setError(null);
    try {
      // Simular retraso de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newAlert = {
        ...alertData,
        id: `lost-${Date.now()}`,
        status: 'active',
        createdAt: new Date().toISOString(),
        // Aquí podrías agregar el ID del usuario autenticado
        // userId: currentUser.id,
      };
      
      setLostDogs(prev => [newAlert, ...prev]);
      return newAlert;
    } catch (err) {
      console.error('Error al crear alerta de perro perdido:', err);
      setError('No se pudo crear la alerta. Intenta de nuevo.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nueva alerta de perro encontrado
  const createFoundDogAlert = useCallback(async (alertData) => {
    setLoading(true);
    setError(null);
    try {
      // Simular retraso de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newAlert = {
        ...alertData,
        id: `found-${Date.now()}`,
        status: 'active',
        createdAt: new Date().toISOString(),
        // Aquí podrías agregar el ID del usuario autenticado
        // userId: currentUser.id,
      };
      
      setFoundDogs(prev => [newAlert, ...prev]);
      return newAlert;
    } catch (err) {
      console.error('Error al crear alerta de perro encontrado:', err);
      setError('No se pudo crear la alerta. Intenta de nuevo.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AlertContext.Provider
      value={{
        lostDogs,
        foundDogs,
        loading,
        error,
        fetchLostDogs,
        fetchFoundDogs,
        createLostDogAlert,
        createFoundDogAlert,
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
