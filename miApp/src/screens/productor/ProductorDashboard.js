import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card, Avatar, IconButton, Modal, Portal } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import InicioScreen from './InicioScreen';
import PedidosPendientesScreen from './PedidosPendientesScreen';
import ChatClientesScreen from './ChatClientesScreen';
import PerfilScreen from '../common/PerfilScreen';


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
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
}

function ProductosScreen() {
  const [productos, setProductos] = useState([]);
  const [productoEditable, setProductoEditable] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    descripcion: '',
    cantidad: '',
    precio: '',
    unidad: '',
    foto: null,
  });

  const validateText = (text) => /^[a-zA-Z\s]+$/.test(text);
  const validatePrice = (price) => /^\d+(,\d{1,2})?$/.test(price);

 
  const agregarProducto = () => {
    if (
      validateText(nuevoProducto.nombre) &&
      validateText(nuevoProducto.descripcion) &&
      nuevoProducto.cantidad.trim() &&
      validatePrice(nuevoProducto.precio)
    ) {
      const nuevoProductoConUnidad = {
        nombre: nuevoProducto.nombre,
        descripcion: nuevoProducto.descripcion,
        cantidad: parseInt(nuevoProducto.cantidad, 10),
        precio: parseFloat(nuevoProducto.precio.replace(',', '.')),
        unidad: nuevoProducto.unidad || 'unidad',
        foto: nuevoProducto.foto,
      };

      // Emitir evento de Pusher
      
      setNuevoProducto({ nombre: '', descripcion: '', cantidad: '', precio: '', unidad: '', foto: null });
      setModalVisible(false);
    } else {
      alert('Por favor, complete los campos correctamente. Solo se permiten letras en nombre y descripción.');
    }
  };

  const editarProducto = () => {
    if (
      validateText(productoEditable.nombre) &&
      validateText(productoEditable.descripcion) &&
      productoEditable.cantidad.trim() &&
      validatePrice(productoEditable.precio)
    ) {
      const productoEditadoConUnidad = {
        ...productoEditable,
        cantidad: parseInt(productoEditable.cantidad, 10),
        precio: parseFloat(productoEditable.precio.replace(',', '.')),
      };

     
      setProductoEditable(null);
      setModalVisible(false);
    } else {
      alert('Por favor, complete los campos correctamente. Solo se permiten letras en nombre y descripción.');
    }
  };

  const agregarFoto = async (setProducto) => {
    const options = [
      { text: 'Tomar Foto con la Cámara', onPress: async () => {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
        });
        if (!result.canceled) {
          setProducto((prev) => ({ ...prev, foto: result.uri }));
        }
      }},
      { text: 'Seleccionar Foto de la Galería', onPress: async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
        });
        if (!result.canceled) {
          setProducto((prev) => ({ ...prev, foto: result.uri }));
        }
      }},
      { text: 'Cancelar', style: 'cancel' },
    ];

    Alert.alert('Agregar Foto', 'Seleccione una opción:', options);
  };

  return (
    <ScrollView style={styles.container}>
      <Button
        mode="contained"
        onPress={() => {
          setNuevoProducto({ nombre: '', descripcion: '', cantidad: '', precio: '', unidad: '', foto: null });
          setModalVisible(true);
        }}
        style={styles.addButtonTop}
      >
        Agregar Producto
      </Button>

      <Text style={styles.title}>Lista de Productos</Text>
      {productos.map((producto) => (
        <Card key={producto.id} style={styles.card}>
          <Card.Content>
            <View style={styles.productRow}>
              {producto.foto ? (
                <Avatar.Image size={40} source={{ uri: producto.foto }} style={styles.avatar} />
              ) : (
                <Avatar.Icon size={40} icon="basket" style={styles.avatar} />
              )}
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{producto.nombre}</Text>
                <Text style={styles.productDescription}>{producto.descripcion}</Text>
                <Text style={styles.productDetails}>Cantidad Disponible: {producto.cantidad}</Text>
                <Text style={styles.productDetails}>Precio por Unidad: ${producto.precio.toFixed(2)}</Text>
              </View>
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => {
                  setProductoEditable(producto);
                  setModalVisible(true);
                }}
                style={styles.editButton}
              />
            </View>
          </Card.Content>
        </Card>
      ))}

      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>{productoEditable ? 'Editar Producto' : 'Agregar Nuevo Producto'}</Text>
            <TextInput
              label="Nombre del Producto"
              value={productoEditable ? productoEditable.nombre : nuevoProducto.nombre}
              onChangeText={(text) =>
                productoEditable
                  ? setProductoEditable((prev) => ({ ...prev, nombre: text }))
                  : setNuevoProducto((prev) => ({ ...prev, nombre: text }))
              }
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Descripción Detallada"
              value={productoEditable ? productoEditable.descripcion : nuevoProducto.descripcion}
              onChangeText={(text) =>
                productoEditable
                  ? setProductoEditable((prev) => ({ ...prev, descripcion: text }))
                  : setNuevoProducto((prev) => ({ ...prev, descripcion: text }))
              }
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Cantidad Disponible"
              value={productoEditable ? productoEditable.cantidad.toString() : nuevoProducto.cantidad}
              onChangeText={(text) =>
                productoEditable
                  ? setProductoEditable((prev) => ({ ...prev, cantidad: text.replace(/[^0-9]/g, '') }))
                  : setNuevoProducto((prev) => ({ ...prev, cantidad: text.replace(/[^0-9]/g, '') }))
              }
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
            />
            <TextInput
              label="Precio por Unidad ($)"
              value={productoEditable ? productoEditable.precio.toString() : nuevoProducto.precio}
              onChangeText={(text) =>
                productoEditable
                  ? setProductoEditable((prev) => ({ ...prev, precio: text.replace(/[^0-9.]/g, '') }))
                  : setNuevoProducto((prev) => ({ ...prev, precio: text.replace(/[^0-9.]/g, '') }))
              }
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
            />
            <TextInput
              label="Unidad (ej. kg, unidad, litros)"
              value={productoEditable ? productoEditable.unidad : nuevoProducto.unidad}
              onChangeText={(text) =>
                productoEditable
                  ? setProductoEditable((prev) => ({ ...prev, unidad: text }))
                  : setNuevoProducto((prev) => ({ ...prev, unidad: text }))
              }
              mode="outlined"
              style={styles.input}
            />
            <Button
              mode="outlined"
              onPress={() => agregarFoto(productoEditable ? setProductoEditable : setNuevoProducto)}
              style={styles.photoButton}
            >
              Agregar Foto
            </Button>
            <Button
              mode="contained"
              onPress={productoEditable ? editarProducto : agregarProducto}
              style={styles.addButton}
            >
              {productoEditable ? 'Guardar Cambios' : 'Guardar Producto'}
            </Button>
          </View>
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  card: {
    marginBottom: 10,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#6B9B37',
  },
  productInfo: {
    flex: 1,
    marginLeft: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productDescription: {
    fontSize: 14,
    color: '#757575',
  },
  productDetails: {
    fontSize: 14,
  },
  editButton: {
    alignSelf: 'flex-end',
  },
  input: {
    marginBottom: 10,
  },
  addButton: {
    marginTop: 10,
  },
  addButtonTop: {
    marginBottom: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  photoButton: {
    marginBottom: 10,
  },
});