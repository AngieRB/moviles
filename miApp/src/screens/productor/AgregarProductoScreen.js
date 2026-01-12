import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { apiClient } from '../../services/apiClient';
import { useApp } from '../../context/AppContext';

export default function AgregarProductoScreen() {
  const { user, token } = useApp();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [subiendo, setSubiendo] = useState(false);

  const handleGuardar = async () => {
    // Validar usuario autenticado
    if (!user || !token) {
      Alert.alert('Error', 'No hay sesión activa. Por favor inicia sesión de nuevo.');
      return;
    }
    
    // Validaciones
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio.');
      return;
    }
    if (!descripcion.trim()) {
      Alert.alert('Error', 'La descripción es obligatoria.');
      return;
    }
    if (!precio || isNaN(precio) || parseFloat(precio) <= 0) {
      Alert.alert('Error', 'El precio debe ser un número válido mayor a 0.');
      return;
    }
    if (!stock || isNaN(stock) || parseInt(stock) < 0) {
      Alert.alert('Error', 'El stock debe ser un número válido mayor o igual a 0.');
      return;
    }
    
    setSubiendo(true);
    
    try {
      const productData = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        precio: parseFloat(precio),
        categoria: 'General',
        disponibles: parseInt(stock),
      };

      const response = await apiClient.post('/productos', productData);

      Alert.alert(
        'Éxito', 
        'Producto agregado exitosamente',
        [
          {
            text: 'OK',
            onPress: () => {
              setNombre('');
              setDescripcion('');
              setPrecio('');
              setStock('');
            }
          }
        ]
      );

    } catch (error) {
      let errorMsg = 'Error al guardar el producto';
      
      if (error.response?.status === 401) {
        errorMsg = 'Sesión expirada. Por favor inicia sesión de nuevo.';
      } else if (error.response?.status === 403) {
        errorMsg = 'No tienes permisos para crear productos.';
      } else if (error.response?.data?.errors) {
        errorMsg = Object.values(error.response.data.errors).flat().join('\n');
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      Alert.alert('Error', errorMsg);
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Agregar Nuevo Producto</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre del Producto"
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={styles.input}
        placeholder="Descripción Detallada"
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
        numberOfLines={3}
      />
      <TextInput
        style={styles.input}
        placeholder="Precio por Unidad ($)"
        value={precio}
        onChangeText={setPrecio}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Stock Disponible (cantidad)"
        value={stock}
        onChangeText={setStock}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={handleGuardar} disabled={subiendo}>
        {subiendo ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>GUARDAR PRODUCTO</Text>}
      </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#ffffff',
  },
  fotoBtn: {
    height: 50,
    backgroundColor: '#f7faf5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
  },
  fotoBtnText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginBottom: 15,
  },
  imagePreview: {
    width: 200,
    height: 150,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  removeImageBtn: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#f44336',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    height: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});