import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // <--- IMPORTANTE

import InicioAdminScreen from './InicioAdminScreen';
import ClientesScreen from './ClientesScreen';
import ProductoresAdminScreen from './ProductoresAdminScreen';
import PerfilScreen from '../common/PerfilScreen';
import ConfiguracionScreen from '../common/ConfiguracionScreen';

const Tab = createBottomTabNavigator();

export default function AdministradorDashboard() {
  const theme = useTheme();
  const insets = useSafeAreaInsets(); // <--- OBTENER ESPACIO SEGURO

  return (
    <Tab.Navigator
      screenOptions={({ navigation }) => ({
        tabBarActiveTintColor: '#F5A623',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          paddingHorizontal: 5,
          // CALCULAMOS LA ALTURA AUTOMÁTICAMENTE + 60px base
          height: 60 + insets.bottom, 
          // EMPUJAMOS LOS ÍCONOS HACIA ARRIBA
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8, 
          paddingTop: 8,
        },
        tabBarItemStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginBottom: insets.bottom > 0 ? 0 : 4, // Ajuste fino
        },
        sceneStyle: {
          backgroundColor: theme.colors.background,
        },
        headerStyle: {
          backgroundColor: '#F5A623',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => (
          <Icon
            name="cog"
            size={24}
            color="#FFFFFF"
            onPress={() => navigation.navigate('Configuracion')}
            style={{ marginRight: 15 }}
          />
        ),
      })}
    >
      <Tab.Screen
        name="Inicio"
        component={InicioAdminScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="view-dashboard" size={size} color={color} />
          ),
          headerTitle: '⚙️ AgroConnect - Admin',
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="Clientes"
        component={ClientesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-group" size={size} color={color} />
          ),
          headerTitle: '👥 Clientes',
        }}
      />
      <Tab.Screen
        name="Productores"
        component={ProductoresAdminScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="leaf" size={size} color={color} />
          ),
          headerTitle: '🌾 Productores',
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" size={size} color={color} />
          ),
          headerTitle: '👤 Mi Perfil',
        }}
      />
      <Tab.Screen
        name="Configuracion"
        component={ConfiguracionScreen}
        options={{
          tabBarButton: () => null,
          headerTitle: '⚙️ Configuración',
        }}
      />
    </Tab.Navigator>
  );
}