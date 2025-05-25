# 🐕 Dogs Finder App

Una aplicación móvil React Native para ayudar a encontrar mascotas perdidas y reportar mascotas encontradas, **integrada con backend Spring Boot** y sistema de fallback local para funcionar offline.

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=spring&logoColor=white)

## ✨ Características Principales

### 🔐 **Autenticación Integrada**
- **Backend Spring Boot** con JWT tokens
- Sistema híbrido: **API real + fallback local**
- Registro y login funcionan **con o sin backend**
- Almacenamiento seguro con AsyncStorage
- Detección automática de dispositivo vs simulador

### 📱 **Gestión de Alertas**
- **Perros perdidos**: Crear y visualizar alertas con fotos, ubicación y detalles
- **Perros encontrados**: Reportar hallazgos con información de contacto
- **Upload de fotos**: Integración con **AWS S3** usando presigned URLs
- **Geolocalización**: Mapas interactivos con React Native Maps
- **Backend integración**: Datos sincronizados con Spring Boot API

### 🗺️ **Funcionalidades del Mapa**
- Visualización de ubicaciones de perros perdidos y encontrados
- Marcadores diferenciados por tipo de alerta
- Integración con React Native Maps
- Coordenadas precisas de cada reporte

### 💬 **Sistema de Comunicación**
- Chat directo entre usuarios
- Contacto con dueños de mascotas
- Notificaciones de mensajes nuevos

### 👤 **Perfil de Usuario**
- Perfil editable con datos personales
- Historial de alertas creadas
- Gestión de preferencias

## 🛠️ Tecnologías Utilizadas

### **Frontend**
- **React Native** 0.79.2 - Framework principal
- **Expo** ~53.0.0 - Plataforma de desarrollo
- **React Navigation** 7.x - Navegación entre pantallas
- **React Native Maps** 1.20.1 - Mapas interactivos

### **Backend**
- **Spring Boot** 3.2.3 - API REST principal
- **MySQL** - Base de datos
- **AWS S3** - Almacenamiento de fotos con presigned URLs
- **JWT** - Autenticación y autorización

### **Estado y Contexto**
- **React Context** - Gestión de estado global
- **AsyncStorage** - Almacenamiento local persistente

### **UI/UX**
- **Expo Vector Icons** - Iconografía
- **React Native Modal** - Modales nativos
- **Expo Constants** - Detección de dispositivo vs simulador

### **Networking y APIs**
- **Fetch API** - Cliente HTTP nativo
- **React Native Dotenv** - Variables de entorno
- **Detección inteligente de IP** - Simulador vs dispositivo físico

### **Utilidades**
- **Crypto-js** 4.2.0 - Hashing seguro de contraseñas
- **Expo Image Picker** - Selección de imágenes
- **Expo Location** - Servicios de geolocalización

## 🏗️ Arquitectura del Proyecto

```
dogs-finder/
├── 📱 App.js                           # Punto de entrada principal
├── ⚙️ app.config.js                    # Configuración de Expo con variables de entorno
├── 📦 package.json                     # Dependencias y scripts
├── 🔧 babel.config.js                  # Configuración de Babel con dotenv
├── 📝 TESTING_CREDENTIALS.md           # Credenciales de prueba y documentación
├── 🔐 .env                            # Variables de entorno (excluido de git)
├── 🚫 .gitignore                      # Archivos ignorados por git
├── 🎨 assets/                         # Recursos estáticos
│   ├── adaptive-icon.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash-icon.png
└── 📂 src/
    ├── 🧩 components/                 # Componentes reutilizables
    │   ├── EmptyState.js             # Estado vacío
    │   ├── ErrorHandler.js           # Manejo de errores
    │   └── LoadingScreen.js          # Pantalla de carga
    ├── ⚙️ config/
    │   ├── api.js                    # Configuración de API con variables de entorno
    │   └── api.example.js            # Ejemplo de configuración
    ├── 🗃️ context/                   # Contextos de React
    │   ├── AlertContext.js           # Estado global de alertas con fallback
    │   └── AuthContext.js            # Estado de autenticación híbrido
    ├── 💾 data/
    │   └── dummyData.js              # Datos de prueba con autenticación local
    ├── 🧭 navigation/                 # Configuración de navegación
    │   ├── AppStack.js               # Stack para usuarios autenticados
    │   ├── AuthStack.js              # Stack de autenticación
    │   └── RootStackNavigator.js     # Navegador principal
    ├── 📱 screens/                   # Pantallas de la aplicación
    │   ├── 🔐 Auth/
    │   │   ├── LoginScreen.js        # Inicio de sesión con fallback
    │   │   └── RegisterScreen.js     # Registro con fallback
    │   ├── 🟢 FoundDogs/
    │   │   ├── CreateFoundAlertScreen.js   # Crear reporte de perro encontrado
    │   │   ├── FoundDogDetailScreen.js     # Detalle con visor de imágenes
    │   │   └── FoundDogsListScreen.js      # Lista con datos híbridos
    │   ├── 🔴 LostDogs/
    │   │   ├── ContactChatScreen.js        # Chat con quien encontró
    │   │   ├── ContactOwnerScreen.js       # Contactar dueño
    │   │   ├── CreateAlertScreen.js        # Crear alerta de perro perdido
    │   │   ├── LostDogDetailScreen.js      # Detalle con galería
    │   │   └── LostDogsListScreen.js       # Lista con fallback
    │   ├── 🗺️ MapScreen.js                # Mapa interactivo con marcadores
    │   ├── 💬 ChatScreen.js               # Sistema de mensajería
    │   └── 👤 ProfileScreen.js            # Perfil de usuario editable
    └── 🌐 services/
        ├── alertService.js           # Cliente API con manejo de errores y fallback
        ├── apiService.js             # Servicio principal con transformación de datos
        └── photoService.js           # Upload de fotos a AWS S3 con presigned URLs
```

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- Node.js 16+ 
- npm o yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (Mac) o Android Studio

### **1. Clonar el Repositorio**
```bash
git clone <repository-url>
cd dogs-finder
```

### **2. Instalar Dependencias**
```bash
npm install
```

### **3. Configurar Variables de Entorno**
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus valores
GOOGLE_PLACES_API_KEY=tu_google_places_api_key
BACKEND_URL=http://<TU_IP_LOCAL>:8080/api/v1  # Reemplaza <TU_IP_LOCAL> por la IP de tu máquina en la red local
```

**Nota**: La app detecta automáticamente si está ejecutándose en simulador o dispositivo físico y ajusta la URL del backend accordingly.

### **4. Iniciar la Aplicación**
```bash
# Iniciar servidor de desarrollo
npm start

# O directamente en simuladores
npm run ios     # iOS Simulator
npm run android # Android Emulator
```

## 📱 Uso de la Aplicación

### **🔐 Autenticación**

#### **Modo Online (con Backend Spring Boot)**
- Registro e inicio de sesión con API REST
- Sincronización automática de datos con MySQL
- Upload de fotos a AWS S3
- Validaciones del servidor
- Transformación automática de datos backend↔frontend

#### **Modo Offline (Fallback Local)**
- Registro local cuando backend no disponible
- Login con credenciales almacenadas localmente
- Mensaje informativo sobre el estado de conexión

**Credenciales de Prueba:**
```
Email: test@test.com
Contraseña: test123
```

### **🗺️ Navegación Principal**
1. **🏠 Home**: Lista de perros perdidos y encontrados
2. **🗺️ Mapa**: Visualización geográfica de alertas
3. **💬 Chat**: Sistema de mensajería
4. **👤 Perfil**: Configuración de cuenta

### **📝 Crear Alertas**
- **Perro Perdido**: Incluir fotos, descripción, ubicación, chip
- **Perro Encontrado**: Estado del perro, contacto, ubicación segura

## 🔧 Sistema de Fallback

### **🟢 Ventajas del Sistema Híbrido**
- ✅ **Funciona offline**: App completamente operativa sin backend
- ✅ **Sincronización automática**: Cuando backend está disponible
- ✅ **Experiencia continua**: Sin interrupciones para el usuario
- ✅ **Desarrollo ágil**: No depende del estado del backend

### **📊 Estados de Conexión**
- **🟢 Online**: API real + sincronización completa
- **🟡 Degradado**: Algunos servicios offline, core funcional
- **🔴 Offline**: Fallback completo con datos locales

## 🧪 Testing y Desarrollo

### **Credenciales de Prueba Disponibles**
Consulta `TESTING_CREDENTIALS.md` para:
- Usuarios preconfigurados
- Datos de prueba
- Escenarios de testing
- Instrucciones detalladas

### **Scripts Disponibles**
```bash
npm start          # Servidor de desarrollo
npm run ios        # iOS Simulator
npm run android    # Android Emulator  
npm run web        # Versión web (limitada)
```

## 🔒 Seguridad

- **🔐 Hashing de contraseñas**: SHA256 tanto local como remoto
- **🛡️ Validación de inputs**: Frontend y backend
- **🔑 Gestión de tokens**: JWT con renovación automática
- **📱 Almacenamiento seguro**: AsyncStorage encriptado

## 🌟 Características Destacadas

### **📸 Visualización de Imágenes**
- Galería personalizada con navegación
- Reemplazo de `react-native-image-viewing` por compatibilidad
- Soporte para múltiples imágenes por alerta

### **🗺️ Integración de Mapas**
- Marcadores diferenciados por tipo de alerta
- Información detallada en callouts
- Navegación directa a detalles desde mapa

### **🔄 Sistema de Contextos**
- **AuthContext**: Gestión de autenticación híbrida
- **AlertContext**: Estado de alertas con fallback automático

## 🚧 Estado del Proyecto

### **✅ Completado**
- ✅ **Backend Spring Boot integración** - API REST completamente funcional
- ✅ **Upload de fotos a AWS S3** - Con presigned URLs
- ✅ **Autenticación JWT** - Login/registro con backend
- ✅ **Detección automática de entorno** - Simulador vs dispositivo físico
- ✅ **CRUD de alertas** - Con backend integration y fallback
- ✅ **Sistema de mapas** - Marcadores dinámicos desde backend
- ✅ **Navegación completa** - Stack navigation funcional
- ✅ **Manejo de errores robusto** - Con fallback automático
- ✅ **Variables de entorno** - Configuración segura
- ✅ **Compatibilidad cross-platform** - iOS y Android

### **🔄 En Desarrollo**
- 🔄 **Chat en tiempo real** - Sistema de mensajería
- 🔄 **Geolocalización avanzada** - Coordenadas en alertas
- 🔄 **Notificaciones push** - Para alertas cercanas
- 🔄 **Filtros avanzados** - Por ubicación, raza, fecha

### **📋 Próximas Funcionalidades**
- 🔮 Reconocimiento de imágenes con IA
- 🔮 Notificaciones por proximidad
- 🔮 Sistema de recompensas
- 🔮 Integración con redes sociales

## 🔗 Integración con Backend

### **🌐 API Spring Boot**
La aplicación está integrada con un backend Spring Boot que proporciona:

- **Autenticación JWT** - Login/registro seguro
- **Base de datos MySQL** - Persistencia de alertas y usuarios  
- **AWS S3 Integration** - Upload de fotos con presigned URLs
- **API REST completa** - CRUD de alertas, usuarios, fotos

### **🔄 Transformación de Datos**
- **Frontend→Backend**: Conversión automática de estructuras de datos
- **Backend→Frontend**: Adaptación de respuestas para React Native
- **Fotos**: `photoUrls` (backend) ↔ `photoFilenames` (frontend)

### **🛠️ Configuración del Backend**
```bash
# El backend debe estar ejecutándose en:
# http://172.20.10.10:8080/api/v1

# Endpoints principales:
POST /auth/login           # Autenticación
GET  /alerts              # Obtener alertas
POST /alerts              # Crear alerta
POST /alerts/{id}/photos  # Upload de fotos
```

### **📱 Detección de Entorno**
La app detecta automáticamente:
- **iOS Simulator**: Usa IP local para conexión al backend
- **Dispositivo físico**: Configura IP de red para acceso real
- **Backend no disponible**: Fallback automático a datos locales

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Autores

- **Fran** - *Desarrollo Frontend* - [@frana00](https://github.com/frana00)
- **Hannah** - *Desarrollo Backend* - [@Hannah-bannanah](https://github.com/Hannah-bannanah)
- **Dani** - *Algoritmo de Inteligencia Artificial* - [@dasniela](https://github.com/dasniela)


## 🙏 Agradecimientos

- Expo team por la excelente plataforma de desarrollo
- React Native community
- Contribuidores de las librerías utilizadas
