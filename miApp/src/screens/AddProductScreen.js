import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Platform, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '../services/apiClient';

// Detectar si estamos en web
const isWeb = Platform.OS === 'web';

const CATEGORIAS = ['Frutas', 'Verduras', 'Lácteos', 'Granos', 'Carnes', 'Otros'];

const AddProductScreen = ({ navigation }) => {
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoria, setCategoria] = useState('Verduras');
  const [disponibles, setDisponibles] = useState('');
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
      mediaTypes: ImagePicker.MediaType.Images,
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
    alert('🔵 BOTÓN PRESIONADO - Iniciando proceso...');
    console.log('🚀 === INICIANDO CREACIÓN DE PRODUCTO ===');
    console.log('📝 Datos del formulario:');
    console.log('  - Nombre:', productName);
    console.log('  - Precio:', price);
    console.log('  - Disponibles:', disponibles);
    console.log('  - Categoría:', categoria);
    
    // Validaciones
    if (!productName.trim()) {
      console.log('❌ Validación fallida: nombre vacío');
      alert('❌ ERROR: El nombre del producto es obligatorio');
      Alert.alert('Error', 'El nombre del producto es obligatorio');
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      console.log('❌ Validación fallida: precio inválido');
      alert('❌ ERROR: El precio debe ser mayor a 0');
      Alert.alert('Error', 'El precio debe ser mayor a 0');
      return;
    }
    if (!disponibles || parseInt(disponibles) < 0) {
      console.log('❌ Validación fallida: cantidad inválida');
      alert('❌ ERROR: La cantidad disponible es obligatoria');
      Alert.alert('Error', 'La cantidad disponible es obligatoria');
      return;
    }

    alert('✅ Validaciones OK - Enviando al servidor...');
    console.log('✅ Validaciones pasadas, enviando al servidor...');
    setLoading(true);
    try {
      // Crear el producto con los datos necesarios
      const productoData = {
        nombre: productName.trim(),
        descripcion: description.trim() || '',
        precio: parseFloat(price),
        categoria: categoria,
        disponibles: parseInt(disponibles),
        // La imagen es opcional, se puede enviar null o un emoji
        imagen: '🍅', // Cambiado a emoji de tomate para ver si se guarda
      };

      console.log('📦 Datos a enviar:', JSON.stringify(productoData, null, 2));
      
      const response = await apiClient.post('/productos', productoData);
      
      console.log('✅ Respuesta recibida:', response.status);
      console.log('📄 Datos de respuesta:', JSON.stringify(response.data, null, 2));
      
      if (response.status === 201) {
        console.log('🎉 Producto creado exitosamente!');
        alert('🎉 ¡ÉXITO! Producto creado correctamente');
        Alert.alert('Éxito', 'Producto creado exitosamente', [
          {
            text: 'OK',
            onPress: () => {
              // Limpiar formulario
              setProductName('');
              setDescription('');
              setPrice('');
              setDisponibles('');
              setCategoria('Verduras');
              setImage(null);
              setImagePreview(null);
              // Navegar de vuelta si hay navegación
              if (navigation) {
                navigation.goBack();
              }
            }
          }
        ]);
      }
    } catch (error) {
      console.log('💥 =============== ERROR ===============');
      console.error('❌ Error completo:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error data:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error message:', error.message);
      console.log('======================================');
      
      alert('💥 ERROR: ' + (error.response?.data?.message || error.message || 'Error desconocido'));
      
      let mensaje = 'Error al crear el producto';
      
      if (error.response?.status === 401) {
        mensaje = 'No estás autenticado. Por favor inicia sesión nuevamente.';
      } else if (error.response?.status === 403) {
        mensaje = 'No tienes permisos para crear productos. Debes ser productor.';
      } else if (error.response?.data?.errors) {
        // Errores de validación del backend
        const errores = Object.values(error.response.data.errors).flat();
        mensaje = errores.join('\n');
      } else if (error.response?.data?.message) {
        mensaje = error.response.data.message;
      } else if (error.message) {
        mensaje = error.message;
      }
      
      Alert.alert('Error', mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Agregar Nuevo Producto</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nombre del Producto *"
        value={productName}
        onChangeText={setProductName}
      />
      
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Descripción Detallada"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Precio por Unidad ($) *"
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Categoría:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={categoria}
          onValueChange={(itemValue) => setCategoria(itemValue)}
          style={styles.picker}
        >
          {CATEGORIAS.map((cat) => (
            <Picker.Item key={cat} label={cat} value={cat} />
          ))}
        </Picker>
      </View>
      
      <TextInput
        style={styles.input}
        placeholder="Cantidad Disponible *"
        value={disponibles}
        onChangeText={setDisponibles}
        keyboardType="number-pad"
      />

      {/* Temporalmente deshabilitado - Carga de imágenes
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
            Agregar Foto (Opcional)
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
          <Text style={styles.imageUploadText}>Agregar Foto (Opcional)</Text>
        </TouchableOpacity>
      )}
      {imagePreview && !isWeb && (
        <Image source={{ uri: imagePreview }} style={{ width: 120, height: 120, alignSelf: 'center', margin: 10, borderRadius: 10 }} />
      )}
      */}
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleAddProduct} 
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>GUARDAR PRODUCTO</Text>
        )}
      </TouchableOpacity>
      
      <Text style={styles.note}>* Campos obligatorios</Text>
    </ScrollView>
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
    marginTop: 5,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  pickerContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
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
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  note: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
});

export default AddProductScreen;