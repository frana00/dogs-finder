# PetSignal

Aplicación móvil para gestionar alertas de mascotas perdidas y encontradas.

## Instalación

```bash
# Clonar repositorio
git clone https://github.com/frana00/dogs-finder.git
cd dogs-finder

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con credenciales del backend

# Ejecutar aplicación
npx expo start
```

## Tecnologías

- React Native / Expo
- React Navigation
- Axios
- Expo SecureStore
- Expo ImagePicker

## Configuración

### Variables de entorno requeridas

```bash
EXPO_PUBLIC_API_BASE_URL=http://[IP_SERVIDOR]:8080
EXPO_PUBLIC_ADMIN_USERNAME=[usuario_admin]
EXPO_PUBLIC_ADMIN_PASSWORD=[password_admin]
```

### Configuración de red (desarrollo)

Copiar y editar el archivo de configuración:
```bash
cp src/utils/network.config.example.js src/utils/network.config.js
```

## Funcionalidades

- Crear alertas de mascotas perdidas/encontradas
- Subir y gestionar fotos (máximo 5 por alerta)
- Geolocalización y códigos postales
- Autenticación y perfil de usuario
- Edición/eliminación de alertas propias

## Estructura del proyecto

```
src/
├── components/     # Componentes reutilizables
├── context/        # Contextos de React
├── navigation/     # Configuración de navegación
├── screens/        # Pantallas de la aplicación
├── services/       # API y servicios
└── utils/          # Utilidades y configuración
```

## API Endpoints

**Autenticación:**
- `POST /users/register` - Registro
- `POST /users/login` - Login
- `GET /users/profile` - Perfil

**Alertas:**
- `GET /alerts` - Listar alertas
- `POST /alerts` - Crear alerta
- `PUT /alerts/{id}` - Editar alerta
- `DELETE /alerts/{id}` - Eliminar alerta

**Fotos:**
- `POST /alerts/{id}/photos` - Subir fotos
- `DELETE /photos/{id}` - Eliminar foto

## Licencia

MIT License
