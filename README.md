# Dogs Finder App

Una aplicación móvil para ayudar a encontrar mascotas perdidas y reportar mascotas encontradas.

## Características

- Autenticación de usuarios (inicio de sesión y registro)
- Publicación de alertas de perros perdidos
- Publicación de reportes de perros encontrados
- Sistema de mensajería entre usuarios
- Perfil de usuario editable

## Tecnologías utilizadas

- React Native
- Expo
- React Navigation
- Expo Vector Icons

## Estructura del proyecto

```
dogs-finder/
├── App.js                # Punto de entrada principal
├── app.config.js         # Configuración avanzada de Expo
├── app.json              # Configuración básica de Expo
├── package.json          # Dependencias del proyecto
├── package-lock.json     # Lockfile de dependencias
├── .env                  # Variables de entorno (no se sube a git)
├── .gitignore            # Archivos y carpetas ignorados por git
├── assets/               # Imágenes y recursos estáticos
│   ├── adaptive-icon.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash-icon.png
├── src/
│   ├── context/
│   │   └── AuthContext.js         # Contexto de autenticación
│   ├── data/
│   │   └── dummyData.js           # Datos de ejemplo
│   ├── navigation/
│   │   ├── AppStack.js            # Navegación para usuarios autenticados
│   │   └── AuthStack.js           # Navegación para autenticación
│   ├── screens/
│   │   ├── Auth/
│   │   │   ├── LoginScreen.js     # Pantalla de inicio de sesión
│   │   │   └── RegisterScreen.js  # Pantalla de registro
│   │   ├── FoundDogs/
│   │   │   ├── CreateFoundAlertScreen.js   # Crear alerta de perro encontrado
│   │   │   ├── FoundDogDetailScreen.js     # Detalle de perro encontrado
│   │   │   └── FoundDogsListScreen.js      # Lista de perros encontrados
│   │   ├── LostDogs/
│   │   │   ├── ContactChatScreen.js        # Chat con la persona que encontró
│   │   │   ├── ContactOwnerScreen.js       # Contactar dueño
│   │   │   ├── CreateAlertScreen.js        # Crear alerta de perro perdido
│   │   │   ├── LostDogDetailScreen.js      # Detalle de perro perdido
│   │   │   └── LostDogsListScreen.js       # Lista de perros perdidos
│   │   ├── ChatScreen.js                   # Pantalla de chat general
│   │   └── ProfileScreen.js                # Perfil de usuario
```




## Instalación

1. Clona el repositorio:
```
git clone https://github.com/frana00/dogs-finder.git
cd dogs-finder
```

2. Instala las dependencias:
```
npm install
```

3. Inicia la aplicación:
```
npx expo start
```

## Uso

- Escanea el código QR con la aplicación Expo Go en tu dispositivo móvil
- O ejecuta en un emulador con `a` (Android) o `i` (iOS)

## Próximas mejoras

- Implementación de backend real
- Subida de imágenes para las mascotas
- Notificaciones push
- Geolocalización para mostrar mascotas cercanas
- Filtros de búsqueda avanzados
