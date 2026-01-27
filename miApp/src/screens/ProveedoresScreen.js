import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Image
} from 'react-native';
import {
  Text,
  Card,
  Searchbar,
  Chip,
  ActivityIndicator,
  useTheme,
  Avatar,
  Badge
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import apiClient from '../services/apiClient';

const ProveedoresScreen = ({ navigation }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [proveedoresFiltrados, setProveedoresFiltrados] = useState([]);

  useEffect(() => {
    cargarProveedores();
  }, []);

  useEffect(() => {
    filtrarProveedores();
  }, [busqueda, proveedores]);

  const cargarProveedores = async () => {
    try {
      const response = await apiClient.get('/proveedores');
      setProveedores(response.data.proveedores);
      setProveedoresFiltrados(response.data.proveedores);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filtrarProveedores = () => {
    if (!busqueda.trim()) {
      setProveedoresFiltrados(proveedores);
      return;
    }

    const filtrados = proveedores.filter(proveedor =>
      proveedor.nombre_completo.toLowerCase().includes(busqueda.toLowerCase())
    );
    setProveedoresFiltrados(filtrados);
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarProveedores();
  };

  const verPerfilProveedor = (proveedor) => {
    navigation.navigate('PerfilProveedor', { proveedorId: proveedor.id });
  };

  const renderEstrellas = (calificacion) => {
    const estrellas = [];
    const calificacionRedondeada = Math.round(calificacion);
    
    for (let i = 1; i <= 5; i++) {
      estrellas.push(
        <Icon
          key={i}
          name={i <= calificacionRedondeada ? 'star' : 'star-outline'}
          size={16}
          color="#FFB300"
        />
      );
    }
    return estrellas;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Cargando proveedores...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda sticky */}
      <View style={[styles.stickyHeader, { backgroundColor: theme.colors.background }]}>
        <Searchbar
          placeholder="Buscar proveedor por nombre..."
          onChangeText={setBusqueda}
          value={busqueda}
          style={styles.searchbar}
          icon="account-search"
        />
        <View style={styles.infoContainer}>
          <Icon name="shield-check" size={20} color={theme.colors.primary} />
          <Text variant="bodySmall" style={styles.infoText}>
            Todos los proveedores están verificados
          </Text>
        </View>
      </View>

      {/* Lista de proveedores */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {proveedoresFiltrados.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="account-search-outline" size={64} color="#ccc" />
            <Text variant="titleMedium" style={styles.emptyText}>
              {busqueda ? 'No se encontraron proveedores' : 'No hay proveedores disponibles'}
            </Text>
          </View>
        ) : (
          proveedoresFiltrados.map((proveedor) => (
            <TouchableOpacity
              key={proveedor.id}
              onPress={() => verPerfilProveedor(proveedor)}
              activeOpacity={0.7}
            >
              <Card style={styles.card}>
                <View style={styles.cardContent}>
                  {/* Avatar y badge de verificado */}
                  <View style={styles.avatarContainer}>
                    {proveedor.foto_perfil ? (
                      <Avatar.Image
                        size={70}
                        source={{ uri: `http://localhost:8000/storage/${proveedor.foto_perfil}` }}
                      />
                    ) : (
                      <Avatar.Icon
                        size={70}
                        icon="account"
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                    )}
                    {proveedor.verificado && (
                      <Badge
                        size={24}
                        style={styles.verificadoBadge}
                      >
                        <Icon name="check-decagram" size={16} color="#fff" />
                      </Badge>
                    )}
                  </View>

                  {/* Información del proveedor */}
                  <View style={styles.infoProveedor}>
                    <Text variant="titleMedium" style={styles.nombre}>
                      {proveedor.nombre_completo}
                    </Text>

                    {/* Ubicación */}
                    <View style={styles.row}>
                      <Icon name="map-marker" size={16} color="#666" />
                      <Text variant="bodySmall" style={styles.ubicacion} numberOfLines={1}>
                        {proveedor.ubicacion}
                      </Text>
                    </View>

                    {/* Calificación */}
                    <View style={styles.row}>
                      <View style={styles.estrellas}>
                        {renderEstrellas(proveedor.calificacion_promedio)}
                      </View>
                      <Text variant="bodySmall" style={styles.calificacionTexto}>
                        {proveedor.calificacion_promedio.toFixed(1)}
                      </Text>
                    </View>

                    {/* Productos disponibles */}
                    <View style={styles.row}>
                      <Chip
                        icon="package-variant"
                        compact
                        style={styles.chip}
                        textStyle={styles.chipText}
                      >
                        {proveedor.productos_disponibles} productos
                      </Chip>
                    </View>
                  </View>

                  {/* Icono de flecha */}
                  <Icon name="chevron-right" size={24} color="#999" />
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16,
    color: '#666'
  },
  stickyHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000
  },
  searchbar: {
    elevation: 2,
    marginBottom: 12
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  infoText: {
    color: '#666'
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8
  },
  card: {
    marginBottom: 12,
    elevation: 2
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center'
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16
  },
  verificadoBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50'
  },
  infoProveedor: {
    flex: 1
  },
  nombre: {
    fontWeight: 'bold',
    marginBottom: 4
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4
  },
  ubicacion: {
    color: '#666',
    flex: 1
  },
  estrellas: {
    flexDirection: 'row',
    gap: 2
  },
  calificacionTexto: {
    marginLeft: 4,
    color: '#666',
    fontWeight: '600'
  },
  chip: {
    height: 28,
    marginTop: 4
  },
  chipText: {
    fontSize: 12
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64
  },
  emptyText: {
    color: '#999',
    marginTop: 16,
    textAlign: 'center'
  }
});

export default ProveedoresScreen;
