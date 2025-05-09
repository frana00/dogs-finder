// --- Usuarios Ficticios ---
export const dummyUsers = {
    user1: { id: 'user1', name: 'Juan Pérez', phone: '+56911111111', email: 'juan.perez@email.com' },
    user2: { id: 'user2', name: 'María López', phone: '+56922222222', email: 'maria.lopez@email.com' },
    user3: { id: 'user3', name: 'Carlos Rodríguez', phone: '+56933333333', email: 'carlos.rodriguez@email.com' },
    user4: { id: 'user4', name: 'Ana Martínez', phone: '+56944444444', email: 'ana.martinez@email.com' },
  };
  
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
      contact: dummyUsers.user1 // Dueño: Juan Pérez
    },
    {
      id: '2', name: 'Luna', breed: 'Beagle', location: 'Av. Irarrázaval con Suecia', date: '12/04/2025',
      description: 'Perrita tricolor (blanco, negro, café), tamaño mediano, llevaba un collar rojo con una placa con su nombre. Es algo tímida.',
      images: [
        'https://images.pexels.com/photos/1035108/pexels-photo-1035108.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/59523/pexels-photo-59523.jpeg?auto=compress&cs=tinysrgb&w=400'
      ],
      chip: 'Sí',
      contact: dummyUsers.user2 // Dueña: María López
    },
    {
      id: '3', name: 'Rocky', breed: 'Pastor Alemán', location: 'Plaza Ñuñoa', date: '10/04/2025',
      description: 'Perro grande, color negro y marrón característico de la raza. No llevaba collar cuando se perdió. Responde a "Rocky".',
      images: [
        'https://images.pexels.com/photos/895259/pexels-photo-895259.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1619690/pexels-photo-1619690.jpeg?auto=compress&cs=tinysrgb&w=400',
      ],
      chip: 'No',
      contact: dummyUsers.user3 // Dueño: Carlos Rodríguez
    },
    {
      id: '4', name: 'Kira', breed: 'Husky Siberiano', location: 'Cerro San Cristóbal (Sector Tupahue)', date: '08/04/2025',
      description: 'Hembra, ojos azules penetrantes, pelaje gris y blanco. Llevaba un collar rosado. Muy activa y puede asustarse fácil.',
      images: [
          'https://images.pexels.com/photos/166124/pexels-photo-166124.jpeg?auto=compress&cs=tinysrgb&w=400',
          'https://images.pexels.com/photos/460823/pexels-photo-460823.jpeg?auto=compress&cs=tinysrgb&w=400'
      ],
      chip: 'Sí',
      contact: dummyUsers.user4 // Dueña: Ana Martínez
    },
  ];
  
  // --- Datos para Perros Encontrados ---
  export const dummyFoundDogs = [
     {
      id: 'f1', breed: 'Bulldog Francés', location: 'Parque Bustamante', date: '18/04/2025',
      description: 'Pequeño, color crema, parecía desorientado. Sin collar. Muy tranquilo.',
      images: [
        'https://images.pexels.com/photos/1619651/pexels-photo-1619651.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1490908/pexels-photo-1490908.jpeg?auto=compress&cs=tinysrgb&w=400'
      ],
      chipStatus: 'no_sabe', chipNumber: '', dogSafe: 'si', notes: 'Lo tengo en mi depto temporalmente.',
      contact: dummyUsers.user4 // Quien encontró: Ana Martínez
    },
    {
      id: 'f2', breed: 'Mestizo', location: 'Barrio Italia', date: '17/04/2025',
      description: 'Perro mediano-grande, color negro con patas blancas. Llevaba un collar verde gastado. Es muy juguetón.',
      images: [
        'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/220938/pexels-photo-220938.jpeg?auto=compress&cs=tinysrgb&w=400'
      ],
      chipStatus: 'no', chipNumber: '', dogSafe: 'no', notes: 'Le di agua y comida, pero sigue por la zona.',
      contact: dummyUsers.user1 // Quien encontró: Juan Pérez
    },
    {
      id: 'f3', breed: 'Golden Retriever', location: 'Parque Araucano', date: '17/04/2025',
      description: 'Adulto, pelaje dorado, muy dócil y bien cuidado. No tenía collar. Se acercó buscando cariño.',
      images: [
          'https://images.pexels.com/photos/1458916/pexels-photo-1458916.jpeg?auto=compress&cs=tinysrgb&w=400'
      ],
      chipStatus: 'no_sabe', chipNumber: '', dogSafe: 'si', notes: 'Lo resguardé en mi casa.',
      contact: dummyUsers.user2 // Quien encontró: María López
    },
    {
      id: 'f4', breed: 'Shih Tzu', location: 'Metro Los Leones (Salida Sur)', date: '15/04/2025',
      description: 'Pequeño, pelo largo blanco y negro, un poco sucio. Estaba muy asustado entre la gente.',
      images: [
        'https://images.pexels.com/photos/4588035/pexels-photo-4588035.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/4587987/pexels-photo-4587987.jpeg?auto=compress&cs=tinysrgb&w=400'
      ],
      chipStatus: 'no', chipNumber: '', dogSafe: 'si', notes: 'Le compré un arnés temporal, está en mi hogar.',
      contact: dummyUsers.user3 // Quien encontró: Carlos Rodríguez
    },
  ];