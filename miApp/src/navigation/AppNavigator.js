import React from 'react';
import { View, ActivityIndicator } from 'react-native'; // Importamos ActivityIndicator
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
import ChatIndividualClienteScreen from '../screens/productor/ChatIndividualClienteScreen';
import ChatIndividualProductorScreen from '../screens/consumidor/ChatIndividualProductorScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  // 1. Agregamos loadingAuth para esperar a que cargue la sesión
  const { isAuthenticated, user, loadingAuth } = useApp();

  // 2. Pantalla de carga (Splash Screen temporal)
  // Esto evita que la app intente navegar antes de saber si estás logueado
  if (loadingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#6B9B37" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {!isAuthenticated ? (
          // =================================================
          // STACK PÚBLICO (No logueado)
          // =================================================
          <>
            <Stack.Screen 
              name="Welcome" 
              component={WelcomeScreen}
            />
            <Stack.Screen 
              name="RoleSelection" 
              component={RoleSelectionScreen}
            />
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
            />
            <Stack.Screen 
              name="RegisterProductor" 
              component={RegisterProductor}
            />
            <Stack.Screen 
              name="RegisterConsumidor" 
              component={RegisterConsumidor}
            />
          </>
        ) : (
          // =================================================
          // STACK PRIVADO (Logueado - Según Rol)
          // =================================================
          <>
            {/* Rutas para PRODUCTOR */}
            {user?.role === 'productor' && (
              <>
                <Stack.Screen name="ProductorDashboard" component={ProductorDashboard} />
                <Stack.Screen name="ProducerHome" component={ProducerHomeScreen} />
                <Stack.Screen name="AddProduct" component={AddProductScreen} />
                <Stack.Screen name="ProducerProfile" component={ProducerProfileScreen} />
                <Stack.Screen name="ChatIndividualCliente" component={ChatIndividualClienteScreen} />
              </>
            )}

            {/* Rutas para CONSUMIDOR */}
            {user?.role === 'consumidor' && (
              <>
                <Stack.Screen name="ConsumidorDashboard" component={ConsumidorDashboard} />
                <Stack.Screen name="ChatIndividualProductor" component={ChatIndividualProductorScreen} />
              </>
            )}

            {/* Rutas para ADMINISTRADOR */}
            {user?.role === 'administrador' && (
              <>
                <Stack.Screen name="AdministradorDashboard" component={AdministradorDashboard} />
              </>
            )}

            {/* Rutas COMUNES (Configuración, etc.) */}
            <Stack.Screen name="Configuracion" component={ConfiguracionScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// 3. ¡HE BORRADO LAS FUNCIONES DE ABAJO! 
// No son necesarias y causaban el conflicto.