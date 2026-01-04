import React, { useState } from 'react';
import { View, Text, FlatList, Image, Button, StyleSheet } from 'react-native';

export default function ProductosScreen() {
  const [productos, setProductos] = useState([
    {
      id: '1',
      nombre: 'Cacao',
      descripcion: 'Cacao de alta calidad',
      precio: 2.0,
      imagen: 'https://via.placeholder.com/150',
    },
    // Agregar más productos aquí
  ]);

  const handleEditar = (id) => {
    alert(`Editar producto con ID: ${id}`);
  };

  const handleEliminar = (id) => {
    setProductos((prevProductos) => prevProductos.filter((producto) => producto.id !== id));
    alert('Producto eliminado');
  };

  const renderProducto = ({ item }) => (
    <View style={styles.productoContainer}>
      <Image source={{ uri: item.imagen }} style={styles.imagen} />
      <View style={styles.infoContainer}>
        <Text style={styles.nombre}>{item.nombre}</Text>
        <Text style={styles.descripcion}>{item.descripcion}</Text>
        <Text style={styles.precio}>${item.precio.toFixed(2)}</Text>
      </View>
      <View style={styles.botonesContainer}>
        <Button title="Editar" onPress={() => handleEditar(item.id)} color="#6B9B37" />
        <Button title="Eliminar" onPress={() => handleEliminar(item.id)} color="#FF0000" />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Productos</Text>
      <FlatList
        data={productos}
        keyExtractor={(item) => item.id}
        renderItem={renderProducto}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B9B37',
    marginBottom: 20,
  },
  productoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  imagen: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
  },
  nombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  descripcion: {
    fontSize: 14,
    color: '#666666',
  },
  precio: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B9B37',
  },
  botonesContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
});