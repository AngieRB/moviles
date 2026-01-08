import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Card, Text, Searchbar, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ProductosScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Datos de ejemplo - en producción vendrían de una API
  const [productos] = useState([
    {
      id: '1',
      name: 'Tomates Frescos',
      categoria: 'Vegetales',
      precio: 2.50,
      calificacion: 4.5,
      imagen: '🍅',
      disponibles: 50,
      productor: 'Juan García',
    },
    {
      id: '2',
      name: 'Lechugas Orgánicas',
      categoria: 'Vegetales',
      precio: 1.80,
      calificacion: 4.8,
      imagen: '🥬',
      disponibles: 30,
      productor: 'María López',
    },
    {
      id: '3',
      name: 'Manzanas Rojas',
      categoria: 'Frutas',
      precio: 3.20,
      calificacion: 4.6,
      imagen: '🍎',
      disponibles: 75,
      productor: 'Carlos Rodríguez',
    },
    {
      id: '4',
      name: 'Zanahorias',
      categoria: 'Vegetales',
      precio: 1.50,
      calificacion: 4.4,
      imagen: '🥕',
      disponibles: 45,
      productor: 'Ana Martínez',
    },
    {
      id: '5',
      name: 'Plátanos',
      categoria: 'Frutas',
      precio: 2.00,
      calificacion: 4.7,
      imagen: '🍌',
      disponibles: 100,
      productor: 'Pedro García',
    },
  ]);

  const categorias = ['Todos', 'Vegetales', 'Frutas', 'Lácteos', 'Granos'];

  const productosFiltrados = productos.filter((producto) => {
    const matchSearch = producto.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchCategory =
      selectedCategory === 'Todos' || producto.categoria === selectedCategory;
    return matchSearch && matchCategory;
  });

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

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
              {item.name}
            </Text>
            <Text style={styles.productor}>{item.productor}</Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={14} color="#FFD700" />
              <Text style={styles.rating}>{item.calificacion}</Text>
              <Text style={styles.disponibles}>
                ({item.disponibles} disponibles)
              </Text>
            </View>
          </View>
          <View style={styles.precioContainer}>
            <Text style={styles.precio}>${item.precio.toFixed(2)}</Text>
            <TouchableOpacity style={styles.addButton}>
              <Icon name="plus-circle" size={32} color="#4A90E2" />
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

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
          <Chip
            selected={selectedCategory === item}
            onPress={() => setSelectedCategory(item)}
            style={[
              styles.chip,
              selectedCategory === item && styles.chipSelected,
            ]}
            textStyle={styles.chipText}
          >
            {item}
          </Chip>
        )}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      />

      {loading ? (
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
              <Icon name="magnify-close" size={48} color="#ccc" />
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
  searchbar: {
    margin: 12,
    elevation: 2,
  },
  categoriesContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chip: {
    marginRight: 8,
    backgroundColor: '#fff',
  },
  chipSelected: {
    backgroundColor: '#4A90E2',
  },
  chipText: {
    color: '#333',
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
