import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Image, RefreshControl } from 'react-native';
import { Text, Card, ActivityIndicator, FAB, Chip, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

// 👇 CORRECCIÓN: Solo '..' porque estamos en src/screens/
import apiClient from '../services/apiClient';
import { useApp } from '../context/AppContext';

export default function ProducerHomeScreen() {
  const { user } = useApp();
  const navigation = useNavigation();
  const theme = useTheme();
  
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resumen, setResumen] = useState({ ventas: 0, pedidos: 0 });

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [])
  );

  const cargarDatos = async () => {
    try {
      if (loading && !refreshing) return;

      const [resProd, resPedidos] = await Promise.all([
        apiClient.get('/mis-productos'),
        apiClient.get('/mis-pedidos-productor')
      ]);

      setProductos(resProd.data.productos || []);

      const listaPedidos = resPedidos.data.pedidos || [];
      const totalVentas = listaPedidos.reduce((acc, p) => acc + (parseFloat(p.total) || 0), 0);
      
      setResumen({
        ventas: totalVentas.toFixed(2),
        pedidos: listaPedidos.length
      });

    } catch (error) {
      console.log('Error cargando datos:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarDatos();
  };

  const renderImagenProducto = (img) => {
    if (!img || img === '🌾' || img.length < 50) {
      return (
        <View style={styles.placeholderImage}>
          <Text style={{ fontSize: 30 }}>{img === '🌾' ? '🌾' : '📦'}</Text>
        </View>
      );
    }
    return (
      <Image 
        source={{ uri: img }} 
        style={styles.productImage} 
        resizeMode="cover"
      />
    );
  };

  const renderHeader = () => (
    <View>
      <View style={styles.profileSection}>
        <Text style={styles.header}>¡Hola, {user?.nombre || 'Productor'}!</Text>
        <Text style={styles.subHeader}>Panel de Control AgroConnect</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Ventas</Text>
            <Text style={styles.statValue}>${resumen.ventas}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Pedidos</Text>
            <Text style={styles.statValue}>{resumen.pedidos}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Mis Productos e Inventario</Text>
    </View>
  );

  const renderProduct = ({ item }) => (
    <Card style={styles.productCard} onPress={() => {}}>
      <View style={styles.productRow}>
        {renderImagenProducto(item.imagen)}
        
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.nombre}</Text>
          <Text style={styles.productCategory}>{item.categoria || 'General'}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>${parseFloat(item.precio).toFixed(2)}</Text>
            <Chip 
              icon="package-variant" 
              style={{ height: 26, backgroundColor: item.disponibles > 10 ? '#E8F5E9' : '#FFEBEE' }}
              textStyle={{ fontSize: 11, color: item.disponibles > 10 ? '#2E7D32' : '#C62828' }}
            >
              Stock: {item.disponibles}
            </Chip>
          </View>
        </View>
      </View>
    </Card>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={productos}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="basket-off" size={50} color="#ccc" />
            <Text style={{ color: '#888', marginTop: 10 }}>No tienes productos aún.</Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        label="Nuevo"
        style={styles.fab}
        color="white"
        onPress={() => navigation.navigate('AddProduct')}
      />
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
  },
  listContent: {
    padding: 20,
    paddingBottom: 80, 
  },
  profileSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  subHeader: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    padding: 10,
    borderRadius: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#ccc',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginLeft: 5,
  },
  productCard: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
  productRow: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productCategory: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 5,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
});