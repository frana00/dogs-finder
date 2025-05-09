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
├── app.config.js         # Configuración avanzada de Expo y variables de entorno
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
│   ├── data/
│   │   └── dummyData.js  # Datos de ejemplo
│   ├── navigation/
│   │   ├── AppStack.js   # Navegación para usuarios autenticados
│   │   └── AuthStack.js  # Navegación para autenticación
│   ├── screens/
│   │   ├── Auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── RegisterScreen.js
│   │   ├── FoundDogs/
│   │   │   ├── CreateFoundAlertScreen.js
│   │   │   ├── FoundDogDetailScreen.js
│   │   │   └── FoundDogsListScreen.js
│   │   ├── LostDogs/
│   │   │   ├── ContactChatScreen.js
│   │   │   ├── ContactOwnerScreen.js
│   │   │   ├── CreateAlertScreen.js
│   │   │   ├── LostDogDetailScreen.js
│   │   │   └── LostDogsListScreen.js
│   │   ├── ChatScreen.js
│   │   └── ProfileScreen.js
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
