import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Button, Card, Chip, IconButton } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import apiClient from '../../services/apiClient'; // Asegúrate que la ruta sea correcta

export default function ProductosScreen() {
  const navigation = useNavigation();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar productos cada vez que entras a la pantalla
  useFocusEffect(
    useCallback(() => {
      cargarProductos();
    }, [])
  );

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/mis-productos');
      setProductos(response.data.productos || []);
    } catch (error) {
      console.error('Error cargando productos:', error);
      Alert.alert('Error', 'No se pudieron cargar los productos.');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = (id) => {
    Alert.alert(
      'Eliminar Producto',
      '¿Estás seguro de que quieres eliminar este producto? No se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/productos/${id}`);
              // Actualizar lista localmente sin recargar todo
              setProductos(prev => prev.filter(p => p.id !== id));
              Alert.alert('Éxito', 'Producto eliminado');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el producto.');
            }
          }
        }
      ]
    );
  };

  const handleEditar = (producto) => {
    // Navegar a la pantalla de agregar pero pasando el producto para editar
    // (Asegúrate de que tu AddProductScreen soporte recibir params)
    navigation.navigate('AddProduct', { productoEditar: producto });
  };

  // Función para mostrar imagen o emoji si no hay foto
  const renderImagen = (img) => {
    if (!img || img === '🌾' || img.length < 50) {
      return (
        <View style={styles.placeholderImage}>
          <Text style={{ fontSize: 24 }}>{img === '🌾' ? '🌾' : '📦'}</Text>
        </View>
      );
    }
    return <Image source={{ uri: img }} style={styles.imagen} />;
  };

  const renderProducto = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.productoContainer}>
        {renderImagen(item.imagen)}
        
        <View style={styles.infoContainer}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.descripcion} numberOfLines={1}>{item.descripcion}</Text>
          <View style={styles.row}>
            <Text style={styles.precio}>${parseFloat(item.precio).toFixed(2)}</Text>
            <Chip style={styles.stockChip} textStyle={{fontSize: 10, marginVertical: 0}}>
              Stock: {item.disponibles}
            </Chip>
          </View>
        </View>

        <View style={styles.botonesContainer}>
          <IconButton 
            icon="pencil" 
            iconColor="#6B9B37" 
            size={20} 
            onPress={() => handleEditar(item)} 
          />
          <IconButton 
            icon="delete" 
            iconColor="#FF5252" 
            size={20} 
            onPress={() => handleEliminar(item.id)} 
          />
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6B9B37" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Productos</Text>
      <FlatList
        data={productos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProducto}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={{ color: '#888' }}>No tienes productos registrados.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B9B37',
    marginBottom: 20,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#FFF',
    elevation: 2,
    borderRadius: 8,
  },
  productoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  imagen: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  descripcion: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  precio: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#6B9B37',
  },
  stockChip: {
    height: 24,
    backgroundColor: '#f0f0f0',
  },
  botonesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});