import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppStack from './AppStack'; // Tu TabNavigator existente
import LostDogDetailScreen from '../screens/LostDogs/LostDogDetailScreen';
import FoundDogDetailScreen from '../screens/FoundDogs/FoundDogDetailScreen';

const RootStackNav = createNativeStackNavigator();

export default function RootStackNavigator() {
  return (
    <RootStackNav.Navigator screenOptions={{ headerShown: false }}>
      <RootStackNav.Screen name="MainTabs" component={AppStack} />
      <RootStackNav.Screen 
        name="LostDogDetailScreen" 
        component={LostDogDetailScreen} 
        options={{ 
          headerShown: true, 
          title: 'Detalle Perro Perdido',
          headerBackTitle: 'Volver'
        }} 
      />
      <RootStackNav.Screen 
        name="FoundDogDetailScreen" 
        component={FoundDogDetailScreen} 
        options={{ 
          headerShown: true, 
          title: 'Detalle Perro Encontrado',
          headerBackTitle: 'Volver'
        }} 
      />
    </RootStackNav.Navigator>
  );
}
