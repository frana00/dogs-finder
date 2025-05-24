# Credenciales de Prueba - Dogs Finder App

## Sistema de Fallback Implementado ✅

La aplicación ahora incluye un **sistema de fallback local** que funciona cuando el backend no está disponible. Esto permite usar la app sin conexión al servidor.

## Cómo Probar el Registro y Login

### 1. **Registro de Nuevo Usuario (Fallback Local)**
Cuando el backend no está disponible (error "Network request failed"), la app automáticamente:
- Crea la cuenta localmente
- Muestra mensaje: "Backend no disponible. Tu cuenta se ha creado localmente..."
- Te permite usar la app inmediatamente

**Datos para probar:**
- Nombre: Cualquier nombre
- Email: nuevo@test.com (o cualquier email nuevo)
- Teléfono: +56912345678
- Contraseña: test123
- Confirmar contraseña: test123

### 2. **Login con Usuarios Existentes (Fallback Local)**
Si el backend no está disponible, puedes usar estas credenciales locales:

**Usuario de Prueba:**
- Email: `test@test.com`
- Contraseña: `test123`

**Otros usuarios disponibles:**
- Email: `fran.illanes@email.com` / Contraseña: (hash almacenado)
- Email: `dani.diaz@email.com` / Contraseña: (hash almacenado)
- Email: `jana.montero@email.com` / Contraseña: (hash almacenado)
- Email: `luis.pedraza@email.com` / Contraseña: (hash almacenado)

## Funcionalidades que Funcionan sin Backend

✅ **Autenticación local** (registro y login)
✅ **Visualización de perros perdidos** (datos dummy)
✅ **Visualización de perros encontrados** (datos dummy)
✅ **Mapa con ubicaciones** (datos dummy)
✅ **Navegación completa** de la app
✅ **Visualización de detalles** de alertas
✅ **Creación de alertas** (se guardan localmente)

## Estados de Conexión

**🟢 Backend Disponible:** 
- Todas las operaciones usan la API real
- Datos se sincronizan con el servidor

**🔴 Backend No Disponible:**
- Fallback automático a datos locales
- Alertas informativas al usuario
- Funcionalidad completa con datos dummy

## Notas Importantes

1. **Datos Locales:** Los datos creados en modo offline se almacenan localmente y se pueden sincronizar cuando el backend esté disponible.

2. **Seguridad:** Las contraseñas se almacenan hasheadas con SHA256 incluso en el modo local.

3. **Experiencia del Usuario:** El usuario recibe notificaciones claras sobre el estado de la conexión.

4. **Desarrollo:** Ideal para desarrollar y probar la app sin depender del backend.
