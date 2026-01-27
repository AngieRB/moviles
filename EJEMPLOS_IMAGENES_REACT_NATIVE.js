/**
 * Ejemplo de implementación de subida de imágenes en React Native
 * Sistema AgroConnect
 */

import React, { useState } from 'react';
import { View, Button, Image, Alert, StyleSheet, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '../services/apiClient';

// =====================================================
// EJEMPLO 1: Actualizar Foto de Perfil
// =====================================================
export const ActualizarFotoPerfilScreen = () => {
  const [imagen, setImagen] = useState(null);
  const [uploading, setUploading] = useState(false);

  const seleccionarImagen = async () => {
    // Pedir permisos
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permiso.status !== 'granted') {
      Alert.alert('Permiso Denegado', 'Necesitamos permisos para acceder a tu galería');
      return;
    }

    // Abrir selector de imagen
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Cuadrado para foto de perfil
      quality: 0.8,   // 80% de calidad
    });

    if (!resultado.canceled) {
      setImagen(resultado.assets[0].uri);
    }
  };

  const subirFoto = async () => {
    if (!imagen) {
      Alert.alert('Error', 'Por favor selecciona una imagen primero');
      return;
    }

    setUploading(true);

    try {
      // Crear FormData
      const formData = new FormData();
      
      // Agregar la imagen
      const nombreArchivo = imagen.split('/').pop();
      const tipoArchivo = nombreArchivo.split('.').pop();
      
      formData.append('foto_perfil', {
        uri: imagen,
        type: `image/${tipoArchivo}`,
        name: nombreArchivo,
      });

      // Enviar al backend
      const response = await apiClient.post('/actualizar-foto-perfil', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('¡Éxito!', response.data.message);
      console.log('URL de la foto:', response.data.foto_perfil);
      
      // Actualizar el contexto del usuario si es necesario
      // setUser({ ...user, foto_perfil: response.data.foto_perfil });
      
    } catch (error) {
      console.error('Error subiendo foto:', error);
      Alert.alert('Error', error.response?.data?.message || 'No se pudo subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Actualizar Foto de Perfil</Text>
      
      {imagen && (
        <Image 
          source={{ uri: imagen }} 
          style={styles.preview}
        />
      )}
      
      <Button 
        title="Seleccionar Imagen" 
        onPress={seleccionarImagen}
      />
      
      {imagen && (
        <Button 
          title={uploading ? "Subiendo..." : "Subir Foto"} 
          onPress={subirFoto}
          disabled={uploading}
        />
      )}
    </View>
  );
};

// =====================================================
// EJEMPLO 2: Registro con Foto
// =====================================================
export const RegistroConFotoScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    apellido: '',
    cedula: '',
    telefono: '',
    email: '',
    password: '',
  });
  const [fotoPerfil, setFotoPerfil] = useState(null);

  const seleccionarFoto = async () => {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!resultado.canceled) {
      setFotoPerfil(resultado.assets[0].uri);
    }
  };

  const registrarse = async () => {
    try {
      const data = new FormData();
      
      // Agregar datos del formulario
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      // Agregar foto si existe
      if (fotoPerfil) {
        const nombreArchivo = fotoPerfil.split('/').pop();
        const tipoArchivo = nombreArchivo.split('.').pop();
        
        data.append('foto_perfil', {
          uri: fotoPerfil,
          type: `image/${tipoArchivo}`,
          name: nombreArchivo,
        });
      }

      const response = await apiClient.post('/register-consumidor', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('¡Bienvenido!', response.data.message);
      console.log('Usuario registrado:', response.data.user);
      
      // Guardar token y usuario
      // await AsyncStorage.setItem('token', response.data.token);
      // setUser(response.data.user);
      
    } catch (error) {
      console.error('Error en registro:', error);
      Alert.alert('Error', 'No se pudo completar el registro');
    }
  };

  return (
    <View style={styles.container}>
      {/* Aquí irían los campos del formulario */}
      
      <Button title="Seleccionar Foto de Perfil (Opcional)" onPress={seleccionarFoto} />
      
      {fotoPerfil && (
        <Image source={{ uri: fotoPerfil }} style={styles.preview} />
      )}
      
      <Button title="Registrarse" onPress={registrarse} />
    </View>
  );
};

// =====================================================
// EJEMPLO 3: Crear Producto con Imagen
// =====================================================
export const AgregarProductoScreen = () => {
  const [producto, setProducto] = useState({
    nombre: '',
    categoria: 'Frutas',
    precio: '',
    disponibles: '',
    descripcion: '',
  });
  const [imagenProducto, setImagenProducto] = useState(null);
  const [cargando, setCargando] = useState(false);

  const seleccionarImagenProducto = async () => {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3], // Formato paisaje para productos
      quality: 0.8,
    });

    if (!resultado.canceled) {
      setImagenProducto(resultado.assets[0].uri);
    }
  };

  const tomarFoto = async () => {
    // Pedir permiso para la cámara
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permiso.status !== 'granted') {
      Alert.alert('Permiso Denegado', 'Necesitamos acceso a tu cámara');
      return;
    }

    const resultado = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!resultado.canceled) {
      setImagenProducto(resultado.assets[0].uri);
    }
  };

  const crearProducto = async () => {
    if (!producto.nombre || !producto.precio || !producto.disponibles) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    setCargando(true);

    try {
      const formData = new FormData();
      
      // Agregar datos del producto
      formData.append('nombre', producto.nombre);
      formData.append('categoria', producto.categoria);
      formData.append('precio', producto.precio);
      formData.append('disponibles', producto.disponibles);
      formData.append('descripcion', producto.descripcion);

      // Agregar imagen si existe
      if (imagenProducto) {
        const nombreArchivo = imagenProducto.split('/').pop();
        const tipoArchivo = nombreArchivo.split('.').pop();
        
        formData.append('imagen', {
          uri: imagenProducto,
          type: `image/${tipoArchivo}`,
          name: nombreArchivo,
        });
      }

      const response = await apiClient.post('/productos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('¡Éxito!', 'Producto creado exitosamente');
      console.log('Producto creado:', response.data.producto);
      
      // Navegar de regreso o limpiar formulario
      // navigation.goBack();
      
    } catch (error) {
      console.error('Error creando producto:', error);
      Alert.alert('Error', error.response?.data?.message || 'No se pudo crear el producto');
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Nuevo Producto</Text>
      
      {/* Campos del formulario... */}
      
      <View style={styles.botonesImagen}>
        <Button title="📷 Tomar Foto" onPress={tomarFoto} />
        <Button title="🖼️ Galería" onPress={seleccionarImagenProducto} />
      </View>
      
      {imagenProducto && (
        <Image 
          source={{ uri: imagenProducto }} 
          style={styles.previewProducto}
        />
      )}
      
      <Button 
        title={cargando ? "Creando..." : "Crear Producto"} 
        onPress={crearProducto}
        disabled={cargando}
      />
    </View>
  );
};

// =====================================================
// EJEMPLO 4: Mostrar Imagen del Usuario
// =====================================================
export const MostrarFotoPerfilComponent = ({ usuario }) => {
  const API_BASE_URL = 'http://192.168.1.100:8000'; // Cambiar por tu IP

  // Construir URL completa de la imagen
  const urlImagen = usuario.foto_perfil 
    ? `${API_BASE_URL}/${usuario.foto_perfil}`
    : null;

  return (
    <View style={styles.perfilContainer}>
      {urlImagen ? (
        <Image 
          source={{ uri: urlImagen }}
          style={styles.fotoPerfil}
          onError={(e) => {
            console.log('Error cargando imagen:', e.nativeEvent.error);
          }}
        />
      ) : (
        <View style={styles.placeholderPerfil}>
          <Text style={styles.placeholderText}>
            {usuario.name?.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      
      <Text style={styles.nombreUsuario}>
        {usuario.name} {usuario.apellido}
      </Text>
    </View>
  );
};

// =====================================================
// EJEMPLO 5: Mostrar Imagen de Producto en Lista
// =====================================================
export const ProductoCard = ({ producto }) => {
  const API_BASE_URL = 'http://192.168.1.100:8000';

  const urlImagen = producto.imagen && !producto.imagen.startsWith('http')
    ? `${API_BASE_URL}/${producto.imagen}`
    : producto.imagen;

  return (
    <View style={styles.card}>
      {urlImagen ? (
        <Image 
          source={{ uri: urlImagen }}
          style={styles.imagenProducto}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholderProducto}>
          <Text style={styles.emoji}>📦</Text>
        </View>
      )}
      
      <View style={styles.infoProducto}>
        <Text style={styles.nombreProducto}>{producto.nombre}</Text>
        <Text style={styles.precio}>${producto.precio}</Text>
      </View>
    </View>
  );
};

// =====================================================
// ESTILOS
// =====================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  preview: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginVertical: 20,
    alignSelf: 'center',
  },
  previewProducto: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginVertical: 20,
  },
  botonesImagen: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  perfilContainer: {
    alignItems: 'center',
    padding: 20,
  },
  fotoPerfil: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  placeholderPerfil: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  nombreUsuario: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 3,
  },
  imagenProducto: {
    width: '100%',
    height: 150,
  },
  placeholderProducto: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 60,
  },
  infoProducto: {
    padding: 12,
  },
  nombreProducto: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  precio: {
    fontSize: 18,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
});

export default {
  ActualizarFotoPerfilScreen,
  RegistroConFotoScreen,
  AgregarProductoScreen,
  MostrarFotoPerfilComponent,
  ProductoCard,
};
