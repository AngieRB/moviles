import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';

// Pantallas de autenticación
import WelcomeScreen from '../screens/WelcomeScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Dashboards por rol
import ProductorDashboard from '../screens/productor/ProductorDashboard';
import ConsumidorDashboard from '../screens/consumidor/ConsumidorDashboard';
import AdministradorDashboard from '../screens/administrador/AdministradorDashboard';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, user } = useApp();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {!isAuthenticated ? (
          // Stack de autenticación
          <>
            <Stack.Screen 
              name="Welcome" 
              component={WelcomeScreen}
              options={{ title: 'Bienvenido' }}
            />
            <Stack.Screen 
              name="RoleSelection" 
              component={RoleSelectionScreen}
              options={{ title: 'Selecciona tu rol' }}
            />
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ title: 'Iniciar Sesión' }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen}
              options={{ title: 'Registrarse' }}
            />
          </>
        ) : (
          // Stack de dashboards según el rol
          <>
            {user?.role === 'productor' && (
              <Stack.Screen 
                name="ProductorDashboard" 
                component={ProductorDashboard}
                options={{ title: 'Dashboard Productor' }}
              />
            )}
            {user?.role === 'consumidor' && (
              <Stack.Screen 
                name="ConsumidorDashboard" 
                component={ConsumidorDashboard}
                options={{ title: 'Dashboard Consumidor' }}
              />
            )}
            {user?.role === 'administrador' && (
              <Stack.Screen 
                name="AdministradorDashboard" 
                component={AdministradorDashboard}
                options={{ title: 'Dashboard Administrador' }}
              />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
