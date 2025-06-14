# PetSignal 🐾

Una aplicación móvil para gestionar alertas de mascotas perdidas y encontradas, desarrollada con React Native y Expo.

## ⚙️ CONFIGURACIÓN INICIAL OBLIGATORIA

### 🔐 Variables de Entorno (CRÍTICO)

**ANTES de ejecutar la aplicación, DEBES configurar las variables de entorno:**

1. **Copiar plantilla:**
   ```bash
   cp .env.example .env
   ```

2. **Solicitar credenciales:** Contacta al administrador del proyecto para obtener:
   - `EXPO_PUBLIC_ADMIN_USERNAME`
   - `EXPO_PUBLIC_ADMIN_PASSWORD`
   - `EXPO_PUBLIC_API_BASE_URL`

3. **Completar tu `.env` local:**
   ```bash
   # API Configuration
   EXPO_PUBLIC_API_BASE_URL=http://[IP_DEL_SERVIDOR]:8080
   
   # Admin Credentials (proporcionadas por el admin)
   EXPO_PUBLIC_ADMIN_USERNAME=[usuario_admin]
   EXPO_PUBLIC_ADMIN_PASSWORD=[password_admin]
   ```

4. **⚠️ IMPORTANTE:**
   - **NUNCA** comitees el archivo `.env`
   - **SIEMPRE** mantén tus credenciales privadas
   - **SOLICITA** nuevas credenciales si las anteriores se comprometieron

## 🚀 Instalación

```bash
# 1. Clonar repositorio
git clone [URL_DEL_REPO]
cd petsignal

# 2. Instalar dependencias
npm install

# 3. Configurar .env (ver sección anterior)
cp .env.example .env
# Editar .env con credenciales reales

# 4. Ejecutar aplicación
npx expo start
```

## 📱 Tecnologías

- React Native
- Expo
- React Navigation
- Axios (cliente HTTP)
- Expo SecureStore (almacenamiento seguro)
- Expo ImagePicker (selección de fotos)
- Custom Date Picker (fechas multiplataforma)

## 🛠️ Instalación y Configuración

### Prerrequisitos

- Node.js 16 o superior
- Expo CLI
- Dispositivo físico o simulador

### Configuración inicial

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd petsignal
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar red para desarrollo**
   ```bash
   # Copiar archivo de configuración de red
   cp src/utils/network.config.example.js src/utils/network.config.js
   ```

4. **Editar configuración de red**
   
   Abrir `src/utils/network.config.js` y actualizar:
   ```javascript
   export const NETWORK_CONFIG = {
     DEV_IP: 'TU_IP_LOCAL', // Encuentra tu IP con ipconfig/ifconfig
     API_PORT: 8080,
     OVERRIDE_IP: null,
     PRODUCTION_URL: 'https://tu-servidor-produccion.com'
   };
   ```

5. **Encontrar tu IP local**
   
   En macOS/Linux:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
   
   En Windows:
   ```bash
   ipconfig
   ```

### Ejecutar la aplicación

1. **Iniciar el servidor de desarrollo**
   ```bash
   npx expo start
   ```

2. **Ejecutar en dispositivo**
   - Escanear el código QR con Expo Go
   - O presionar `i` para iOS Simulator / `a` para Android Emulator

## 🔧 Desarrollo

### Características principales implementadas

**AlertForm con funcionalidad completa:**
- Formulario con todos los campos requeridos por el backend
- Selector de fecha personalizado que funciona en web y móvil
- Selector de fotos con vista previa (máximo 5 fotos)
- Validación de campos obligatorios
- Campos de ubicación manual (ubicación y código postal)

**Gestión de alertas:**
- Creación de alertas con subida de fotos
- Integración completa con backend API
- Manejo de errores y estados de carga
- Navegación optimizada post-creación

**Compatibilidad multiplataforma:**
- Implementación defensiva para evitar errores de NativeEventEmitter
- Lazy loading de componentes nativos
- Fallbacks para funcionalidades específicas de plataforma

### 🔧 Arreglos y mejoras implementadas

**Estado de botones y formularios:**
- ✅ Arreglo del estado de carga del botón (no se queda atascado)
- ✅ Validación de formularios en tiempo real
- ✅ Botón de edición funcional en modo edición
- ✅ Manejo correcto de errores y estados de carga

**Vista previa de fotos:**
- ✅ Previsualización inmediata de fotos seleccionadas
- ✅ Sincronización perfecta entre componentes
- ✅ Eliminación y descripción de fotos

**Seguridad y autorización:**
- ✅ Control de permisos por usuario (solo editar alertas propias)
- ✅ Validación de autorización en UI y lógica
- ✅ Mensajes de error apropiados para accesos no autorizados

**Formulario de alertas optimizado:**
- ✅ Campos opcionales para mascotas vistas vs perdidas
- ✅ Código postal opcional (evita errores de validación)
- ✅ Mapeo correcto de tipos de alerta (SEEN/LOST)
- ✅ Limpieza de datos antes del envío

> 📚 **Documentación detallada**: Todos los arreglos están documentados en la carpeta `/docs/` con explicaciones técnicas, código de ejemplo y guías de testing.

### Estructura del proyecto

```
src/
├── components/
│   ├── alerts/          # Componentes específicos de alertas
│   ├── common/          # Componentes reutilizables
│   ├── forms/           # Formularios (AlertForm)
│   └── photos/          # Componentes de galería y picker
├── context/             # Contextos de React (Auth, Alert)
├── navigation/          # Configuración de navegación
├── screens/            # Pantallas de la aplicación
│   ├── alerts/         # Creación, edición y detalle de alertas
│   ├── auth/           # Login y registro
│   ├── home/           # Pantalla principal
│   └── profile/        # Perfil de usuario
├── services/           # Servicios API (alerts, photos, etc.)
└── utils/              # Utilidades y configuración

docs/                   # 📚 Documentación técnica del proyecto
├── README.md           # Índice de toda la documentación
├── *_COMPLETE.md       # Documentos de arreglos implementados
├── *_GUIDE.md          # Guías de desarrollo y testing
└── PHASE_*.md          # Documentación por fases de desarrollo

tests/                  # 🧪 Tests de desarrollo (en .gitignore)
├── README.md           # Guía de tests de debugging
├── test_*.js           # Tests específicos de funcionalidades
├── TestRunner.js       # Ejecutor de tests de desarrollo
└── test_template.js    # Template para nuevos tests
```

### Configuración de API

El proyecto usa un sistema de configuración flexible:

- **Desarrollo**: Usa IP local configurada en `network.config.js`
- **Producción**: Usa URL configurada en `PRODUCTION_URL`

### Debugging

La aplicación incluye herramientas de debug en la pantalla de login:

- **Info**: Información de red y conectividad
- **Test**: Prueba de conexión a la API
- **Datos**: Visualización de datos almacenados localmente

### 📚 Documentación técnica

El proyecto incluye documentación completa en `/docs/`:

- **Arreglos implementados**: Documentación detallada de cada fix realizado
- **Guías de desarrollo**: Procesos de desarrollo por fases
- **Testing**: Guías de pruebas y validación
- **Seguridad**: Implementaciones de autorización y seguridad

### 🧪 Testing y debugging

**Tests de desarrollo** (en `/tests/`, excluidos del repositorio):
- Tests específicos para cada arreglo implementado
- Scripts de debugging y validación
- Template para crear nuevos tests
- TestRunner para ejecutar múltiples tests

**Tests oficiales**:
- `App.test.js` - Tests unitarios del proyecto
- Futura integración con Jest/React Native Testing Library

## 📋 API

La aplicación se conecta a una API REST que debe proporcionar:

### Endpoints requeridos

**Autenticación y Usuarios:**
- `POST /users/register` - Registro de usuarios
- `POST /users/login` - Autenticación
- `GET /users/profile` - Obtener perfil
- `PUT /users/profile` - Actualizar perfil

**Alertas:**
- `GET /alerts` - Listar alertas (con paginación y filtros)
- `POST /alerts` - Crear nueva alerta
- `GET /alerts/{id}` - Obtener alerta específica
- `PUT /alerts/{id}` - Actualizar alerta
- `DELETE /alerts/{id}` - Eliminar alerta

**Fotos:**
- `POST /alerts/{alertId}/photos` - Subir fotos a una alerta
- `DELETE /photos/{photoId}` - Eliminar foto específica

### Autenticación

Usa HTTP Basic Authentication con username/password.

## 🚀 Deployment

### Para desarrollo

1. Asegurar que tu API backend esté ejecutándose
2. Configurar `network.config.js` con tu IP local
3. Ejecutar `npx expo start`
4. **Permisos importantes**: La app requiere permisos de cámara

### Para producción

1. Actualizar `PRODUCTION_URL` en la configuración
2. Configurar permisos en `app.json` para cámara
3. Construir con `expo build`
4. Publicar en stores correspondientes

### Consideraciones de permisos

La aplicación requiere los siguientes permisos:
- **Cámara**: Para tomar fotos de mascotas
- **Galería**: Para seleccionar fotos existentes

## 🔒 Seguridad

- Las credenciales se almacenan de forma segura usando Expo SecureStore
- Las IPs de desarrollo están en archivos gitignored
- No se exponen datos sensibles en el código fuente
- **Control de autorización**: Los usuarios solo pueden editar/eliminar sus propias alertas
- **Validación multicapa**: Verificación en UI y lógica de negocio
- **Documentación y tests protegidos**: Archivos sensibles excluidos del repositorio
- **Configuración de red local protegida**: `.gitignore` optimizado para desarrollo seguro

> 🛡️ **Implementación de seguridad completa**: Ver `/docs/SECURITY_IMPLEMENTATION_COMPLETE.md` para detalles técnicos.

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## 📞 Soporte

**Problemas de conectividad:**
1. Verifica que tu dispositivo esté en la misma red WiFi
2. Usa las herramientas de debug en la pantalla de login
3. Revisa la configuración en `network.config.js`
4. Asegura que el backend esté ejecutándose en el puerto correcto

**Problemas con AlertForm:**
1. Si el selector de fecha no funciona, verifica la implementación multiplataforma
2. Para errores de NativeEventEmitter, asegúrate que los imports sean defensivos
3. Los permisos de cámara deben estar habilitados para subir fotos

**Problemas de fotos:**
1. Verifica permisos de cámara y galería en el dispositivo
2. Máximo 5 fotos por alerta
3. Formatos soportados: JPG, PNG

---

Desarrollado con ❤️ para ayudar a encontrar mascotas perdidas
