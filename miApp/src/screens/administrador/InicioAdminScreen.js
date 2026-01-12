import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Dimensions } from 'react-native';
import { Card, Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import apiClient from '../../services/apiClient';

const { width } = Dimensions.get('window');

export default function InicioAdminScreen() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    totalProductores: 0,
    totalConsumidores: 0,
    totalProductos: 0,
    totalPedidos: 0,
    pedidosPendientes: 0,
    pedidosCompletados: 0,
    ventasTotales: 0,
  });

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      
      let productoresCount = 0;
      let consumidoresCount = 0;
      let productosCount = 0;
      let totalPedidos = 0;
      let pedidosPendientes = 0;
      let pedidosCompletados = 0;
      let ventasTotales = 0;
      
      // Cargar usuarios
      try {
        const resUsuarios = await apiClient.get('/usuarios');
        console.log('Usuarios API response:', resUsuarios.data);
        const usuarios = resUsuarios.data.usuarios || resUsuarios.data || [];
        
        productoresCount = usuarios.filter(u => u.role === 'productor').length;
        consumidoresCount = usuarios.filter(u => u.role === 'consumidor').length;
        console.log('Productores:', productoresCount, 'Consumidores:', consumidoresCount);
      } catch (e) {
        console.log('Error cargando usuarios:', e.response?.status, e.response?.data || e.message);
      }
      
      // Cargar productos
      try {
        const resProductos = await apiClient.get('/productos');
        const productos = resProductos.data.productos || resProductos.data || [];
        productosCount = Array.isArray(productos) ? productos.length : 0;
        console.log('Productos:', productosCount);
      } catch (e) {
        console.log('Error cargando productos:', e.response?.status, e.message);
      }
      
      // Cargar estadísticas de pedidos
      try {
        const resEstadisticas = await apiClient.get('/admin/estadisticas');
        console.log('Estadísticas API response:', resEstadisticas.data);
        const stats = resEstadisticas.data.estadisticas || resEstadisticas.data || {};
        totalPedidos = stats.totalPedidos || 0;
        pedidosPendientes = stats.pedidosPendientes || 0;
        pedidosCompletados = stats.pedidosCompletados || 0;
        ventasTotales = stats.ventasTotales || 0;
      } catch (e) {
        console.log('Error estadísticas:', e.response?.status, e.response?.data || e.message);
        // Intentar con pedidos directamente
        try {
          const resPedidos = await apiClient.get('/admin/pedidos');
          console.log('Pedidos API response:', resPedidos.data);
          const pedidos = resPedidos.data.pedidos || [];
          totalPedidos = pedidos.length;
          pedidosPendientes = pedidos.filter(p => ['pendiente', 'procesando'].includes(p.estado)).length;
          pedidosCompletados = pedidos.filter(p => p.estado === 'entregado').length;
          ventasTotales = pedidos.reduce((sum, p) => sum + parseFloat(p.total || 0), 0);
        } catch (e2) {
          console.log('Error cargando pedidos:', e2.response?.status, e2.message);
        }
      }
      
      console.log('Estado final:', {
        productoresCount, consumidoresCount, productosCount, 
        totalPedidos, pedidosPendientes, pedidosCompletados, ventasTotales
      });
      
      setEstadisticas({
        totalProductores: productoresCount,
        totalConsumidores: consumidoresCount,
        totalProductos: productosCount,
        totalPedidos: totalPedidos,
        pedidosPendientes: pedidosPendientes,
        pedidosCompletados: pedidosCompletados,
        ventasTotales: ventasTotales,
      });
      
    } catch (error) {
      console.error('Error general al cargar estadísticas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarEstadisticas();
  };

  const StatCard = ({ icon, title, value, color, subtitle }) => (
    <Card style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <Card.Content style={styles.statContent}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Icon name={icon} size={28} color={color} />
        </View>
        <View style={styles.statInfo}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
      </Card.Content>
    </Card>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F5A623" />
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      // AQUI ESTA EL CAMBIO IMPORTANTE: AGREGAR PADDING AL FINAL DEL SCROLL
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F5A623']} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Icon name="view-dashboard" size={32} color="#F5A623" />
        <Text style={styles.headerTitle}>Panel de Administración</Text>
      </View>

      {/* Estadísticas de Usuarios */}
      <Text style={styles.sectionTitle}>👥 Usuarios</Text>
      <View style={styles.statsRow}>
        <StatCard
          icon="account-group"
          title="Productores"
          value={estadisticas.totalProductores}
          color="#6B9B37"
          subtitle="Registrados"
        />
        <StatCard
          icon="cart"
          title="Consumidores"
          value={estadisticas.totalConsumidores}
          color="#4A90E2"
          subtitle="Activos"
        />
      </View>

      {/* Estadísticas de Productos */}
      <Text style={styles.sectionTitle}>📦 Inventario</Text>
      <View style={styles.statsRow}>
        <StatCard
          icon="package-variant"
          title="Productos"
          value={estadisticas.totalProductos}
          color="#9B59B6"
          subtitle="En catálogo"
        />
        <StatCard
          icon="currency-usd"
          title="Ventas Totales"
          value={`$${estadisticas.ventasTotales.toFixed(2)}`}
          color="#27AE60"
          subtitle="Acumulado"
        />
      </View>

      {/* Estadísticas de Pedidos */}
      <Text style={styles.sectionTitle}>📋 Pedidos</Text>
      <View style={styles.statsRow}>
        <StatCard
          icon="clipboard-list"
          title="Total Pedidos"
          value={estadisticas.totalPedidos}
          color="#E67E22"
        />
        <StatCard
          icon="clock-outline"
          title="Pendientes"
          value={estadisticas.pedidosPendientes}
          color="#E74C3C"
        />
      </View>
      <View style={styles.statsRow}>
        <StatCard
          icon="check-circle"
          title="Completados"
          value={estadisticas.pedidosCompletados}
          color="#2ECC71"
        />
      </View>

      {/* Resumen */}
      <Card style={styles.resumenCard}>
        <Card.Content>
          <View style={styles.resumenHeader}>
            <Icon name="chart-line" size={24} color="#F5A623" />
            <Text style={styles.resumenTitle}>Resumen del Sistema</Text>
          </View>
          <View style={styles.resumenItem}>
            <Text style={styles.resumenLabel}>Total de usuarios registrados:</Text>
            <Text style={styles.resumenValue}>
              {estadisticas.totalProductores + estadisticas.totalConsumidores}
            </Text>
          </View>
          <View style={styles.resumenItem}>
            <Text style={styles.resumenLabel}>Tasa de pedidos completados:</Text>
            <Text style={styles.resumenValue}>
              {estadisticas.totalPedidos > 0 
                ? `${((estadisticas.pedidosCompletados / estadisticas.totalPedidos) * 100).toFixed(1)}%`
                : 'N/A'}
            </Text>
          </View>
        </Card.Content>
      </Card>
      
      {/* Espacio extra al final para asegurar visibilidad */}
      <View style={{ height: 50 }} />
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
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
    color: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 2,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statSubtitle: {
    fontSize: 11,
    color: '#999',
  },
  resumenCard: {
    margin: 15,
    borderRadius: 12,
    elevation: 2,
  },
  resumenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  resumenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  resumenItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resumenLabel: {
    fontSize: 14,
    color: '#666',
  },
  resumenValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});