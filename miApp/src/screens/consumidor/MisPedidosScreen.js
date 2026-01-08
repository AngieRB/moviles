import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Card, Text, Chip, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function MisPedidosScreen({ navigation }) {
  const [pedidos] = useState([
    {
      id: 'PED-001',
      fecha: '2024-01-03',
      estado: 'Entregado',
      total: 15.80,
      items: 3,
      productos: 'Tomates, Lechuga, Zanahoria',
      color: '#4CAF50',
      icono: 'check-circle',
    },
    {
      id: 'PED-002',
      fecha: '2024-01-02',
      estado: 'En camino',
      total: 28.50,
      items: 5,
      productos: 'Manzanas, Plátanos, Zanahorias...',
      color: '#FF9800',
      icono: 'truck-fast',
    },
    {
      id: 'PED-003',
      fecha: '2024-01-01',
      estado: 'Confirmado',
      total: 12.30,
      items: 2,
      productos: 'Lechuga, Tomates',
      color: '#2196F3',
      icono: 'clock-outline',
    },
    {
      id: 'PED-004',
      fecha: '2023-12-31',
      estado: 'Entregado',
      total: 45.75,
      items: 8,
      productos: 'Varios productos de granja',
      color: '#4CAF50',
      icono: 'check-circle',
    },
    {
      id: 'PED-005',
      fecha: '2023-12-29',
      estado: 'Entregado',
      total: 19.99,
      items: 4,
      productos: 'Frutas y vegetales',
      color: '#4CAF50',
      icono: 'check-circle',
    },
  ]);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Entregado':
        return '#4CAF50';
      case 'En camino':
        return '#FF9800';
      case 'Confirmado':
        return '#2196F3';
      case 'Cancelado':
        return '#E74C3C';
      default:
        return '#999';
    }
  };

  const getEstadoIcono = (estado) => {
    switch (estado) {
      case 'Entregado':
        return 'check-circle';
      case 'En camino':
        return 'truck-fast';
      case 'Confirmado':
        return 'clock-outline';
      case 'Cancelado':
        return 'close-circle';
      default:
        return 'package';
    }
  };

  const formatearFecha = (fecha) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(fecha).toLocaleDateString('es-ES', options);
  };

  const renderPedido = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('DetallePedido', { pedido: item })
      }
    >
      <Card style={styles.pedidoCard}>
        <View style={styles.pedidoHeader}>
          <View style={styles.pedidoNumero}>
            <Text style={styles.numeroTexto}>{item.id}</Text>
            <Text style={styles.fechaTexto}>{formatearFecha(item.fecha)}</Text>
          </View>
          <Chip
            style={[
              styles.estadoChip,
              { backgroundColor: getEstadoColor(item.estado) },
            ]}
            textStyle={styles.estadoTexto}
            icon={getEstadoIcono(item.estado)}
          >
            {item.estado}
          </Chip>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.pedidoContent}>
          <View style={styles.productosInfo}>
            <MaterialCommunityIcons name="package-multiple" size={20} color="#4A90E2" />
            <View style={styles.productosTexto}>
              <Text style={styles.productosLabel}>
                {item.items} artículos
              </Text>
              <Text style={styles.productosDetalle} numberOfLines={1}>
                {item.productos}
              </Text>
            </View>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.pedidoFooter}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValor}>${item.total.toFixed(2)}</Text>
          <Icon
            name="chevron-right"
            size={20}
            color="#4A90E2"
            style={styles.iconoFlecha}
          />
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {pedidos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="package-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>Sin pedidos</Text>
          <Text style={styles.emptyText}>Aún no has realizado pedidos</Text>
        </View>
      ) : (
        <FlatList
          data={pedidos}
          renderItem={renderPedido}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
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
  listContainer: {
    padding: 12,
    paddingBottom: 20,
  },
  pedidoCard: {
    marginBottom: 12,
    elevation: 2,
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  pedidoNumero: {
    flex: 1,
  },
  numeroTexto: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  fechaTexto: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  estadoChip: {
    paddingHorizontal: 8,
  },
  estadoTexto: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 0,
  },
  pedidoContent: {
    padding: 12,
  },
  productosInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productosTexto: {
    marginLeft: 12,
    flex: 1,
  },
  productosLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  productosDetalle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  pedidoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
  },
  totalValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  iconoFlecha: {
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});
