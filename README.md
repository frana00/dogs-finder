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
├── App.js                 # Punto de entrada principal
├── app.json               # Configuración de Expo
├── package.json           # Dependencias del proyecto
├── src/
│   ├── components/        # Componentes reutilizables
│   ├── context/           # Contextos de React (Auth, Alerts)
│   ├── navigation/        # Configuración de navegación
│   │   ├── AppStack.js    # Navegación para usuarios autenticados
│   │   └── AuthStack.js   # Navegación para autenticación
│   ├── screens/           # Pantallas de la aplicación
│   │   ├── Auth/          # Pantallas de autenticación
│   │   ├── LostDogs/      # Pantallas de perros perdidos
│   │   ├── FoundDogs/     # Pantallas de perros encontrados
│   │   ├── ProfileScreen.js
│   │   └── ChatScreen.js
│   └── services/          # Servicios (API, almacenamiento)
```

## Instalación

1. Clona el repositorio:
```
git clone <url-del-repositorio>
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
