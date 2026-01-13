import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import apiClient from '../../services/apiClient';

const { width } = Dimensions.get('window');
const cardWidth = ((width - 48) / 2); // 2 columnas: ancho total - padding - espacio entre = / 2

const CATEGORIAS = [
  { nombre: 'Frutas', icono: '🍎', color: '#FF6B6B', emoji: 'apple' },
  { nombre: 'Verduras', icono: '🥬', color: '#51CF66', emoji: 'leaf' },
  { nombre: 'Lácteos', icono: '🥛', color: '#4DABF7', emoji: 'cow' },
  { nombre: 'Granos', icono: '🌾', color: '#FFD43B', emoji: 'grain' },
  { nombre: 'Carnes', icono: '🥩', color: '#FF8787', emoji: 'food-steak' },
  { nombre: 'Otros', icono: '🛒', color: '#9775FA', emoji: 'basket' },
];

export default function InicioConsumidorScreen() {
  const { user } = useApp();
  const navigation = useNavigation();
  const [productos, setProductos] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    totalProductos: 0,
    categorias: 0,
    productores: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar productos con timeout de 8 segundos
      const resProductos = await apiClient.get('/productos', { timeout: 8000 });
      const productosData = resProductos.data.productos || resProductos.data || [];
      setProductos(productosData);

      // Calcular estadísticas
      const categoriasUnicas = [...new Set(productosData.map(p => p.categoria))];
      const productoresUnicos = [...new Set(productosData.map(p => p.user_id))];
      
      setEstadisticas({
        totalProductos: productosData.length,
        categorias: categoriasUnicas.length,
        productores: productoresUnicos.length,
      });

    } catch (error) {
      // Solo logear si no es timeout
      if (error.code !== 'ECONNABORTED') {
        console.log('Error al cargar productos');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarDatos();
  };

  const filtrarPorCategoria = (categoria) => {
    navigation.navigate('ProductosTab', {
      screen: 'ProductosList',
      params: { categoriaFiltro: categoria }
    });
  };

  const obtenerProductosPorCategoria = (categoria) => {
    return productos.filter(p => p.categoria === categoria).length;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Cargando productos...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header con saludo */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Hola, {user?.nombre || user?.name || 'Consumidor'}!</Text>
          <Text style={styles.subGreeting}>¿Qué productos agrícolas buscas hoy?</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('PerfilTab')}>
          <Icon name="account-circle" size={50} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => navigation.navigate('ProductosTab')}
          activeOpacity={0.7}
        >
          <Icon name="shopping" size={32} color="#4A90E2" />
          <Text style={styles.statNumber}>{estadisticas.totalProductos}</Text>
          <Text style={styles.statLabel}>Productos</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => {
            // Scroll hacia la sección de categorías
            navigation.navigate('ProductosTab');
          }}
          activeOpacity={0.7}
        >
          <Icon name="view-grid" size={32} color="#51CF66" />
          <Text style={styles.statNumber}>{estadisticas.categorias}</Text>
          <Text style={styles.statLabel}>Categorías</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => navigation.navigate('ProductosTab')}
          activeOpacity={0.7}
        >
          <Icon name="account-group" size={32} color="#FF6B6B" />
          <Text style={styles.statNumber}>{estadisticas.productores}</Text>
          <Text style={styles.statLabel}>Productores</Text>
        </TouchableOpacity>
      </View>

      {/* Título categorías */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categorías de Productos</Text>
        <Text style={styles.sectionSubtitle}>Toca una categoría para explorar</Text>
      </View>

      {/* Grid de categorías */}
      <View style={styles.categoriesGrid}>
        {CATEGORIAS.map((categoria, index) => {
          const count = obtenerProductosPorCategoria(categoria.nombre);
          return (
            <TouchableOpacity
              key={index}
              style={[styles.categoryCard, { backgroundColor: categoria.color + '15' }]}
              onPress={() => filtrarPorCategoria(categoria.nombre)}
              activeOpacity={0.7}
            >
              <View style={[styles.categoryIcon, { backgroundColor: categoria.color }]}>
                <Text style={styles.categoryEmoji}>{categoria.icono}</Text>
              </View>
              <Text style={styles.categoryName}>{categoria.nombre}</Text>
              <Text style={styles.categoryCount}>{count} productos</Text>
              <Icon name="chevron-right" size={20} color={categoria.color} style={styles.categoryArrow} />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Productos destacados */}
      <View style={styles.sectionHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>Productos Frescos</Text>
          <Text style={styles.sectionSubtitle}>Presiona para ver detalles</Text>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate('ProductosTab')}
          style={{ marginRight: 12 }}
        >
          <Text style={styles.verTodos}>Ver todos →</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('CarritoTab')}>
          <Icon name="cart" size={28} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.productosHorizontal}
      >
        {productos.slice(0, 6).map((producto) => (
          <TouchableOpacity
            key={producto.id}
            style={styles.productoCard}
            onPress={() => navigation.navigate('ProductosTab', {
              screen: 'DetalleProducto',
              params: { productoId: producto.id }
            })}
          >
            <View style={styles.productoImageContainer}>
              {producto.imagen && producto.imagen !== '🌾' ? (
                <Image source={{ uri: producto.imagen }} style={styles.productoImage} />
              ) : (
                <View style={styles.productoPlaceholder}>
                  <Text style={styles.productoPlaceholderText}>{producto.imagen || '🌾'}</Text>
                </View>
              )}
              <View style={[styles.categoriaBadge, { backgroundColor: CATEGORIAS.find(c => c.nombre === producto.categoria)?.color || '#9775FA' }]}>
                <Text style={styles.categoriaBadgeText}>{producto.categoria}</Text>
              </View>
            </View>
            <View style={styles.productoInfo}>
              <Text style={styles.productoNombre} numberOfLines={1}>{producto.nombre}</Text>
              <Text style={styles.productoPrecio}>${producto.precio}</Text>
              <View style={styles.stockBadge}>
                <Icon name="package-variant" size={14} color="#51CF66" />
                <Text style={styles.stockText}>{producto.disponibles} disponibles</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Banner promocional */}
      <View style={styles.promoBanner}>
        <Icon name="leaf" size={40} color="#fff" />
        <View style={styles.promoText}>
          <Text style={styles.promoTitle}>🌱 Productos 100% Orgánicos</Text>
          <Text style={styles.promoSubtitle}>Directo del campo a tu mesa</Text>
        </View>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subGreeting: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    marginTop: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  verTodos: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: cardWidth - 4,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryEmoji: {
    fontSize: 30,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: '#666',
  },
  categoryArrow: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  productosHorizontal: {
    paddingLeft: 16,
  },
  productoCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productoImageContainer: {
    position: 'relative',
  },
  productoImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    resizeMode: 'cover',
  },
  productoPlaceholder: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productoPlaceholderText: {
    fontSize: 50,
  },
  categoriaBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoriaBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productoInfo: {
    padding: 12,
  },
  productoNombre: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productoPrecio: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 4,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 11,
    color: '#51CF66',
    marginLeft: 4,
  },
  promoBanner: {
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  promoText: {
    marginLeft: 16,
    flex: 1,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  promoSubtitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
    opacity: 0.9,
  },
});
