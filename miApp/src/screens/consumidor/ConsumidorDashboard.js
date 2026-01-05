import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import InicioScreen from '../common/InicioScreen';
import PerfilScreen from '../common/PerfilScreen';
import ConfiguracionScreen from '../common/ConfiguracionScreen';
import ProductosScreen from './ProductosScreen';
import DetalleProductoScreen from './DetalleProductoScreen';
import CarritoScreen from './CarritoScreen';
import MisPedidosScreen from './MisPedidosScreen';
import DetallePedidoScreen from './DetallePedidoScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack de productos con detalle
function ProductosStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4A90E2',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        cardStyle: {
          backgroundColor: '#f5f5f5',
        },
      }}
    >
      <Stack.Screen
        name="ProductosList"
        component={ProductosScreen}
        options={{ headerTitle: '🛒 Productos' }}
      />
      <Stack.Screen
        name="DetalleProducto"
        component={DetalleProductoScreen}
        options={{ headerTitle: 'Detalle del Producto' }}
      />
    </Stack.Navigator>
  );
}

// Stack de pedidos con detalle
function PedidosStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4A90E2',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        cardStyle: {
          backgroundColor: '#f5f5f5',
        },
      }}
    >
      <Stack.Screen
        name="PedidosList"
        component={MisPedidosScreen}
        options={{ headerTitle: '📦 Mis Pedidos' }}
      />
      <Stack.Screen
        name="DetallePedido"
        component={DetallePedidoScreen}
        options={{ headerTitle: 'Detalle del Pedido' }}
      />
    </Stack.Navigator>
  );
}

export default function ConsumidorDashboard() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        sceneStyle: {
          backgroundColor: theme.colors.background,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="InicioTab"
        component={InicioScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
          tabBarLabel: 'Inicio',
        }}
      />

      <Tab.Screen
        name="ProductosTab"
        component={ProductosStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="shopping" size={size} color={color} />
          ),
          tabBarLabel: 'Productos',
        }}
      />

      <Tab.Screen
        name="CarritoTab"
        component={CarritoScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="cart" size={size} color={color} />
          ),
          tabBarLabel: 'Carrito',
        }}
      />

      <Tab.Screen
        name="PedidosTab"
        component={PedidosStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="package-multiple" size={size} color={color} />
          ),
          tabBarLabel: 'Pedidos',
        }}
      />

      <Tab.Screen
        name="PerfilTab"
        component={PerfilScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" size={size} color={color} />
          ),
          tabBarLabel: 'Perfil',
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
