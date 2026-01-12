import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme, Badge } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useNotificaciones } from '../../context/NotificacionesContext';
import InicioConsumidorScreen from './InicioConsumidorScreen';
import PerfilScreen from '../common/PerfilScreen';
import ConfiguracionScreen from '../common/ConfiguracionScreen';
import ProductosScreen from './ProductosScreen';
import DetalleProductoScreen from './DetalleProductoScreen';
import CarritoScreen from './CarritoScreen';
import PagoScreen from './PagoScreen';
import MisPedidosScreen from './MisPedidosScreen';
import DetallePedidoScreen from './DetallePedidoScreen';
import ChatProductoresScreen from './ChatProductoresScreen';

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

// Stack del carrito con pantalla de pago
function CarritoStackNavigator() {
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
        name="CarritoList"
        component={CarritoScreen}
        options={{ headerTitle: '🛒 Mi Carrito' }}
      />
      <Stack.Screen
        name="Pago"
        component={PagoScreen}
        options={{ headerTitle: '💳 Pagar con Stripe' }}
      />
    </Stack.Navigator>
  );
}

export default function ConsumidorDashboard() {
  const theme = useTheme();
  const { mensajesNoLeidos } = useNotificaciones();

  return (
    <Tab.Navigator
      screenOptions={({ navigation }) => ({
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: '#B0B0B0',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e0e0e0',
          paddingHorizontal: 0,
          height: 70,
          paddingBottom: 6,
          paddingTop: 6,
          elevation: 10,
        },
        tabBarItemStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '600',
          marginTop: 2,
        },
        sceneStyle: {
          backgroundColor: '#f5f5f5',
        },
        headerStyle: {
          backgroundColor: '#4A90E2',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => (
          <Icon
            name="cog"
            size={28}
            color="#FFFFFF"
            onPress={() => navigation.navigate('ConfiguracionTab')}
            style={{ marginRight: 15 }}
          />
        ),
      })}
    >
      <Tab.Screen
        name="InicioTab"
        component={InicioConsumidorScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Icon name="home" size={focused ? 32 : 26} color={color} />
          ),
          tabBarLabel: 'Inicio',
          headerTitle: '🛒 AgroConnect',
        }}
      />

      <Tab.Screen
        name="ProductosTab"
        component={ProductosStackNavigator}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Icon name="shopping" size={focused ? 32 : 26} color={color} />
          ),
          tabBarLabel: 'Productos',
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="CarritoTab"
        component={CarritoStackNavigator}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Icon name="cart" size={focused ? 32 : 26} color={color} />
          ),
          tabBarLabel: 'Carrito',
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="ChatTab"
        component={ChatProductoresScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View>
              <Icon name="message" size={focused ? 32 : 26} color={color} />
              {mensajesNoLeidos > 0 && (
                <Badge
                  size={16}
                  style={{
                    position: 'absolute',
                    top: -5,
                    right: -10,
                    backgroundColor: '#FF3B30',
                  }}
                >
                  {mensajesNoLeidos > 99 ? '99+' : mensajesNoLeidos}
                </Badge>
              )}
            </View>
          ),
          tabBarLabel: 'Chat',
          headerTitle: '💬 Chat con Productores',
        }}
      />

      <Tab.Screen
        name="PedidosTab"
        component={PedidosStackNavigator}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Icon name="package-multiple" size={focused ? 32 : 26} color={color} />
          ),
          tabBarLabel: 'Pedidos',
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="PerfilTab"
        component={PerfilScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Icon name="account" size={focused ? 32 : 26} color={color} />
          ),
          tabBarLabel: 'Perfil',
          headerTitle: '👤 Mi Perfil',
        }}
      />

      <Tab.Screen
        name="ConfiguracionTab"
        component={ConfiguracionScreen}
        options={{
          tabBarButton: () => null, // Ocultar del tab bar
          headerTitle: '⚙️ Configuración',
        }}
      />
    </Tab.Navigator>
  );
}
