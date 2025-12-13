import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen}
          options={{
            title: 'Bienvenido',
          }}
        />
        <Stack.Screen 
          name="RoleSelection" 
          component={RoleSelectionScreen}
          options={{
            title: 'Selecciona tu rol',
          }}
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{
            title: 'Iniciar Sesión',
          }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
          options={{
            title: 'Registrarse',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
