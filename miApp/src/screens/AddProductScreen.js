import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';

const AddProductScreen = () => {
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);

  const handleAddProduct = () => {
    // Lógica para agregar producto
    console.log({ productName, description, price, image });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Agregar Nuevo Producto</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre del Producto"
        value={productName}
        onChangeText={setProductName}
      />

      <TextInput
        style={styles.input}
        placeholder="Descripción Detallada"
        value={description}
        onChangeText={setDescription}
      />

      <TextInput
        style={styles.input}
        placeholder="Precio por Unidad ($)"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.imageUpload} onPress={() => console.log('Subir imagen')}>
        <Text style={styles.imageUploadText}>Subir Imagen del Producto (Arrastra o haz clic)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleAddProduct}>
        <Text style={styles.buttonText}>GUARDAR PRODUCTO</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
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
  imageUpload: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#ffffff',
  },
  imageUploadText: {
    fontSize: 14,
    color: '#757575',
  },
  button: {
    height: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default AddProductScreen;