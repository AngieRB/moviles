import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';

// Pantallas de autenticación
import WelcomeScreen from '../screens/WelcomeScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterProductor from '../screens/RegisterProductor';
import RegisterConsumidor from '../screens/RegisterConsumidor';

// Dashboards por rol
import ProductorDashboard from '../screens/productor/ProductorDashboard';
import ConsumidorDashboard from '../screens/consumidor/ConsumidorDashboard';
import AdministradorDashboard from '../screens/administrador/AdministradorDashboard';

// Pantallas adicionales
import ConfiguracionScreen from '../screens/common/ConfiguracionScreen';
import ProducerHomeScreen from '../screens/ProducerHomeScreen';
import AddProductScreen from '../screens/AddProductScreen';
import ProducerProfileScreen from '../screens/ProducerProfileScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, user } = useApp();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
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
              name="RegisterProductor" 
              component={RegisterProductor}
              options={{ title: 'Registrarse como Productor' }}
            />
            <Stack.Screen 
              name="RegisterConsumidor" 
              component={RegisterConsumidor}
              options={{ title: 'Registrarse como Consumidor' }}
            />
          </>
        ) : (
          // Stack de dashboards según el rol
          <>
            {user?.role === 'productor' && (
              <>
                <Stack.Screen 
                  name="ProductorDashboard" 
                  component={ProductorDashboard}
                  options={{ title: 'Dashboard Productor' }}
                />
                <Stack.Screen 
                  name="ProducerHome" 
                  component={ProducerHomeScreen} 
                  options={{ title: 'Inicio Productor' }} 
                />
                <Stack.Screen 
                  name="AddProduct" 
                  component={AddProductScreen} 
                  options={{ title: 'Agregar Producto' }} 
                />
                <Stack.Screen 
                  name="ProducerProfile" 
                  component={ProducerProfileScreen} 
                  options={{ title: 'Perfil Productor' }} 
                />
              </>
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
            <Stack.Screen 
              name="Configuracion" 
              component={ConfiguracionScreen} 
              options={{ title: 'Configuración' }} 
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Ajuste para manejar la acción RESET
export function handleNavigationReset(navigation, isAuthenticated, user) {
  if (!isAuthenticated) {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  } else {
    navigation.reset({
      index: 0,
      routes: [{ name: `${user.role}Dashboard` }],
    });
  }
}

// Manejo de errores para la acción RESET
export function handleResetAction(navigation) {
  try {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  } catch (error) {
    console.error('Error al manejar la acción RESET:', error);
    navigation.navigate('Welcome'); // Acción alternativa
  }
}
