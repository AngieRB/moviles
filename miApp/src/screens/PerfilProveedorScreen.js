import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Alert
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Divider,
  Chip,
  ActivityIndicator,
  useTheme,
  Avatar
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import apiClient from '../services/apiClient';
import { useCarrito } from '../context/CarritoContext';

const PerfilProveedorScreen = ({ route, navigation }) => {
  const { proveedorId } = route.params;
  const theme = useTheme();
  const { agregarAlCarrito } = useCarrito();
  const [loading, setLoading] = useState(true);
  const [proveedor, setProveedor] = useState(null);

  useEffect(() => {
    cargarProveedor();
  }, [proveedorId]);

  const cargarProveedor = async () => {
    try {
      const response = await apiClient.get(`/proveedores/${proveedorId}`);
      setProveedor(response.data.proveedor);
    } catch (error) {
      console.error('Error al cargar proveedor:', error);
      Alert.alert('Error', 'No se pudo cargar el perfil del proveedor');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const llamarProveedor = () => {
    if (proveedor?.telefono) {
      Linking.openURL(`tel:${proveedor.telefono}`);
    }
  };

  const enviarWhatsApp = () => {
    if (proveedor?.telefono) {
      const mensaje = encodeURIComponent(`Hola ${proveedor.nombre}, vi tu perfil en la app y me interesa saber más sobre tus productos.`);
      Linking.openURL(`whatsapp://send?phone=${proveedor.telefono}&text=${mensaje}`);
    }
  };

  const enviarCorreo = () => {
    if (proveedor?.email) {
      Linking.openURL(`mailto:${proveedor.email}?subject=Consulta sobre productos`);
    }
  };

  const renderEstrellas = (calificacion) => {
    const estrellas = [];
    const calificacionRedondeada = Math.round(calificacion);
    
    for (let i = 1; i <= 5; i++) {
      estrellas.push(
        <Icon
          key={i}
          name={i <= calificacionRedondeada ? 'star' : 'star-outline'}
          size={20}
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
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  if (!proveedor) {
    return null;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header con foto de perfil */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.avatarWrapper}>
          {proveedor.foto_perfil ? (
            <Avatar.Image
              size={120}
              source={{ uri: `http://localhost:8000/storage/${proveedor.foto_perfil}` }}
              style={styles.avatar}
            />
          ) : (
            <Avatar.Icon
              size={120}
              icon="account"
              style={[styles.avatar, { backgroundColor: theme.colors.secondary }]}
            />
          )}
          {proveedor.verificado && (
            <View style={styles.verificadoBadge}>
              <Icon name="check-decagram" size={32} color="#4CAF50" />
            </View>
          )}
        </View>
        
        <Text variant="headlineSmall" style={styles.nombreProveedor}>
          {proveedor.nombre_completo}
        </Text>
        
        {proveedor.verificado && (
          <Chip
            icon="shield-check"
            style={styles.verificadoChip}
            textStyle={{ color: '#fff' }}
          >
            Proveedor Certificado
          </Chip>
        )}
      </View>

      {/* Estadísticas */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.estadisticasContainer}>
            <View style={styles.estadistica}>
              <Icon name="star" size={32} color="#FFB300" />
              <Text variant="headlineSmall" style={styles.estadisticaValor}>
                {proveedor.calificacion_promedio.toFixed(1)}
              </Text>
              <Text variant="bodySmall" style={styles.estadisticaLabel}>
                Calificación
              </Text>
            </View>

            <Divider style={styles.dividerVertical} />

            <View style={styles.estadistica}>
              <Icon name="package-variant" size={32} color={theme.colors.primary} />
              <Text variant="headlineSmall" style={styles.estadisticaValor}>
                {proveedor.total_productos}
              </Text>
              <Text variant="bodySmall" style={styles.estadisticaLabel}>
                Productos
              </Text>
            </View>

            <Divider style={styles.dividerVertical} />

            <View style={styles.estadistica}>
              <Icon name="check-circle" size={32} color="#4CAF50" />
              <Text variant="headlineSmall" style={styles.estadisticaValor}>
                {proveedor.total_ventas}
              </Text>
              <Text variant="bodySmall" style={styles.estadisticaLabel}>
                Ventas
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Botones de contacto */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Contactar al proveedor
          </Text>
          <View style={styles.botonesContacto}>
            <Button
              mode="contained"
              icon="phone"
              onPress={llamarProveedor}
              style={styles.botonContacto}
            >
              Llamar
            </Button>
            <Button
              mode="contained"
              icon="whatsapp"
              onPress={enviarWhatsApp}
              style={[styles.botonContacto, { backgroundColor: '#25D366' }]}
            >
              WhatsApp
            </Button>
            <Button
              mode="contained-tonal"
              icon="email"
              onPress={enviarCorreo}
              style={styles.botonContacto}
            >
              Correo
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Información de contacto */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Información de contacto
          </Text>
          
          <View style={styles.infoRow}>
            <Icon name="phone" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text variant="bodySmall" style={styles.infoLabel}>Teléfono</Text>
              <Text variant="bodyMedium">{proveedor.telefono}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="email" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text variant="bodySmall" style={styles.infoLabel}>Correo electrónico</Text>
              <Text variant="bodyMedium">{proveedor.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="card-account-details" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text variant="bodySmall" style={styles.infoLabel}>Cédula</Text>
              <Text variant="bodyMedium">{proveedor.cedula}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Información de la hacienda */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Información de la hacienda
          </Text>
          
          {proveedor.nombre_hacienda && (
            <View style={styles.infoRow}>
              <Icon name="home" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={styles.infoLabel}>Nombre</Text>
                <Text variant="bodyMedium">{proveedor.nombre_hacienda}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <Icon name="map-marker" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text variant="bodySmall" style={styles.infoLabel}>Ubicación</Text>
              <Text variant="bodyMedium">{proveedor.ubicacion_hacienda}</Text>
            </View>
          </View>

          {proveedor.hectareas && (
            <View style={styles.infoRow}>
              <Icon name="texture-box" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={styles.infoLabel}>Tamaño</Text>
                <Text variant="bodyMedium">{proveedor.hectareas} hectáreas</Text>
              </View>
            </View>
          )}

          {proveedor.descripcion_hacienda && (
            <View style={styles.infoRow}>
              <Icon name="text" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={styles.infoLabel}>Descripción</Text>
                <Text variant="bodyMedium">{proveedor.descripcion_hacienda}</Text>
              </View>
            </View>
          )}

          {proveedor.tipo_cultivo && proveedor.tipo_cultivo.length > 0 && (
            <View style={styles.infoRow}>
              <Icon name="sprout" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={styles.infoLabel}>Tipo de cultivo</Text>
                <View style={styles.cultivosContainer}>
                  {proveedor.tipo_cultivo.map((cultivo, index) => (
                    <Chip key={index} compact style={styles.cultivoChip}>
                      {cultivo}
                    </Chip>
                  ))}
                </View>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <Icon name="calendar-check" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text variant="bodySmall" style={styles.infoLabel}>Miembro desde</Text>
              <Text variant="bodyMedium">
                {format(new Date(proveedor.miembro_desde), "MMMM 'de' yyyy", { locale: es })}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Productos */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Productos disponibles ({proveedor.productos.length})
          </Text>
          
          {proveedor.productos.length === 0 ? (
            <View style={styles.emptyProductos}>
              <Icon name="package-variant-closed" size={48} color="#ccc" />
              <Text variant="bodyMedium" style={styles.emptyText}>
                No hay productos disponibles en este momento
              </Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productosScroll}>
              {proveedor.productos.map((producto) => (
                <View
                  key={producto.id}
                  style={styles.productoCard}
                >
                  <Image
                    source={{ uri: producto.imagen.startsWith('http') 
                      ? producto.imagen 
                      : `http://localhost:8000/storage/${producto.imagen}` }}
                    style={styles.productoImagen}
                    resizeMode="cover"
                  />
                  <View style={styles.productoInfo}>
                    <Text variant="titleSmall" numberOfLines={1}>
                      {producto.nombre}
                    </Text>
                    <Text variant="bodySmall" style={styles.productoCategoria}>
                      {producto.categoria}
                    </Text>
                    <View style={styles.productoPrecioContainer}>
                      <Text variant="titleMedium" style={styles.productoPrecio}>
                        ${producto.precio}
                      </Text>
                      <View style={styles.productoEstrellas}>
                        <Icon name="star" size={14} color="#FFB300" />
                        <Text variant="bodySmall" style={styles.productoCalificacion}>
                          {(parseFloat(producto.calificacion) || 4.5).toFixed(1)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.productoFooter}>
                      <Text variant="bodySmall" style={styles.productoDisponibles}>
                        <Icon name="package-variant" size={12} color="#51CF66" />
                        {' '}{producto.disponibles} disponibles
                      </Text>
                      <TouchableOpacity 
                        style={styles.addToCartButton}
                        onPress={() => {
                          agregarAlCarrito(producto, 1);
                          Alert.alert('✅ Añadido', `${producto.nombre} se agregó al carrito`);
                        }}
                      >
                        <Icon name="cart-plus" size={20} color="#4A90E2" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  content: {
    paddingBottom: 24
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
  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 16
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16
  },
  avatar: {
    borderWidth: 4,
    borderColor: '#fff'
  },
  verificadoBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 2
  },
  nombreProveedor: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8
  },
  verificadoChip: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)'
  },
  card: {
    margin: 16,
    marginBottom: 0,
    elevation: 2
  },
  estadisticasContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8
  },
  estadistica: {
    alignItems: 'center',
    flex: 1
  },
  estadisticaValor: {
    fontWeight: 'bold',
    marginTop: 4
  },
  estadisticaLabel: {
    color: '#666',
    marginTop: 4
  },
  dividerVertical: {
    width: 1,
    height: '100%'
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16
  },
  botonesContacto: {
    flexDirection: 'row',
    gap: 8
  },
  botonContacto: {
    flex: 1
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start'
  },
  infoContent: {
    flex: 1,
    marginLeft: 12
  },
  infoLabel: {
    color: '#666',
    marginBottom: 4
  },
  cultivosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4
  },
  cultivoChip: {
    height: 28
  },
  emptyProductos: {
    alignItems: 'center',
    paddingVertical: 32
  },
  emptyText: {
    color: '#999',
    marginTop: 12
  },
  productosScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16
  },
  productoCard: {
    width: 160,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    overflow: 'hidden'
  },
  productoImagen: {
    width: '100%',
    height: 120
  },
  productoInfo: {
    padding: 12
  },
  productoCategoria: {
    color: '#666',
    marginTop: 2
  },
  productoPrecioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
  },
  productoPrecio: {
    fontWeight: 'bold',
    color: '#4CAF50'
  },
  productoEstrellas: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  productoCalificacion: {
    color: '#666'
  },
  productoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  productoDisponibles: {
    color: '#51CF66',
    fontSize: 11,
    flex: 1
  },
  addToCartButton: {
    backgroundColor: '#E3F2FD',
    padding: 6,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default PerfilProveedorScreen;
