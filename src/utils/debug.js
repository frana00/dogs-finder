import { Alert, Platform } from 'react-native';
import { API_CONFIG } from './constants';
import { getDevelopmentApiUrl, getProductionApiUrl, isDevelopment } from './network';
import { getUserData, getCredentials } from './storage';

/**
 * Shows debug information about the current environment
 */
export const showDebugInfo = () => {
  const debugInfo = `
🔧 INFORMACIÓN DE DEBUG

🌐 Configuración de Red:
• API URL: ${API_CONFIG.BASE_URL}
• Timeout: ${API_CONFIG.TIMEOUT}ms
• Modo: ${isDevelopment() ? 'Desarrollo' : 'Producción'}

📱 Dispositivo:
• Platform: ${Platform.OS}
• Environment: ${__DEV__ ? 'Development' : 'Production'}

🔍 URLs por Entorno:
• Dev URL: ${getDevelopmentApiUrl()}
• Prod URL: ${getProductionApiUrl()}

⚠️ Solución de Problemas:
• Ambos dispositivos en misma WiFi
• Backend corriendo en IP correcta
• Sin firewall bloqueando puerto 8080
• Usar "Test de Conectividad" para verificar
  `;

  Alert.alert('Debug Info', debugInfo);
};

/**
 * Shows connectivity test information
 */
export const showConnectivityInfo = () => {
  const info = `
Test de Conectividad:

1️⃣ Desde tu dispositivo, abre el navegador
2️⃣ Navega a: ${API_CONFIG.BASE_URL}
3️⃣ Deberías ver una respuesta del servidor

Si no funciona, verifica:
• La IP de tu máquina: ifconfig | grep "inet "
• Que el servidor esté corriendo: lsof -i :8080
• Firewall/antivirus no esté bloqueando
  `;

  Alert.alert('Test de Conectividad', info);
};

/**
 * Shows current user data stored locally (for debugging)
 */
export const showStoredUserData = async () => {
  try {
    const userData = await getUserData();
    const credentials = await getCredentials();
    
    const debugInfo = `
🗂️ DATOS ALMACENADOS

👤 Credenciales:
• Username: ${credentials?.username || 'No encontrado'}
• Password: ${credentials?.password ? '••••••••' : 'No encontrado'}

📱 Datos de Usuario:
• ID: ${userData?.id || 'No encontrado'}
• Email: ${userData?.email || 'No encontrado'}
• Teléfono: ${userData?.phoneNumber || 'Vacío'}
• Email suscripción: ${userData?.subscriptionEmail || 'No encontrado'}
• Rol: ${userData?.role || 'No encontrado'}
• Fecha registro: ${userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'No encontrado'}
• Último login: ${userData?.lastLogin ? new Date(userData.lastLogin).toLocaleDateString() : 'No encontrado'}
    `;

    Alert.alert('Datos Almacenados', debugInfo);
  } catch (error) {
    Alert.alert('Error', 'No se pudieron cargar los datos almacenados: ' + error.message);
  }
};
