import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Card, Text, Button, Divider, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCarrito } from '../../context/CarritoContext';

export default function CarritoScreen({ navigation }) {
  const {
    items,
    loading,
    subtotal,
    envio,
    total,
    actualizarCantidad,
    eliminarDelCarrito,
  } = useCarrito();

  const confirmarEliminar = (id, nombre) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`¿Deseas eliminar ${nombre} del carrito?`)) {
        eliminarDelCarrito(id);
      }
    } else {
      Alert.alert(
        'Eliminar producto',
        `¿Deseas eliminar ${nombre} del carrito?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            onPress: () => eliminarDelCarrito(id),
            style: 'destructive',
          },
        ]
      );
    }
  };

  const handleActualizarCantidad = (id, nuevaCantidad, nombre) => {
    if (nuevaCantidad < 1) {
      confirmarEliminar(id, nombre);
      return;
    }
    actualizarCantidad(id, nuevaCantidad);
  };

  const renderItem = ({ item }) => (
    <Card style={styles.itemCard}>
      <View style={styles.itemContent}>
        <Text style={styles.imagenProducto}>{item.imagen || '🛒'}</Text>

        <View style={styles.itemInfo}>
          <Text style={styles.itemNombre} numberOfLines={2}>
            {item.nombre}
          </Text>
          <Text style={styles.itemProductor}>{item.productor}</Text>
          <Text style={styles.itemPrecio}>${(parseFloat(item.precio) || 0).toFixed(2)} c/u</Text>
        </View>

        <View style={styles.itemControles}>
          <View style={styles.cantidadControl}>
            <TouchableOpacity
              onPress={() => handleActualizarCantidad(item.id, item.cantidad - 1, item.nombre)}
            >
              <MaterialCommunityIcons name="minus-circle" size={20} color="#4A90E2" />
            </TouchableOpacity>
            <Text style={styles.cantidadTexto}>{item.cantidad}</Text>
            <TouchableOpacity
              onPress={() => handleActualizarCantidad(item.id, item.cantidad + 1, item.nombre)}
            >
              <MaterialCommunityIcons name="plus-circle" size={20} color="#4A90E2" />
            </TouchableOpacity>
          </View>

          <View style={styles.itemTotal}>
            <Text style={styles.itemTotalTexto}>
              ${((parseFloat(item.precio) || 0) * item.cantidad).toFixed(2)}
            </Text>
            <TouchableOpacity
              onPress={() => confirmarEliminar(item.id, item.nombre)}
              style={styles.btnEliminar}
            >
              <MaterialCommunityIcons name="trash-can" size={18} color="#E74C3C" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Cargando carrito...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="cart-off" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
          <Text style={styles.emptyText}>
            Agrega productos desde el catálogo para comenzar a comprar
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('ProductosTab')}
            style={styles.btnIrComprar}
            icon="shopping"
          >
            Ver productos
          </Button>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
          />

          {/* Resumen de compra */}
          <View style={styles.resumenCard}>
            <Text style={styles.resumenTitulo}>Resumen de compra</Text>

            <View style={styles.resumenRow}>
              <Text style={styles.resumenLabel}>
                Productos ({items.length}):
              </Text>
              <Text style={styles.resumenValor}>
                ${subtotal.toFixed(2)}
              </Text>
            </View>

            <View style={styles.resumenRow}>
              <Text style={styles.resumenLabel}>Envío:</Text>
              <Text
                style={[
                  styles.resumenValor,
                  envio === 0 && styles.resumenGratis,
                ]}
              >
                {envio === 0 ? '¡Gratis!' : `$${envio.toFixed(2)}`}
              </Text>
            </View>

            {envio > 0 && (
              <Text style={styles.advertencia}>
                📦 Envío gratis en compras mayores a $20.00
              </Text>
            )}

            <Divider style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total a pagar:</Text>
              <Text style={styles.totalValor}>${total.toFixed(2)}</Text>
            </View>

            <View style={styles.buttonsContainer}>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('ProductosTab')}
                style={styles.btnContinuar}
              >
                Continuar comprando
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  navigation.navigate('Pago', {
                    total: total,
                    items: items.map(item => ({
                      id: item.id,
                      producto_id: item.producto_id || item.id,
                      nombre: item.nombre,
                      cantidad: item.cantidad,
                      precio: item.precio,
                    })),
                    direccionEnvio: '',
                  });
                }}
                style={styles.btnPagar}
                labelStyle={styles.btnPagarLabel}
                icon="credit-card"
              >
                Proceder al pago
              </Button>
            </View>
          </View>
        </>
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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  listContainer: {
    padding: 12,
    paddingBottom: 20,
  },
  itemCard: {
    marginBottom: 12,
    elevation: 2,
    borderRadius: 12,
  },
  itemContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  imagenProducto: {
    fontSize: 40,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemNombre: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  itemProductor: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  itemPrecio: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
    marginTop: 4,
  },
  itemControles: {
    marginLeft: 8,
  },
  cantidadControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cantidadTexto: {
    marginHorizontal: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 30,
    textAlign: 'center',
  },
  itemTotal: {
    alignItems: 'center',
  },
  itemTotalTexto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 4,
  },
  btnEliminar: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
  },
  btnIrComprar: {
    marginTop: 16,
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
  },
  resumenCard: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
  },
  resumenTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  resumenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  resumenLabel: {
    fontSize: 13,
    color: '#666',
  },
  resumenValor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  resumenGratis: {
    color: '#4CAF50',
  },
  advertencia: {
    fontSize: 11,
    color: '#FF9800',
    marginTop: 8,
    fontStyle: 'italic',
  },
  divider: {
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  buttonsContainer: {
    marginTop: 16,
    gap: 10,
  },
  btnContinuar: {
    borderColor: '#4A90E2',
  },
  btnPagar: {
    backgroundColor: '#27AE60',
  },
  btnPagarLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
