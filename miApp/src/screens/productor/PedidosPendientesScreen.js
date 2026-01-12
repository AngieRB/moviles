import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { API_URL } from '../../services/apiClient';
import axios from 'axios';

export default function PedidosPendientesScreen() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accionando, setAccionando] = useState(false);

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${API_URL}/pedidos-pendientes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPedidos(res.data.pedidos);
    } catch (err) {
      Alert.alert('Error', 'No se pudieron cargar los pedidos pendientes');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const actualizarEstado = async (id, estado) => {
    setAccionando(true);
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(`${API_URL}/pedidos/${id}/estado`, { estado }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPedidos();
      Alert.alert(
        'Pedido ' + (estado === 'procesando' ? 'aceptado' : 'rechazado'),
        `El cliente será notificado que su pedido fue ${estado === 'procesando' ? 'aceptado' : 'rechazado'}.`
      );
    } catch (err) {
      Alert.alert('Error', 'No se pudo actualizar el estado del pedido');
    }
    setAccionando(false);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#6B9B37" /></View>;
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={pedidos.length === 0 && styles.center}>
      <Text style={styles.title}>Pedidos Pendientes</Text>
      {pedidos.length === 0 ? (
        <Text style={styles.noPedidos}>No hay pedidos pendientes</Text>
      ) : (
        pedidos.map((pedido) => (
          <View key={pedido.id} style={styles.card}>
            <View style={styles.headerCard}>
              <Text style={styles.nuevoPedido}>Nuevo Pedido #{pedido.id}</Text>
            </View>
            <Text style={styles.label}><Text style={styles.bold}>Cliente:</Text> {pedido.cliente}</Text>
            <Text style={styles.label}><Text style={styles.bold}>Items:</Text> {pedido.items?.map(i => `${i.cantidad} ${i.producto}`).join(', ') || 'Sin items'}</Text>
            <Text style={styles.label}><Text style={styles.bold}>Total:</Text> ${parseFloat(pedido.total || 0).toFixed(2)}</Text>
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.btn, styles.aceptar]}
                disabled={accionando}
                onPress={() => actualizarEstado(pedido.id, 'procesando')}
              >
                <Text style={styles.btnText}>Aceptar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.rechazar]}
                disabled={accionando}
                onPress={() => actualizarEstado(pedido.id, 'cancelado')}
              >
                <Text style={styles.btnText}>Rechazar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

import AsyncStorage from '@react-native-async-storage/async-storage';

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B9B37',
    marginBottom: 16,
    alignSelf: 'center',
  },
  noPedidos: {
    fontSize: 18,
    color: '#888',
    alignSelf: 'center',
    marginTop: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerCard: {
    backgroundColor: '#4CAF50',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 6,
    marginBottom: 8,
  },
  nuevoPedido: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  btn: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  aceptar: {
    backgroundColor: '#4CAF50',
  },
  rechazar: {
    backgroundColor: '#F44336',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});