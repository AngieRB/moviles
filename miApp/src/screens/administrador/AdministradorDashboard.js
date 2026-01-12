import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import InicioAdminScreen from './InicioAdminScreen';
import ClientesScreen from './ClientesScreen';
import ProductoresAdminScreen from './ProductoresAdminScreen';
import PerfilScreen from '../common/PerfilScreen';
import ConfiguracionScreen from '../common/ConfiguracionScreen';

const Tab = createBottomTabNavigator();

export default function AdministradorDashboard() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ navigation }) => ({
        tabBarActiveTintColor: '#F5A623',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          elevation: 10,
          // Altura base (65) + espacio seguro del celular (notch/barra)
          height: 65 + (insets.bottom > 0 ? insets.bottom : 5),
          // Padding para subir los iconos y que no toquen el borde
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 10,
        },
        tabBarItemStyle: {
          // Centra los elementos verticalmente
          justifyContent: 'center',
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 4,
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
            <Icon name="view-dashboard" size={28} color={color} />
          ),
          headerTitle: '⚙️ AgroConnect - Admin',
          tabBarLabel: 'Inicio',
        }}
      />
      <Tab.Screen
        name="Clientes"
        component={ClientesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-group" size={28} color={color} />
          ),
          headerTitle: '👥 Clientes',
        }}
      />
      <Tab.Screen
        name="Productores"
        component={ProductoresAdminScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="leaf" size={28} color={color} />
          ),
          headerTitle: '🌾 Productores',
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" size={28} color={color} />
          ),
          headerTitle: '👤 Mi Perfil',
        }}
      />
      {/* Configuración oculta pero accesible */}
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