# Dogs Finder

Aplicación móvil React Native para la gestión comunitaria de alertas de perros perdidos y encontrados, facilitando la coordinación de esfuerzos de rescate.

## Arquitectura

**Frontend**: React Native con Expo  
**Navegación**: React Navigation 6  
**Estado**: Context API  
**Mapas**: React Native Maps  
**Autenticación**: HTTP Basic Auth  

## Funcionalidades Principales

- **Gestión de Alertas**: Crear, visualizar y administrar alertas de mascotas con geolocalización
- **Mapas Interactivos**: Visualización en tiempo real de alertas por ubicación
- **Sistema de Usuarios**: Registro, autenticación y gestión de perfiles
- **Búsqueda Avanzada**: Filtrado por tipo de mascota, estado y proximidad geográfica
- **Galería Multimedia**: Gestión de hasta 5 fotografías por alerta

## 🚀 Instalación y Configuración

### Requisitos Previos
- Node.js 18+
- Expo CLI
- Simulador iOS / Emulador Android

### Instalación
```bash
# Clonar el repositorio
git clone <repository-url>
cd petsignal-clean

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con las credenciales correspondientes

# Iniciar la aplicación
expo start
```

### Variables de Entorno
```bash
EXPO_PUBLIC_API_BASE_URL=http://[IP_SERVIDOR]:8080
EXPO_PUBLIC_ADMIN_USERNAME=[usuario_admin]
EXPO_PUBLIC_ADMIN_PASSWORD=[password_admin]
```

### Configuración de Desarrollo
```bash
# Configurar red de desarrollo
cp src/utils/network.config.example.js src/utils/network.config.js
```

## Estructura del Proyecto

```
petsignal-clean/
├── src/
│   ├── components/          # Componentes UI reutilizables
│   │   ├── alerts/         # Componentes específicos de alertas
│   │   ├── common/         # Componentes genéricos (Button, Input, etc.)
│   │   ├── filters/        # Componentes de filtrado
│   │   ├── maps/           # Componentes de mapas
│   │   └── navigation/     # Componentes de navegación
│   ├── contexts/           # Gestión de estado global
│   │   ├── AuthContext.js  # Contexto de autenticación
│   │   └── AlertContext.js # Contexto de alertas
│   ├── screens/            # Pantallas de la aplicación
│   │   ├── auth/          # Pantallas de autenticación
│   │   ├── alerts/        # Gestión de alertas
│   │   ├── home/          # Pantalla principal
│   │   ├── maps/          # Visualización en mapas
│   │   └── profile/       # Perfil de usuario
│   ├── services/          # Capa de comunicación con API
│   │   ├── api.js         # Cliente HTTP base
│   │   ├── auth.js        # Servicios de autenticación
│   │   ├── alerts.js      # Servicios de alertas
│   │   └── users.js       # Servicios de usuarios
│   ├── utils/             # Funciones auxiliares y utilidades
│   │   ├── constants.js   # Constantes de la aplicación
│   │   ├── validation.js  # Validaciones de formularios
│   │   └── storage.js     # Gestión de almacenamiento local
│   └── navigation/        # Configuración de navegación
├── assets/                # Recursos estáticos (iconos, imágenes)
├── docs/                  # Documentación del proyecto
├── tests/                 # Archivos de pruebas
├── public/                # Archivos públicos (web)
└── scripts/               # Scripts de automatización
```

## Stack Tecnológico

- **React Native** 0.79+
- **Expo SDK** 53+
- **React Navigation** 7
- **React Native Maps**
- **Expo Location** para geolocalización
- **Expo SecureStore** para persistencia segura

## Dispositivos Soportados

- **iOS**: 13.0+
- **Android**: API 21+ (Android 5.0)

## Licencia

MIT License - ver archivo [LICENSE](LICENSE) para más detalles.
