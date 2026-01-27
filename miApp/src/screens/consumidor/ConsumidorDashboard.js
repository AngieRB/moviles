import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme, Badge } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import ConversacionesProductoresScreen from './ConversacionesProductoresScreen';
import CrearReporteScreen from '../CrearReporteScreen';
import MisReportesScreen from '../MisReportesScreen';
import ProveedoresScreen from '../ProveedoresScreen';
import PerfilProveedorScreen from '../PerfilProveedorScreen';

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

// Stack de proveedores
function ProveedoresStackNavigator() {
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
        name="ProveedoresList"
        component={ProveedoresScreen}
        options={{ headerTitle: '👨‍🌾 Proveedores' }}
      />
      <Stack.Screen
        name="PerfilProveedor"
        component={PerfilProveedorScreen}
        options={{ headerTitle: 'Perfil del Proveedor' }}
      />
    </Stack.Navigator>
  );
}

// Stack de perfil con configuración
function PerfilStackNavigator() {
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
        name="PerfilMain"
        component={PerfilScreen}
        options={({ navigation }) => ({
          headerTitle: '👤 Mi Perfil',
          headerRight: () => (
            <Icon
              name="cog"
              size={28}
              color="#FFFFFF"
              onPress={() => navigation.navigate('Configuracion')}
              style={{ marginRight: 15 }}
            />
          ),
        })}
      />
      <Stack.Screen
        name="Configuracion"
        component={ConfiguracionScreen}
        options={{ headerTitle: '⚙️ Configuración' }}
      />
    </Stack.Navigator>
  );
}

// Stack de reportes
function ReportesStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FF3B30',
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
        name="MisReportes"
        component={MisReportesScreen}
        options={{ 
          headerTitle: '⚠️ Mis Reportes',
          headerLeft: () => null
        }}
      />
      <Stack.Screen
        name="CrearReporte"
        component={CrearReporteScreen}
        options={{ headerTitle: 'Crear Reporte' }}
      />
    </Stack.Navigator>
  );
}

export default function ConsumidorDashboard() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { mensajesNoLeidos } = useNotificaciones();

  return (
    <Tab.Navigator
      screenOptions={({ navigation }) => ({
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: '#B0B0B0',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e0e0e0',
          elevation: 10,
          height: 70 + (insets.bottom > 0 ? insets.bottom : 5),
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
          paddingHorizontal: 4,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
          marginBottom: 2,
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
            onPress={() => navigation.navigate('PerfilTab', { screen: 'Configuracion' })}
            style={{ marginRight: 15 }}
          />
        ),
      })}
    >
      <Tab.Screen
        name="InicioTab"
        component={InicioConsumidorScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={28} color={color} />
          ),
          tabBarLabel: 'Inicio',
          headerTitle: '🛒 AgroConnect',
        }}
      />

      <Tab.Screen
        name="ProductosTab"
        component={ProductosStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="shopping" size={28} color={color} />
          ),
          tabBarLabel: 'Productos',
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="CarritoTab"
        component={CarritoStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="cart" size={28} color={color} />
          ),
          tabBarLabel: 'Carrito',
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="ChatTab"
        component={ConversacionesProductoresScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View>
              <Icon name="message" size={28} color={color} />
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
          tabBarIcon: ({ color, size }) => (
            <Icon name="package-variant" size={28} color={color} />
          ),
          tabBarLabel: 'Pedidos',
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="ProveedoresTab"
        component={ProveedoresStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-group" size={28} color={color} />
          ),
          tabBarLabel: 'Proveedores',
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="ReportesTab"
        component={ReportesStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="alert-octagon" size={28} color={color} />
          ),
          tabBarLabel: 'Reportes',
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="PerfilTab"
        component={PerfilStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" size={28} color={color} />
          ),
          tabBarLabel: 'Perfil',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}
