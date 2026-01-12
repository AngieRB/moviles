import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Dimensions } from 'react-native';
import { Card, Text, useTheme, ActivityIndicator, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import apiClient from '../../services/apiClient';

const { width } = Dimensions.get('window');

export default function InicioProductorScreen() {
  const { user } = useApp();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    totalClientes: 0,
    totalProductos: 0,
    ventasTotales: 0,
    totalPedidos: 0,
    pedidosPendientes: 0,
    pedidosCompletados: 0,
    pedidosCancelados: 0,
  });

  useFocusEffect(
    React.useCallback(() => {
      cargarEstadisticas();
    }, [])
  );

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      
      // Cargar mis productos
      let productosCount = 0;
      try {
        const resProductos = await apiClient.get('/mis-productos');
        const productos = resProductos.data.productos || [];
        productosCount = productos.length;
      } catch (e) {
        console.log('Error cargando productos:', e);
      }
      
      // Cargar pedidos del productor (todos los pedidos, no solo pendientes)
      let pedidosPendientes = 0;
      let pedidosCompletados = 0;
      let pedidosCancelados = 0;
      let totalPedidos = 0;
      let ventasTotales = 0;
      let clientesUnicos = new Set();
      
      try {
        const resPedidos = await apiClient.get('/mis-pedidos-productor');
        const pedidos = resPedidos.data.pedidos || [];
        console.log('Pedidos del productor:', pedidos);
        
        pedidos.forEach(p => {
          totalPedidos++;
          ventasTotales += parseFloat(p.total || 0);
          
          // Agregar cliente único por ID
          if (p.cliente_id) {
            clientesUnicos.add(p.cliente_id);
          }
          
          // Contar por estado
          const estado = (p.estado || '').toLowerCase();
          if (estado === 'pendiente' || estado === 'procesando') {
            pedidosPendientes++;
          } else if (estado === 'entregado') {
            pedidosCompletados++;
          } else if (estado === 'cancelado') {
            pedidosCancelados++;
          }
        });
        
        console.log('Clientes únicos:', clientesUnicos.size);
      } catch (e) {
        console.log('Error cargando pedidos:', e.response?.data || e.message);
      }
      
      setEstadisticas({
        totalClientes: clientesUnicos.size,
        totalProductos: productosCount,
        ventasTotales: ventasTotales,
        totalPedidos: totalPedidos,
        pedidosPendientes: pedidosPendientes,
        pedidosCompletados: pedidosCompletados,
        pedidosCancelados: pedidosCancelados,
      });
      
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
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

  // Calcular porcentajes para barras
  const maxPedidos = Math.max(estadisticas.totalPedidos, 1);
  const porcentajePendientes = estadisticas.pedidosPendientes / maxPedidos;
  const porcentajeCompletados = estadisticas.pedidosCompletados / maxPedidos;
  const porcentajeCancelados = estadisticas.pedidosCancelados / maxPedidos;

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B9B37" />
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6B9B37']} />
      }
    >
      {/* Header de bienvenida */}
      <Card style={styles.welcomeCard}>
        <Card.Content style={styles.welcomeContent}>
          <Icon name="leaf" size={40} color="#6B9B37" />
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>¡Hola, {user?.nombre || user?.name || 'Productor'}!</Text>
            <Text style={styles.welcomeSubtitle}>Bienvenido a tu panel de control</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Estadísticas de Clientes */}
      <Text style={styles.sectionTitle}>👥 Mis Clientes</Text>
      <View style={styles.statsRow}>
        <StatCard
          icon="account-group"
          title="Clientes"
          value={estadisticas.totalClientes}
          color="#4A90E2"
          subtitle="Han comprado"
        />
      </View>

      {/* Estadísticas de Inventario */}
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
        <StatCard
          icon="close-circle"
          title="Cancelados"
          value={estadisticas.pedidosCancelados}
          color="#95A5A6"
        />
      </View>

      {/* Gráfico de barras de resumen */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <View style={styles.chartHeader}>
            <Icon name="chart-bar" size={24} color="#6B9B37" />
            <Text style={styles.chartTitle}>Resumen de Pedidos</Text>
          </View>
          
          {/* Barra de Pendientes */}
          <View style={styles.barContainer}>
            <View style={styles.barLabelRow}>
              <Text style={styles.barLabel}>Pendientes</Text>
              <Text style={styles.barValue}>{estadisticas.pedidosPendientes}</Text>
            </View>
            <View style={styles.barBackground}>
              <View style={[styles.bar, { width: `${porcentajePendientes * 100}%`, backgroundColor: '#E74C3C' }]} />
            </View>
          </View>

          {/* Barra de Completados */}
          <View style={styles.barContainer}>
            <View style={styles.barLabelRow}>
              <Text style={styles.barLabel}>Completados</Text>
              <Text style={styles.barValue}>{estadisticas.pedidosCompletados}</Text>
            </View>
            <View style={styles.barBackground}>
              <View style={[styles.bar, { width: `${porcentajeCompletados * 100}%`, backgroundColor: '#2ECC71' }]} />
            </View>
          </View>

          {/* Barra de Cancelados */}
          <View style={styles.barContainer}>
            <View style={styles.barLabelRow}>
              <Text style={styles.barLabel}>Cancelados</Text>
              <Text style={styles.barValue}>{estadisticas.pedidosCancelados}</Text>
            </View>
            <View style={styles.barBackground}>
              <View style={[styles.bar, { width: `${porcentajeCancelados * 100}%`, backgroundColor: '#95A5A6' }]} />
            </View>
          </View>

          {/* Resumen */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>
              Tasa de éxito: {estadisticas.totalPedidos > 0 
                ? `${((estadisticas.pedidosCompletados / estadisticas.totalPedidos) * 100).toFixed(1)}%`
                : 'N/A'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <View style={{ height: 30 }} />
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
  welcomeCard: {
    margin: 15,
    borderRadius: 12,
    elevation: 3,
    backgroundColor: '#fff',
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  welcomeText: {
    marginLeft: 15,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
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
  chartCard: {
    margin: 15,
    borderRadius: 12,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  barContainer: {
    marginBottom: 15,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  barLabel: {
    fontSize: 14,
    color: '#666',
  },
  barValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  barBackground: {
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 10,
    minWidth: 5,
  },
  summaryRow: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B9B37',
  },
});
