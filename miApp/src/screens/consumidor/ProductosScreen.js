import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { Card, Text, Searchbar, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import apiClient from '../../services/apiClient';
import { useCarrito } from '../../context/CarritoContext';

export default function ProductosScreen({ navigation, route }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(route.params?.categoriaFiltro || 'Todos');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [productos, setProductos] = useState([]);
  const { agregarAlCarrito } = useCarrito();

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    // Actualizar categoría si viene de los parámetros de navegación
    if (route.params?.categoriaFiltro) {
      setSelectedCategory(route.params.categoriaFiltro);
    }
  }, [route.params?.categoriaFiltro]);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/productos');
      setProductos(response.data.productos || response.data || []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarProductos();
  };

  const categorias = ['Todos', 'Frutas', 'Verduras', 'Lácteos', 'Granos', 'Carnes', 'Otros'];

  const productosFiltrados = productos.filter((producto) => {
    const matchSearch = producto.nombre
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchCategory =
      selectedCategory === 'Todos' || producto.categoria === selectedCategory;
    return matchSearch && matchCategory;
  });

  const renderProducto = ({ item }) => (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() =>
        navigation.navigate('DetalleProducto', { producto: item })
      }
    >
      <Card style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.imagenProducto}>{item.imagen}</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.nombreProducto} numberOfLines={2}>
              {item.nombre}
            </Text>
            <Text style={styles.productor}>{item.productor?.nombre || 'Productor local'}</Text>
            <View style={styles.ratingContainer}>
              <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
              <Text style={styles.rating}>{item.calificacion || 4.5}</Text>
              <Text style={styles.disponibles}>
                ({item.disponibles} disponibles)
              </Text>
            </View>
          </View>
          <View style={styles.precioContainer}>
            <Text style={styles.precio}>${parseFloat(item.precio).toFixed(2)}</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => agregarAlCarrito(item, 1)}
            >
              <MaterialCommunityIcons name="plus-circle" size={32} color="#4A90E2" />
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Cargando productos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Buscar productos..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
          data={categorias}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.pill,
                selectedCategory === item && styles.pillSelected,
              ]}
              onPress={() => setSelectedCategory(item)}
              activeOpacity={0.7}
            >
              <Text style={selectedCategory === item ? styles.pillTextSelected : styles.pillText}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContainer}
        />

      {loading && !refreshing ? (
        <ActivityIndicator
          size="large"
          color="#4A90E2"
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={productosFiltrados}
          renderItem={renderProducto}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4A90E2"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="magnify-close" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No se encontraron productos</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  searchbar: {
    margin: 12,
    elevation: 2,
  },
  categoriesContainer: {
    paddingHorizontal: 0,
    paddingVertical: 4,
    marginBottom: 2,
    flexDirection: 'row',
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
    elevation: 4,
  },
  pillText: {
    color: '#333',
    fontWeight: '500',
    fontSize: 14,
  },
  pillTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cardContainer: {
    marginBottom: 12,
  },
  card: {
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  imagenProducto: {
    fontSize: 48,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  nombreProducto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productor: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rating: {
    marginLeft: 4,
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
  },
  disponibles: {
    fontSize: 11,
    color: '#999',
    marginLeft: 8,
  },
  precioContainer: {
    alignItems: 'center',
    marginLeft: 8,
  },
  precio: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 8,
  },
  addButton: {
    padding: 4,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    color: '#999',
    fontSize: 14,
  },
});
