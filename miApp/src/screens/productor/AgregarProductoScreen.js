import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../services/apiClient';

export default function AgregarProductoScreen() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [imagen, setImagen] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImagen(result.assets[0]);
    }
  };

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      alert('El nombre es obligatorio.');
      return;
    }
    if (!descripcion.trim()) {
      alert('La descripción es obligatoria.');
      return;
    }
    if (!precio || isNaN(precio)) {
      alert('El precio debe ser un número válido.');
      return;
    }
    setSubiendo(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('descripcion', descripcion);
      formData.append('precio', precio);
      formData.append('categoria', 'General'); // Puedes cambiar esto si tienes categorías
      formData.append('disponibles', 10); // Puedes pedir este dato al usuario
      if (imagen) {
        formData.append('imagen', {
          uri: imagen.uri,
          name: 'producto.jpg',
          type: 'image/jpeg',
        });
      }
      const res = await fetch(`${API_URL}/productos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        alert('Producto agregado exitosamente');
        setNombre('');
        setDescripcion('');
        setPrecio('');
        setImagen(null);
      } else {
        alert(data.message || 'Error al agregar producto');
      }
    } catch (e) {
      alert('Error de red o servidor');
    }
    setSubiendo(false);
  };

  return (
    <View style={styles.container}>
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
      />
      <TextInput
        style={styles.input}
        placeholder="Precio por Unidad ($)"
        value={precio}
        onChangeText={setPrecio}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.fotoBtn} onPress={pickImage}>
        <Text style={{ color: '#6B9B37', textAlign: 'center' }}>Agregar Foto</Text>
      </TouchableOpacity>
      {imagen && (
        <Image source={{ uri: imagen.uri }} style={{ width: 120, height: 120, alignSelf: 'center', margin: 10, borderRadius: 10 }} />
      )}
      <TouchableOpacity style={styles.button} onPress={handleGuardar} disabled={subiendo}>
        {subiendo ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>GUARDAR PRODUCTO</Text>}
      </TouchableOpacity>
    </View>
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
    height: 40,
    backgroundColor: '#f7faf5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
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