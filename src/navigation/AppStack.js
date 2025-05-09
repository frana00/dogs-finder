import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';

// Importar pantallas
import ProfileScreen from '../screens/ProfileScreen';
import LostDogsListScreen from '../screens/LostDogs/LostDogsListScreen';
import CreateAlertScreen from '../screens/LostDogs/CreateAlertScreen';
import LostDogDetailScreen from '../screens/LostDogs/LostDogDetailScreen';
import ContactOwnerScreen from '../screens/LostDogs/ContactOwnerScreen';
import ContactChatScreen from '../screens/LostDogs/ContactChatScreen';
import FoundDogDetailScreen from '../screens/FoundDogs/FoundDogDetailScreen';
import FoundDogsListScreen from '../screens/FoundDogs/FoundDogsListScreen';
import CreateFoundAlertScreen from '../screens/FoundDogs/CreateFoundAlertScreen';
import ChatScreen from '../screens/ChatScreen';

const Tab = createBottomTabNavigator();

import { createNativeStackNavigator } from '@react-navigation/native-stack';

const LostDogsStackNavigator = createNativeStackNavigator();

function LostDogsStack() {
  return (
    <LostDogsStackNavigator.Navigator>
      <LostDogsStackNavigator.Screen name="LostDogsList" component={LostDogsListScreen} options={{ title: 'Perros Perdidos' }} />
      <LostDogsStackNavigator.Screen name="LostDogDetail" component={LostDogDetailScreen} options={{ title: 'Detalle de Perro Perdido' }} />
      <LostDogsStackNavigator.Screen name="FoundDogDetail" component={FoundDogDetailScreen} options={{ title: 'Detalle de Perro Encontrado' }} />
      <LostDogsStackNavigator.Screen name="CreateAlert" component={CreateAlertScreen} options={{ title: 'Crear Alerta' }} />
      <LostDogsStackNavigator.Screen name="ContactOwner" component={ContactOwnerScreen} options={{ title: 'Contactar al Dueño' }} />
      <LostDogsStackNavigator.Screen name="ContactChat" component={ContactChatScreen} options={{ title: 'Chat con Dueño' }} />
    </LostDogsStackNavigator.Navigator>
  );
}

const FoundDogsStackNavigator = createNativeStackNavigator();

function FoundDogsStack() {
  return (
    <FoundDogsStackNavigator.Navigator>
      <FoundDogsStackNavigator.Screen name="FoundDogsListScreen" component={FoundDogsListScreen} options={{ title: 'Perros Encontrados' }} />
      <FoundDogsStackNavigator.Screen name="FoundDogDetail" component={FoundDogDetailScreen} options={{ title: 'Detalle de Perro Encontrado' }} />
      <FoundDogsStackNavigator.Screen name="CreateFoundAlertScreen" component={CreateFoundAlertScreen} options={{ title: 'Perro Encontrado' }} />
    </FoundDogsStackNavigator.Navigator>
  );
}

const AppStack = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Perdidos') {
            iconName = focused ? 'paw' : 'paw-outline';
          } else if (route.name === 'Encontrados') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Mensajes') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF9800',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
    >
      <Tab.Screen name="Perdidos" options={{ title: 'Perdidos' }}>
        {() => (
          <LostDogsStack />
        )}
      </Tab.Screen>
      <Tab.Screen name="Encontrados" options={{ title: 'Encontrados' }}>
        {() => (
          <FoundDogsStack />
        )}
      </Tab.Screen>
      <Tab.Screen name="Mensajes" component={ChatScreen} options={{ title: 'Mensajes' }} />
      <Tab.Screen name="Perfil" component={ProfileScreen} options={{ title: 'Mi Perfil' }} />
    </Tab.Navigator>
  );
};

export default AppStack;
