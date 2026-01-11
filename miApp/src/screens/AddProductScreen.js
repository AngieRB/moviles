import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Platform, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// Detectar si estamos en web
const isWeb = Platform.OS === 'web';

const AddProductScreen = () => {
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Web: input file
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Móvil: expo-image-picker
  const pickImageMobile = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0]);
      setImagePreview(result.assets[0].uri);
    }
  };

  const handleAddProduct = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('nombre', productName);
    formData.append('descripcion', description);
    formData.append('precio', price);
    formData.append('categoria', 'General');
    formData.append('disponibles', 10);
    if (image) {
      if (isWeb) {
        formData.append('imagen', image);
      } else {
        formData.append('imagen', {
          uri: image.uri,
          name: 'producto.jpg',
          type: 'image/jpeg',
        });
      }
    }
    await fetch('http://192.168.90.15:8000/api/productos', {
      method: 'POST',
      body: formData,
    });
    setLoading(false);
    alert('Producto enviado');
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
      {isWeb ? (
        <div style={{ marginBottom: 20 }}>
          <button
            type="button"
            style={{
              height: 40,
              width: '100%',
              background: '#f7faf5',
              borderRadius: 10,
              border: '1px solid #e0e0e0',
              color: '#6B9B37',
              cursor: 'pointer',
            }}
            onClick={handleImageClick}
          >
            Agregar Foto
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="preview"
              width={120}
              style={{ borderRadius: 10, marginTop: 8 }}
            />
          )}
        </div>
      ) : (
        <TouchableOpacity style={styles.imageUpload} onPress={pickImageMobile}>
          <Text style={styles.imageUploadText}>Agregar Foto</Text>
        </TouchableOpacity>
      )}
      {imagePreview && !isWeb && (
        <Image source={{ uri: imagePreview }} style={{ width: 120, height: 120, alignSelf: 'center', margin: 10, borderRadius: 10 }} />
      )}
      <TouchableOpacity style={styles.button} onPress={handleAddProduct} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>GUARDAR PRODUCTO</Text>}
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
    height: 40,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#f7faf5',
  },
  imageUploadText: {
    fontSize: 14,
    color: '#6B9B37',
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

export default AddProductScreen;