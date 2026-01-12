import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import apiClient from '../../services/apiClient';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 768;

const InicioScreen = () => {
  const { user } = useApp();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar productos cuando la pantalla recibe el foco
  useFocusEffect(
    React.useCallback(() => {
      cargarProductos();
    }, [])
  );

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/mis-productos');
      setProductos(response.data.productos || []);
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

  const getEstadoStock = (stock) => {
    if (stock === 0) return { text: 'Agotado', color: '#f44336' };
    if (stock < 10) return { text: 'Bajo', color: '#ff9800' };
    if (stock < 50) return { text: 'Medio', color: '#ffc107' };
    return { text: 'Alto', color: '#4CAF50' };
  };

  const renderProduct = ({ item }) => {
    const estado = getEstadoStock(item.disponibles);
    
    return (
      <View style={styles.productRow}>
        <Text style={styles.productName} numberOfLines={1}>{item.nombre}</Text>
        <Text style={styles.productCategory}>{item.categoria}</Text>
        <Text style={styles.productPrice}>${item.precio}</Text>
        <Text style={styles.productStock}>{item.disponibles}</Text>
        <Text style={[styles.productStatus, { color: estado.color }]}>{estado.text}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Cargando productos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>¡Bienvenido, {user?.name || 'Productor'}!</Text>
      <Text style={styles.subHeader}>AgroConnect - Panel de Productor</Text>

      <Text style={styles.sectionTitle}>
        Stock de Productos Disponibles ({productos.length})
      </Text>
      
      {/* Encabezados de tabla */}
      <View style={styles.tableHeader}>
        <Text style={styles.headerText}>Producto</Text>
        <Text style={styles.headerText}>Categoría</Text>
        <Text style={styles.headerText}>Precio</Text>
        <Text style={styles.headerText}>Stock</Text>
        <Text style={styles.headerText}>Estado</Text>
      </View>

      {productos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>📦</Text>
          <Text style={styles.emptyMessage}>No tienes productos registrados</Text>
          <Text style={styles.emptySubMessage}>Agrega tu primer producto usando el botón "+"</Text>
        </View>
      ) : (
        <FlatList
          data={productos}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          style={styles.productList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4CAF50']}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: isSmallScreen ? 10 : 20,
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
    fontSize: isSmallScreen ? 14 : 16,
    color: '#757575',
  },
  header: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  subHeader: {
    fontSize: isSmallScreen ? 14 : 18,
    color: '#757575',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: isSmallScreen ? 16 : 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubMessage: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: isSmallScreen ? 8 : 12,
    paddingHorizontal: isSmallScreen ? 5 : 10,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    marginBottom: 5,
  },
  headerText: {
    fontSize: isSmallScreen ? 11 : 14,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  productList: {
    marginTop: 5,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isSmallScreen ? 8 : 12,
    backgroundColor: '#ffffff',
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  productName: {
    fontSize: isSmallScreen ? 12 : 15,
    fontWeight: '600',
    color: '#4CAF50',
    flex: 1,
  },
  productCategory: {
    fontSize: isSmallScreen ? 10 : 13,
    color: '#757575',
    flex: 1,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: isSmallScreen ? 11 : 13,
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  productStock: {
    fontSize: isSmallScreen ? 11 : 13,
    color: '#555',
    flex: 1,
    textAlign: 'center',
  },
  productStatus: {
    fontSize: isSmallScreen ? 10 : 13,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
});

export default InicioScreen;