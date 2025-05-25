import { SHA256 } from 'crypto-js';

// --- Usuarios Ficticios (con hashes SHA256 reales de contraseña) ---
export const dummyUsers = {
  user1: { id: 'user1', name: 'Fran Illanes', phone: '+56911111111', email: 'fran.illanes@email.com', passwordHash: 'abf6848310229c7b087f6d70a1b6af928e3017fcb5212ac7bd2b6b7a9b4507ae' }, 
  user2: { id: 'user2', name: 'Dani Díaz', phone: '+56922222222', email: 'dani.diaz@email.com', passwordHash: '5fc3055c04c89c7adef3460f224d0dc46d02f2713ee2f7b5683ab6a02edf7a16' }, 
  user3: { id: 'user3', name: 'Jana Montero', phone: '+56933333333', email: 'jana.montero@email.com', passwordHash: '42659c7157eca11ae21e839de2a9035c547276869acc17c70c33791b337b5ab8' }, 
  user4: { id: 'user4', name: 'Luis Pedraza', phone: '+56944444444', email: 'luis.pedraza@email.com', passwordHash: '0f5eb99e04a0c93747e0b2a848530f12bfa8356198e8543a0497086db080f942' },
  // Usuario de prueba con credenciales fáciles
  testUser: { id: 'testUser', name: 'Usuario de Prueba', phone: '+56999999999', email: 'test@test.com', passwordHash: 'ecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae' } // password: test123
};

// --- Simulación de autenticación ---

let currentUser = null;

/**
 * Simula el login con email y password. Devuelve el usuario si es correcto, null si no.
 */
export function login(email, password) {
  const passwordHash = SHA256(password).toString();
  const user = Object.values(dummyUsers).find(
    u => u.email === email && u.passwordHash === passwordHash
  );
  if (user) {
    currentUser = user;
    return user;
  }
  return null;
}

/**
 * Simula el registro de un nuevo usuario
 */
export function register(userData) {
  // Verificar si el email ya existe
  const existingUser = Object.values(dummyUsers).find(u => u.email === userData.email);
  if (existingUser) {
    throw new Error('Este email ya está registrado');
  }

  // Crear nuevo usuario
  const newUserId = `user${Object.keys(dummyUsers).length + 1}`;
  const passwordHash = SHA256(userData.password).toString();
  
  const newUser = {
    id: newUserId,
    name: userData.name,
    phone: userData.phone,
    email: userData.email,
    passwordHash: passwordHash,
    role: userData.role || 'USER',
    subscriptionEmail: userData.subscriptionEmail || userData.email
  };

  // Agregar a dummyUsers
  dummyUsers[newUserId] = newUser;
  
  // No devolver el passwordHash al cliente
  const { passwordHash: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
}

/**
 * Simula el logout.
 */
export function logout() {
  currentUser = null;
}

/**
 * Devuelve el usuario autenticado actual (o null si no hay login).
 */
export function getCurrentUser() {
  return currentUser;
}
  
  // --- Datos para Perros Perdidos ---
  export const dummyLostDogs = [
    {
      id: '1', name: 'Max', breed: 'Labrador', location: 'Parque Central, Ñuñoa', date: '15/04/2025',
      description: 'Perro color dorado, collar azul con estrellas, muy amigable y juguetón.',
      images: [
        'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/2607544/pexels-photo-2607544.jpeg?auto=compress&cs=tinysrgb&w=400',
      ],
      chip: 'No',
      contact: dummyUsers.user1, // Dueño: Juan Pérez
      coordinates: { latitude: -33.4489, longitude: -70.6693 }
    },
    {
      id: '2', name: 'Luna', breed: 'Beagle', location: 'Av. Irarrázaval con Suecia', date: '12/04/2025',
      description: 'Perrita tricolor (blanco, negro, café), tamaño mediano, llevaba un collar rojo con una placa con su nombre. Es algo tímida.',
      images: [
        'https://images.pexels.com/photos/1035108/pexels-photo-1035108.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/59523/pexels-photo-59523.jpeg?auto=compress&cs=tinysrgb&w=400'
      ],
      chip: 'Sí',
      contact: dummyUsers.user2, // Dueña: María López
      coordinates: { latitude: -33.4500, longitude: -70.6700 }
    },
    {
      id: '3', name: 'Rocky', breed: 'Pastor Alemán', location: 'Plaza Ñuñoa', date: '10/04/2025',
      description: 'Perro grande, color negro y marrón característico de la raza. No llevaba collar cuando se perdió. Responde a "Rocky".',
      images: [
        'https://images.pexels.com/photos/895259/pexels-photo-895259.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1619690/pexels-photo-1619690.jpeg?auto=compress&cs=tinysrgb&w=400',
      ],
      chip: 'No',
      contact: dummyUsers.user3, // Dueño: Carlos Rodríguez
      coordinates: { latitude: -33.4510, longitude: -70.6710 }
    },
    {
      id: '4', name: 'Kira', breed: 'Husky Siberiano', location: 'Cerro San Cristóbal (Sector Tupahue)', date: '08/04/2025',
      description: 'Hembra, ojos azules penetrantes, pelaje gris y blanco. Llevaba un collar rosado. Muy activa y puede asustarse fácil.',
      images: [
          'https://images.pexels.com/photos/166124/pexels-photo-166124.jpeg?auto=compress&cs=tinysrgb&w=400',
          'https://images.pexels.com/photos/460823/pexels-photo-460823.jpeg?auto=compress&cs=tinysrgb&w=400'
      ],
      chip: 'Sí',
      contact: dummyUsers.user4, // Dueña: Ana Martínez
      coordinates: { latitude: -33.4520, longitude: -70.6720 }
    },
  ];
  
  // --- Datos para Perros Encontrados ---

// --- Helpers para simulación de datos ---


/**
 * Agrega una alerta de perro perdido a dummyLostDogs y la asocia al usuario actual.
 * @param {Object} alertData - Datos de la alerta (name, breed, location, date, description, images, chip, etc)
 * @returns {Object} La alerta creada
 */
export function addLostDogAlert(alertData) {
  const newAlert = {
    ...alertData,
    id: (dummyLostDogs.length + 1).toString(),
    contact: getCurrentUser(),
  };
  dummyLostDogs.push(newAlert);
  return newAlert;
}

/**
 * Agrega una alerta de perro encontrado a dummyFoundDogs y la asocia al usuario actual.
 * @param {Object} alertData - Datos de la alerta (breed, location, date, description, images, chipStatus, notes, etc)
 * @returns {Object} La alerta creada
 */
export function addFoundDogAlert(alertData) {
  const newAlert = {
    ...alertData,
    id: 'f' + (dummyFoundDogs.length + 1).toString(),
    contact: getCurrentUser(),
  };
  dummyFoundDogs.push(newAlert);
  return newAlert;
}

  export const dummyFoundDogs = [
     {
      id: 'f1', breed: 'Bulldog Francés', location: 'Parque Bustamante', date: '18/04/2025',
      description: 'Pequeño, color crema, parecía desorientado. Sin collar. Muy tranquilo.',
      images: [
        'https://images.pexels.com/photos/1619651/pexels-photo-1619651.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1490908/pexels-photo-1490908.jpeg?auto=compress&cs=tinysrgb&w=400'
      ],
      chipStatus: 'no_sabe', chipNumber: '', dogSafe: 'si', notes: 'Lo tengo en mi depto temporalmente.',
      contact: dummyUsers.user4, // Quien encontró: Ana Martínez
      coordinates: { latitude: -33.4530, longitude: -70.6730 }
    },
    {
      id: 'f2', breed: 'Mestizo', location: 'Barrio Italia', date: '17/04/2025',
      description: 'Perro mediano-grande, color negro con patas blancas. Llevaba un collar verde gastado. Es muy juguetón.',
      images: [
        'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/220938/pexels-photo-220938.jpeg?auto=compress&cs=tinysrgb&w=400'
      ],
      chipStatus: 'no', chipNumber: '', dogSafe: 'no', notes: 'Le di agua y comida, pero sigue por la zona.',
      contact: dummyUsers.user1, // Quien encontró: Juan Pérez
      coordinates: { latitude: -33.4540, longitude: -70.6740 }
    },
    {
      id: 'f3', breed: 'Golden Retriever', location: 'Parque Araucano', date: '17/04/2025',
      description: 'Adulto, pelaje dorado, muy dócil y bien cuidado. No tenía collar. Se acercó buscando cariño.',
      images: [
          'https://images.pexels.com/photos/1458916/pexels-photo-1458916.jpeg?auto=compress&cs=tinysrgb&w=400'
      ],
      chipStatus: 'no_sabe', chipNumber: '', dogSafe: 'si', notes: 'Lo resguardé en mi casa.',
      contact: dummyUsers.user2, // Quien encontró: María López
      coordinates: { latitude: -33.4550, longitude: -70.6750 }
    },
    {
      id: 'f4', breed: 'Shih Tzu', location: 'Metro Los Leones (Salida Sur)', date: '15/04/2025',
      description: 'Pequeño, pelo largo blanco y negro, un poco sucio. Estaba muy asustado entre la gente.',
      images: [
        'https://images.pexels.com/photos/4588035/pexels-photo-4588035.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/4587987/pexels-photo-4587987.jpeg?auto=compress&cs=tinysrgb&w=400'
      ],
      chipStatus: 'no', chipNumber: '', dogSafe: 'si', notes: 'Le compré un arnés temporal, está en mi hogar.',
      contact: dummyUsers.user3, // Quien encontró: Carlos Rodríguez
      coordinates: { latitude: -33.4560, longitude: -70.6760 }
    },
  ];