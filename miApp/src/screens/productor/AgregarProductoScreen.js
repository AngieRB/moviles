import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

export default function AgregarProductoScreen() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');

  const handleGuardar = () => {
    if (!/^[a-zA-Z\s]+$/.test(nombre)) {
      alert('El nombre solo puede contener letras y espacios.');
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(descripcion)) {
      alert('La descripción solo puede contener letras y espacios.');
      return;
    }
    if (!/^\d+(\.\d{1,2})?$/.test(precio)) {
      alert('El precio debe ser un número válido.');
      return;
    }
    alert('Producto agregado exitosamente');
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
      <TouchableOpacity style={styles.button} onPress={handleGuardar}>
        <Text style={styles.buttonText}>GUARDAR PRODUCTO</Text>
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