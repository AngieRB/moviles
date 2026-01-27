import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Modal, Image, Dimensions, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Text, TextInput, Button, Card, Avatar, IconButton, Portal, Badge } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import InicioProductorScreen from './InicioProductorScreen';
import PedidosPendientesScreen from './PedidosPendientesScreen';
import ConversacionesClientesScreen from './ConversacionesClientesScreen';
import PerfilScreen from '../common/PerfilScreen';
import ConfiguracionScreen from '../common/ConfiguracionScreen';
import CrearReporteScreen from '../CrearReporteScreen';
import MisReportesScreen from '../MisReportesScreen';
import apiClient from '../../services/apiClient';
import { useNotificaciones } from '../../context/NotificacionesContext';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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


export default function ProductorDashboard() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { mensajesNoLeidos } = useNotificaciones();

  return (
    <Tab.Navigator
      screenOptions={({ navigation }) => ({
        tabBarActiveTintColor: '#6B9B37',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          elevation: 10,
          height: 70 + (insets.bottom > 0 ? insets.bottom : 5),
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
          paddingHorizontal: 0,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          paddingVertical: 2,
          flex: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
          marginBottom: 2,
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
        component={InicioProductorScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={28} color={color} />
          ),
          tabBarLabel: 'Inicio',
          headerTitle: '🌾 AgroConnect - Productor',
        }}
      />
      <Tab.Screen
        name="PedidosPendientes"
        component={PedidosPendientesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar" size={28} color={color} />
          ),
          tabBarLabel: 'Pedidos',
          headerTitle: 'Pedidos Pendientes',
        }}
      />
      <Tab.Screen
        name="Productos"
        component={ProductosScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="shopping" size={28} color={color} />
          ),
          tabBarLabel: 'Productos',
          headerTitle: 'Mis Productos',
        }}
      />
      <Tab.Screen
        name="ChatClientes"
        component={ConversacionesClientesScreen}
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
          headerTitle: 'Chat con Clientes',
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
        name="Perfil"
        component={PerfilScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" size={28} color={color} />
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
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false); // Nuevo estado para prevenir doble envío
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    descripcion: '',
    cantidad: '',
    precio: '',
    categoria: 'Verduras',
    foto: null,
  });

  const CATEGORIAS = ['Frutas', 'Verduras', 'Lácteos', 'Granos', 'Carnes', 'Otros'];

  // Cargar productos al iniciar
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/mis-productos');
      console.log('📦 Productos cargados:', response.data);
      setProductos(response.data.productos || []);
    } catch (error) {
      console.error('❌ Error al cargar productos:', error);
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const validateText = (text) => /^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]+$/.test(text);
  const validatePrice = (price) => /^\d+(\.\d{1,2})?$/.test(price);

  const agregarProducto = async () => {
    // Prevenir doble envío
    if (guardando) {
      console.log('⚠️ Ya se está guardando el producto');
      return;
    }
    
    console.log('🚀 Agregando producto desde ProductorDashboard');
    
    if (!nuevoProducto.nombre.trim()) {
      Alert.alert('Error', 'El nombre del producto es obligatorio');
      return;
    }
    if (!nuevoProducto.precio || parseFloat(nuevoProducto.precio) <= 0) {
      Alert.alert('Error', 'El precio debe ser mayor a 0');
      return;
    }
    if (!nuevoProducto.cantidad || parseInt(nuevoProducto.cantidad) < 0) {
      Alert.alert('Error', 'La cantidad disponible es obligatoria');
      return;
    }

    try {
      setGuardando(true); // Activar indicador de guardado
      const productoData = {
        nombre: nuevoProducto.nombre.trim(),
        descripcion: nuevoProducto.descripcion.trim() || '',
        precio: parseFloat(nuevoProducto.precio),
        categoria: nuevoProducto.categoria || 'Otros',
        disponibles: parseInt(nuevoProducto.cantidad),
        imagen: '🌾',
      };

      console.log('📦 Enviando producto:', productoData);
      const response = await apiClient.post('/productos', productoData);
      
      console.log('✅ Producto creado:', response.data);
      
      // Recargar la lista de productos desde el servidor
      await cargarProductos();
      
      // Limpiar formulario
      setNuevoProducto({ nombre: '', descripcion: '', cantidad: '', precio: '', categoria: 'Verduras', foto: null });
      setModalVisible(false);
      
      Alert.alert('Éxito', 'Nuevo producto guardado con éxito');
    } catch (error) {
      console.log('❌ Error al crear producto');
      const mensaje = error.response?.data?.message || 'Error al crear el producto';
      Alert.alert('Error', mensaje);
    } finally {
      setGuardando(false); // Desactivar indicador de guardado
    }
  };

  const editarProducto = async () => {
    if (!productoEditable.nombre.trim()) {
      Alert.alert('Error', 'El nombre del producto es obligatorio');
      return;
    }
    if (!productoEditable.precio || parseFloat(productoEditable.precio) <= 0) {
      Alert.alert('Error', 'El precio debe ser mayor a 0');
      return;
    }
    if (!productoEditable.disponibles && !productoEditable.cantidad) {
      Alert.alert('Error', 'La cantidad disponible es obligatoria');
      return;
    }

    try {
      const productoData = {
        nombre: productoEditable.nombre.trim(),
        descripcion: productoEditable.descripcion?.trim() || '',
        precio: parseFloat(productoEditable.precio),
        categoria: productoEditable.categoria || 'Otros',
        disponibles: parseInt(productoEditable.disponibles || productoEditable.cantidad || 0),
      };

      console.log('📝 Actualizando producto:', productoEditable.id, productoData);
      await apiClient.put(`/productos/${productoEditable.id}`, productoData);
      
      console.log('✅ Producto actualizado');
      await cargarProductos();
      
      setProductoEditable(null);
      setModalVisible(false);
      
      Alert.alert('Éxito', 'Producto actualizado con éxito');
    } catch (error) {
      console.error('❌ Error al actualizar producto:', error);
      const mensaje = error.response?.data?.message || 'Error al actualizar el producto';
      Alert.alert('Error', mensaje);
    }
  };

  const eliminarProducto = async (productoId) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar este producto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Eliminando producto:', productoId);
              await apiClient.delete(`/productos/${productoId}`);
              
              Alert.alert('Éxito', 'Producto eliminado exitosamente');
              await cargarProductos();
            } catch (error) {
              console.error('❌ Error al eliminar producto:', error);
              const mensaje = error.response?.data?.message || 'No se pudo eliminar el producto';
              Alert.alert('Error', mensaje);
            }
          },
        },
      ]
    );
  };

  const agregarFoto = async (setProducto) => {
    // Para web, usar input de archivo
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setProducto((prev) => ({ 
              ...prev, 
              foto: reader.result,
              imagenFile: file
            }));
          };
          reader.readAsDataURL(file);
        }
      };
      
      input.click();
      return;
    }

    // Para móvil nativo - pedir permisos primero
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    Alert.alert(
      'Agregar Foto',
      'Selecciona una opción',
      [
        {
          text: 'Tomar Foto',
          onPress: async () => {
            if (cameraStatus !== 'granted') {
              Alert.alert('Permiso denegado', 'Necesitas dar permiso para usar la cámara');
              return;
            }
            
            try {
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaType.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
              });
              
              if (!result.canceled && result.assets && result.assets[0]) {
                setProducto((prev) => ({ ...prev, foto: result.assets[0].uri }));
              }
            } catch (error) {
              console.error('Error al tomar foto:', error);
              Alert.alert('Error', 'No se pudo tomar la foto');
            }
          },
        },
        {
          text: 'Galería',
          onPress: async () => {
            if (galleryStatus !== 'granted') {
              Alert.alert('Permiso denegado', 'Necesitas dar permiso para acceder a la galería');
              return;
            }
            
            try {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaType.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
              });
              
              if (!result.canceled && result.assets && result.assets[0]) {
                setProducto((prev) => ({ ...prev, foto: result.assets[0].uri }));
              }
            } catch (error) {
              console.error('Error al seleccionar imagen:', error);
              Alert.alert('Error', 'No se pudo seleccionar la imagen');
            }
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Button
        mode="contained"
        onPress={() => {
          setNuevoProducto({ nombre: '', descripcion: '', cantidad: '', precio: '', categoria: 'Verduras', foto: null });
          setModalVisible(true);
        }}
        style={styles.addButtonTop}
      >
        Agregar Producto
      </Button>

      <Text style={styles.title}>Lista de Productos</Text>
      {loading ? (
        <Text style={{textAlign: 'center', marginTop: 20}}>Cargando productos...</Text>
      ) : productos.length === 0 ? (
        <Text style={{textAlign: 'center', marginTop: 20}}>No tienes productos aún</Text>
      ) : (
        productos.map((producto) => (
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
                  <Text style={styles.productDetails}>Stock: {producto.disponibles}</Text>
                  <Text style={styles.productDetails}>Precio: ${producto.precio}</Text>
                  <Text style={styles.productDetails}>Categoría: {producto.categoria}</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <IconButton
                    icon="pencil"
                    size={20}
                    onPress={() => {
                      setProductoEditable(producto);
                      setModalVisible(true);
                    }}
                    style={styles.editButton}
                  />
                  <IconButton
                    icon="delete"
                    size={20}
                    iconColor="#d32f2f"
                    onPress={() => eliminarProducto(producto.id)}
                    style={styles.deleteButton}
                  />
                </View>
              </View>
            </Card.Content>
          </Card>
        ))
      )}

      <Modal 
        visible={modalVisible} 
        onRequestClose={() => setModalVisible(false)}
        transparent={true}
        animationType="slide"
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
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
              value={productoEditable ? (productoEditable.disponibles || productoEditable.cantidad || '').toString() : nuevoProducto.cantidad}
              onChangeText={(text) =>
                productoEditable
                  ? setProductoEditable((prev) => ({ ...prev, cantidad: text.replace(/[^0-9]/g, ''), disponibles: text.replace(/[^0-9]/g, '') }))
                  : setNuevoProducto((prev) => ({ ...prev, cantidad: text.replace(/[^0-9]/g, '') }))
              }
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
            />
            <TextInput
              label="Precio por Unidad ($)"
              value={productoEditable ? (productoEditable.precio || '').toString() : nuevoProducto.precio}
              onChangeText={(text) =>
                productoEditable
                  ? setProductoEditable((prev) => ({ ...prev, precio: text.replace(/[^0-9.]/g, '') }))
                  : setNuevoProducto((prev) => ({ ...prev, precio: text.replace(/[^0-9.]/g, '') }))
              }
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
            />
            
            <Text style={styles.label}>Categoría</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={productoEditable ? productoEditable.categoria : nuevoProducto.categoria}
                onValueChange={(itemValue) =>
                  productoEditable
                    ? setProductoEditable((prev) => ({ ...prev, categoria: itemValue }))
                    : setNuevoProducto((prev) => ({ ...prev, categoria: itemValue }))
                }
                style={styles.picker}
              >
                {CATEGORIAS.map((cat) => (
                  <Picker.Item key={cat} label={cat} value={cat} />
                ))}
              </Picker>
            </View>

            {(productoEditable?.foto || nuevoProducto.foto) && (
              <View style={styles.imagePreview}>
                <Text style={styles.label}>Imagen seleccionada:</Text>
                <Image 
                  source={{ uri: productoEditable?.foto || nuevoProducto.foto }} 
                  style={styles.previewImage}
                />
              </View>
            )}

            <Button
              mode="outlined"
              onPress={() => agregarFoto(productoEditable ? setProductoEditable : setNuevoProducto)}
              style={styles.photoButton}
            >
              {(productoEditable?.foto || nuevoProducto.foto) ? 'Cambiar Foto' : 'Agregar Foto'}
            </Button>
            <Button
              mode="contained"
              onPress={productoEditable ? editarProducto : agregarProducto}
              style={styles.addButton}
              disabled={guardando}
              loading={guardando}
            >
              {productoEditable ? 'Guardar Cambios' : 'Guardar Producto'}
            </Button>
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: width < 768 ? 15 : 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: width < 768 ? 16 : 18,
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
  deleteButton: {
    alignSelf: 'flex-end',
  },
  input: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    marginTop: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  addButton: {
    marginTop: 10,
  },
  addButtonTop: {
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: width < 768 ? 15 : 20,
    borderRadius: 10,
    width: width < 768 ? width * 0.95 : width * 0.9,
    maxWidth: 500,
    maxHeight: height * 0.85,
  },
  photoButton: {
    marginBottom: 10,
  },
  imagePreview: {
    marginVertical: 10,
    alignItems: 'center',
  },
  previewImage: {
    width: width < 768 ? width * 0.6 : 200,
    height: width < 768 ? width * 0.6 : 200,
    borderRadius: 10,
    marginTop: 10,
    resizeMode: 'cover',
  },
});