import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Card, Text, Chip, Divider } from 'react-native-paper';
import { MaterialCommunityIcons, MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import apiClient from '../../services/apiClient';

export default function MisPedidosScreen({ navigation }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/mis-pedidos');
      const pedidosData = response.data.pedidos || response.data || [];
      
      console.log('Pedidos recibidos:', pedidosData);
      
      // Formatear los pedidos para mostrar
      const pedidosFormateados = pedidosData.map(pedido => ({
        id: `PED-${String(pedido.id).padStart(3, '0')}`,
        idReal: pedido.id,
        fecha: pedido.fecha || pedido.created_at,
        estado: pedido.estado || 'Pendiente',
        total: parseFloat(pedido.total) || 0,
        items: pedido.items?.length || 0,
        productos: pedido.items?.map(i => i.producto).join(', ') || 'Productos',
      }));
      
      setPedidos(pedidosFormateados);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

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
      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.emptyText}>Cargando pedidos...</Text>
        </View>
      ) : pedidos.length === 0 ? (
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
