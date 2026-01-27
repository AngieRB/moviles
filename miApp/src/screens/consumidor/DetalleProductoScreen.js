import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Card, Text, Button, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import apiClient from '../../services/apiClient';

export default function DetalleProductoScreen({ route, navigation }) {
  const { producto: productoParam, productoId } = route.params;
  const [producto, setProducto] = useState(productoParam || null);
  const [loading, setLoading] = useState(!productoParam);
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    if (!productoParam && productoId) {
      cargarProducto();
    }
  }, [productoId]);

  const cargarProducto = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/productos/${productoId}`);
      setProducto(response.data);
    } catch (error) {
      console.error('Error al cargar producto:', error);
      Alert.alert(
        'Error',
        'No se pudo cargar el producto. Por favor intenta de nuevo.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const agregarAlCarrito = () => {
    if (cantidad > producto.disponibles) {
      Alert.alert(
        'Stock insuficiente',
        `Solo hay ${producto.disponibles} unidades disponibles de este producto.`
      );
      return;
    }

    Alert.alert(
      'Éxito',
      `${cantidad} ${cantidad === 1 ? 'unidad' : 'unidades'} de ${producto.name} agregadas al carrito`,
      [
        {
          text: 'Continuar comprando',
          onPress: () => navigation.goBack(),
        },
        {
          text: 'Ir al carrito',
          onPress: () => navigation.navigate('Carrito'),
          style: 'default',
        },
      ]
    );
  };

  const aumentarCantidad = () => {
    if (cantidad < producto.disponibles) {
      setCantidad(cantidad + 1);
    } else {
      Alert.alert(
        'Stock máximo',
        `Solo hay ${producto.disponibles} unidades disponibles.`
      );
    }
  };

  const disminuirCantidad = () => {
    if (cantidad > 1) {
      setCantidad(cantidad - 1);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Cargando producto...</Text>
      </View>
    );
  }

  if (!producto) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={64} color="#999" />
        <Text style={styles.errorText}>Producto no encontrado</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Volver
        </Button>
      </View>
    );
  }

  const precioTotal = (producto.precio * cantidad).toFixed(2);

  return (
    <ScrollView style={styles.container}>
      {/* Imagen grande del producto */}
      <Card style={styles.imagenCard}>
        <View style={styles.imagenContainer}>
          <Text style={styles.imagenGrande}>{producto.imagen}</Text>
        </View>
      </Card>

      {/* Información del producto */}
      <View style={styles.infoSection}>
        <Text style={styles.nombre}>{producto.name}</Text>

        <View style={styles.ratingRow}>
          <View style={styles.ratingContainer}>
            <MaterialCommunityIcons name="star" size={18} color="#FFD700" />
            <Text style={styles.rating}>{producto.calificacion}</Text>
            <Text style={styles.reviews}>(120 reseñas)</Text>
          </View>
          <Text style={styles.disponibles}>
            {producto.disponibles} disponibles
          </Text>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.productorContainer}>
          <MaterialCommunityIcons name="account-circle" size={24} color="#4A90E2" />
          <View style={styles.productorInfo}>
            <Text style={styles.productorLabel}>Vendido por</Text>
            <Text style={styles.productorNombre}>{producto.productor}</Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Precio y cantidad */}
        <View style={styles.precioSection}>
          <View>
            <Text style={styles.precioLabel}>Precio unitario</Text>
            <Text style={styles.precio}>${(parseFloat(producto.precio) || 0).toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.cantidadLabel}>Cantidad</Text>
        <View style={styles.cantidadSelector}>
          <TouchableOpacity
            style={styles.btnCantidad}
            onPress={disminuirCantidad}
          >
            <MaterialCommunityIcons name="minus" size={20} color="#4A90E2" />
          </TouchableOpacity>
          <Text style={styles.cantidadTexto}>{cantidad}</Text>
          <TouchableOpacity
            style={styles.btnCantidad}
            onPress={aumentarCantidad}
            disabled={cantidad >= producto.disponibles}
          >
            <MaterialCommunityIcons
              name="plus"
              size={20}
              color={cantidad >= producto.disponibles ? '#ccc' : '#4A90E2'}
            />
          </TouchableOpacity>
        </View>

        <Divider style={styles.divider} />

        {/* Resumen de compra */}
        <View style={styles.resumenContainer}>
          <View style={styles.resumenRow}>
            <Text style={styles.resumenLabel}>Subtotal:</Text>
            <Text style={styles.resumenValor}>
              ${(producto.precio * cantidad).toFixed(2)}
            </Text>
          </View>
          <View style={styles.resumenRow}>
            <Text style={styles.resumenLabel}>Envío:</Text>
            <Text style={styles.resumenValor}>$0.00</Text>
          </View>
          <Divider />
          <View style={[styles.resumenRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValor}>${precioTotal}</Text>
          </View>
        </View>

        {/* Descripción */}
        <View style={styles.descripcionSection}>
          <Text style={styles.descripcionTitulo}>Descripción del producto</Text>
          <Text style={styles.descripcionTexto}>
            Producto de alta calidad, cultivado de forma natural y sin químicos
            dañinos. Perfecto para una alimentación saludable y sostenible.
            Entrega rápida a tu domicilio.
          </Text>
        </View>

        <View style={styles.caracteristicasSection}>
          <Text style={styles.caracteristicasTitulo}>Características</Text>
          <View style={styles.caracteristica}>
            <MaterialCommunityIcons name="leaf" size={16} color="#4CAF50" />
            <Text style={styles.caracteristicaTexto}>100% Orgánico</Text>
          </View>
          <View style={styles.caracteristica}>
            <MaterialCommunityIcons name="truck-fast" size={16} color="#FF9800" />
            <Text style={styles.caracteristicaTexto}>
              Entrega rápida
            </Text>
          </View>
          <View style={styles.caracteristica}>
            <MaterialCommunityIcons name="shield-check" size={16} color="#2196F3" />
            <Text style={styles.caracteristicaTexto}>
              Garantía de calidad
            </Text>
          </View>
        </View>
      </View>

      {/* Botones de acción */}
      <View style={styles.actionButtons}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.btnContinuar}
        >
          Volver
        </Button>
        <Button
          mode="contained"
          onPress={agregarAlCarrito}
          style={styles.btnAgregar}
          labelStyle={styles.btnAgregarLabel}
        >
          Agregar al carrito
        </Button>
      </View>
    </ScrollView>
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
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  imagenCard: {
    margin: 12,
    elevation: 2,
  },
  imagenContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  imagenGrande: {
    fontSize: 120,
  },
  infoSection: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 8,
    padding: 16,
  },
  nombre: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  reviews: {
    marginLeft: 4,
    fontSize: 12,
    color: '#999',
  },
  disponibles: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 12,
  },
  productorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  productorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  productorLabel: {
    fontSize: 11,
    color: '#999',
  },
  productorNombre: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  precioSection: {
    marginVertical: 8,
  },
  precioLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  precio: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  cantidadLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 12,
  },
  cantidadSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignSelf: 'flex-start',
  },
  btnCantidad: {
    padding: 12,
  },
  cantidadTexto: {
    marginHorizontal: 16,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 40,
    textAlign: 'center',
  },
  resumenContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
  },
  resumenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  resumenLabel: {
    fontSize: 12,
    color: '#666',
  },
  resumenValor: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  totalRow: {
    paddingVertical: 10,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  descripcionSection: {
    marginTop: 16,
  },
  descripcionTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  descripcionTexto: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  caracteristicasSection: {
    marginTop: 16,
  },
  caracteristicasTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  caracteristica: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  caracteristicaTexto: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 8,
  },
  btnContinuar: {
    flex: 1,
    borderColor: '#4A90E2',
  },
  btnAgregar: {
    flex: 1,
    backgroundColor: '#4A90E2',
  },
  btnAgregarLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
