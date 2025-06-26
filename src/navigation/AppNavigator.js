import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../utils/constants';
import { NETWORK_CONFIG } from '../utils/network.config';
import Loading from '../components/common/Loading';
import DeepLinkHandler from '../components/navigation/DeepLinkHandler';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

// Main Screens
import HomeScreen from '../screens/home/HomeScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import DevScreen from '../screens/dev/DevScreen';

// Alert Screens
import AlertDetailScreen from '../screens/alerts/AlertDetailScreen';
import CreateEditAlertScreen from '../screens/alerts/CreateEditAlertScreen';

// Map Screens
import MapScreen from '../screens/maps/MapScreen';

const Stack = createStackNavigator();

// Auth Stack - for non-authenticated users
const AuthStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
};

// Main Stack - for authenticated users
const MainStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          headerShown: true,
          headerTitle: '',
          headerStyle: {
            backgroundColor: COLORS.background,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: COLORS.primary,
        }}
      />
      
      {/* Reset Password - También disponible para usuarios autenticados */}
      <Stack.Screen 
        name="ResetPassword" 
        component={ResetPasswordScreen}
        options={{
          headerShown: true,
          headerTitle: 'Cambiar Contraseña',
          headerStyle: {
            backgroundColor: COLORS.background,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: COLORS.primary,
        }}
      />
      
      <Stack.Screen 
        name="AlertDetail" 
        component={AlertDetailScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="CreateEditAlert" 
        component={CreateEditAlertScreen}
        options={{
          headerShown: false,
        }}
      />
      
      <Stack.Screen 
        name="Map" 
        component={MapScreen}
        options={{
          headerShown: false,
        }}
      />
      
      {/* Development Screen - Disabled for presentation */}
      {/* {__DEV__ && (
        <Stack.Screen 
          name="Dev" 
          component={DevScreen}
          options={{
            headerShown: true,
            headerTitle: 'Desarrollo',
            headerStyle: {
              backgroundColor: COLORS.background,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: COLORS.primary,
          }}
        />
      )} */}
    </Stack.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  // Configure deep linking
  const getExpoDevIP = () => {
    const ip = NETWORK_CONFIG.OVERRIDE_IP || NETWORK_CONFIG.DEV_IP;
    return ip || '192.168.1.100'; // fallback IP
  };

  const linking = {
    prefixes: [
      'petsignal://', 
      'https://petsignal.com',
      `exp://${getExpoDevIP()}:8081/--/`, // For Expo Go (dynamic IP)
      `http://${getExpoDevIP()}:8081/--/` // For web in Expo Go (dynamic IP)
    ],
    config: {
      screens: {
        Login: 'login',
        Register: 'register',
        ForgotPassword: 'forgot-password',
        ResetPassword: {
          path: 'reset-password/:token',
          parse: {
            token: (token) => token,
          },
        },
        Home: 'home',
        Profile: 'profile',
        AlertDetail: 'alert/:id',
        CreateEditAlert: 'create-alert',
      },
    },
  };

  // Show loading screen while checking authentication status
  if (loading) {
    return <Loading message="Iniciando PetSignal..." />;
  }

  return (
    <NavigationContainer linking={linking}>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
