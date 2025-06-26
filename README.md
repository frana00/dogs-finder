# Dogs Finder

Aplicación móvil React Native para la gestión comunitaria de alertas de perros perdidos y encontrados, facilitando la coordinación de esfuerzos de rescate.

## Arquitectura

**Frontend**: React Native con Expo  
**Backend**: API REST ([Ver repositorio](https://github.com/frana00/petfinder-be))  
**Navegación**: React Navigation 6  
**Estado**: Context API  
**Mapas**: React Native Maps  
**Autenticación**: HTTP Basic Auth  

## Funcionalidades principales

- **Gestión de Alertas**: Crear, visualizar y administrar alertas de mascotas con geolocalización
- **Mapas Interactivos**: Visualización en tiempo real de alertas por ubicación
- **Sistema de Usuarios**: Registro, autenticación y gestión de perfiles
- **Búsqueda Avanzada**: Filtrado por tipo de mascota, estado y proximidad geográfica
- **Galería Multimedia**: Gestión de hasta 5 fotografías por alerta

## Instalación y configuración

### Requisitos previos
- Node.js 18+
- Expo CLI
- Simulador iOS / Emulador Android
- Backend configurado y ejecutándose (ver repositorio del backend)

### IMPORTANTE: Backend requerido

Esta aplicación **requiere un backend en funcionamiento**. El backend se encuentra en un repositorio separado:

**Backend Repository**: https://github.com/frana00/petfinder-be

**Debes configurar y ejecutar el backend ANTES de usar esta aplicación.**

### Instalación Completa

#### 1. Configurar el Backend
```bash
# Clonar el repositorio del backend
git clone https://github.com/frana00/petfinder-be.git
cd petfinder-be

# Seguir las instrucciones del README del backend para:
# - Instalar dependencias
# - Configurar la base de datos (si aplica)
# - Ejecutar migraciones (si aplica)
# - Iniciar el servidor
```

#### 2. Configurar el Frontend
```bash
# Clonar este repositorio (frontend)
git clone <repository-url>
cd petsignal-clean

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con las credenciales correspondientes

# Configurar variables de entorno
cp .env.example .env
# Editar .env con las credenciales correspondientes

# Iniciar la aplicación
expo start
```

#### 3. Configuración de red
```bash
# Configurar red de desarrollo
cp src/utils/network.config.example.js src/utils/network.config.js
```

### Variables de entorno
```bash
# URL del backend (ajustar IP según tu configuración)
EXPO_PUBLIC_API_BASE_URL=http://[IP_SERVIDOR]:8080

# Credenciales de administrador (configuradas en el backend)
EXPO_PUBLIC_ADMIN_USERNAME=[usuario_admin]
EXPO_PUBLIC_ADMIN_PASSWORD=[password_admin]
```

### Configuración de conectividad

**Para desarrollo local:**
- El backend corre por defecto en el puerto `8080` (verificar en el README del backend)
- Reemplaza `[IP_SERVIDOR]` con la IP de tu máquina local
- En simulador iOS usa tu IP local (ej: `192.168.1.100`)
- En Android emulator puedes usar `10.0.2.2` para localhost

**Ejemplo de configuración:**
```bash
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:8080
```

## Estructura del proyecto

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

### Frontend
- **React Native** 0.79+
- **Expo SDK** 53+
- **React Navigation** 7
- **React Native Maps**
- **Expo Location** para geolocalización
- **Expo SecureStore** para persistencia segura

### Backend
- API REST (ver repositorio del backend para detalles técnicos)
- Autenticación y gestión de usuarios
- Almacenamiento de alertas y multimedia
- Endpoints para búsqueda y filtrado

## Repositorios relacionados

- **Frontend (este repo)**: Aplicación móvil React Native
- **Backend**: https://github.com/frana00/petfinder-be - API REST y base de datos

## Solución de problemas comunes

### Error de conexión con Backend
```
Network request failed / Unable to connect
```
**Solución**: 
1. Verifica que el backend esté ejecutándose en el puerto correcto
2. Confirma que la IP en `EXPO_PUBLIC_API_BASE_URL` sea correcta
3. Asegúrate de que el firewall permita conexiones al puerto del backend

### Error de autenticación
```
401 Unauthorized
```
**Solución**: 
1. Verifica las credenciales en el archivo `.env`
2. Asegúrate de que el usuario administrador esté creado en el backend

### Problemas con mapas
```
Map not loading / Location services disabled
```
**Solución**: 
1. Verifica los permisos de ubicación en el dispositivo/simulador
2. Confirma que la API key de Google Maps esté configurada (si aplica)

## Dispositivos Soportados

- **iOS**: 13.0+
- **Android**: API 21+ (Android 5.0)

## Licencia

MIT License - ver archivo [LICENSE](LICENSE) para más detalles.
