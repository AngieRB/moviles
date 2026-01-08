import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { View } from 'react-native';
import InicioScreen from '../common/InicioScreen';
import PerfilScreen from '../common/PerfilScreen';
import ConfiguracionScreen from '../common/ConfiguracionScreen';
import PedidosPendientesScreen from './PedidosPendientesScreen';
import AgregarProductoScreen from './AgregarProductoScreen';
import ChatClientesScreen from './ChatClientesScreen';
import ProductosScreen from './ProductosScreen';

const Tab = createBottomTabNavigator();

export default function ProductorDashboard() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ navigation }) => ({
        tabBarActiveTintColor: '#6B9B37',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        sceneStyle: {
          backgroundColor: theme.colors.background,
        },
        headerStyle: {
          backgroundColor: '#6B9B37',
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
        component={InicioScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
          headerTitle: '🌾 AgroConnect - Productor',
        }}
      />
      <Tab.Screen
        name="PedidosPendientes"
        component={PedidosPendientesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar" size={size} color={color} />
          ),
          headerTitle: 'Pedidos Pendientes',
        }}
      />
      <Tab.Screen
        name="AgregarProducto"
        component={AgregarProductoScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="plus-circle" size={size} color={color} />
          ),
          headerTitle: 'Agregar Producto',
        }}
      />
      <Tab.Screen
        name="Productos"
        component={ProductosScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="shopping" size={size} color={color} />
          ),
          headerTitle: 'Mis Productos',
        }}
      />
      <Tab.Screen
        name="ChatClientes"
        component={ChatClientesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="message" size={size} color={color} />
          ),
          headerTitle: 'Chat con Clientes',
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" size={size} color={color} />
          ),
          headerTitle: 'Mi Perfil',
        }}
      />
      <Tab.Screen
              name="ConfiguracionTab"
              component={ConfiguracionScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Icon name="cog" size={size} color={color} />
                ),
                tabBarLabel: 'Config',
              }}
            />
          </Tab.Navigator>
        );
      }