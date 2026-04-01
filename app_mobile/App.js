import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import SolicitanteScreen from './screens/SolicitanteScreen';
import AdminScreen from './screens/AdminScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#0056b3',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#ddd',
            height: 60,
            paddingBottom: 8
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 5
          },
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Solicitar') {
              iconName = 'clipboard-plus';
            } else if (route.name === 'Gestionar') {
              iconName = 'clipboard-check-outline';
            }
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          }
        })}
      >
        <Tab.Screen
          name="Solicitar"
          component={SolicitanteScreen}
          options={{
            tabBarLabel: '📋 Solicitar'
          }}
        />
        <Tab.Screen
          name="Gestionar"
          component={AdminScreen}
          options={{
            tabBarLabel: '👨‍💼 Gestionar'
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
