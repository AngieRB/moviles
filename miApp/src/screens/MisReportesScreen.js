import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  Button,
  Searchbar,
  ActivityIndicator,
  useTheme,
  Badge,
  Divider
} from 'react-native-paper';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import apiClient from '../services/apiClient';

const MisReportesScreen = ({ navigation }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reportes, setReportes] = useState([]);
  const [filtro, setFiltro] = useState('todos'); // todos, pendiente, en_revision, resuelto, rechazado

  useEffect(() => {
    cargarReportes();
  }, []);

  const cargarReportes = async () => {
    try {
      const response = await apiClient.get('/mis-reportes');
      setReportes(response.data);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
      Alert.alert('Error', 'No se pudieron cargar los reportes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarReportes();
  };

  // Filtrar reportes
  const reportesFiltrados = reportes.filter(reporte => {
    if (filtro === 'todos') return true;
    return reporte.estado === filtro;
  });

  // Obtener color según estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return '#FFA726';
      case 'en_revision':
        return '#42A5F5';
      case 'resuelto':
        return '#66BB6A';
      case 'rechazado':
        return '#EF5350';
      default:
        return '#757575';
    }
  };

  // Obtener texto del motivo
  const getMotivoTexto = (motivo) => {
    const motivos = {
      'producto_defectuoso': 'Producto defectuoso',
      'cobro_indebido': 'Cobro indebido',
      'incumplimiento_entrega': 'Incumplimiento de entrega',
      'producto_diferente': 'Producto diferente',
      'comportamiento_inadecuado': 'Comportamiento inadecuado',
      'fraude_proveedor': 'Fraude del proveedor',
      'pedido_fraudulento': 'Pedido fraudulento',
      'pago_no_realizado': 'Pago no realizado',
      'devolucion_injustificada': 'Devolución injustificada',
      'abuso_consumidor': 'Abuso del consumidor',
      'informacion_falsa': 'Información falsa',
      'otro': 'Otro'
    };
    return motivos[motivo] || motivo;
  };

  // Ver detalle del reporte
  const verDetalle = (reporte) => {
    // TODO: Implementar pantalla de detalle de reporte
    Alert.alert(
      'Detalle del Reporte',
      `Reporte #${reporte.id}\nEstado: ${reporte.estado}\nMotivo: ${getMotivoTexto(reporte.motivo)}\n\nDescripción:\n${reporte.descripcion}${reporte.respuesta_admin ? `\n\nRespuesta del administrador:\n${reporte.respuesta_admin}` : ''}`,
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Cargando reportes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filtros sticky */}
      <View style={[styles.stickyHeader, { backgroundColor: theme.colors.background }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtrosContainer}
        >
          <Chip
            selected={filtro === 'todos'}
            onPress={() => setFiltro('todos')}
            style={[
              styles.filtroChip,
              filtro === 'todos' && { backgroundColor: theme.colors.primary }
            ]}
            textStyle={filtro === 'todos' && { color: '#fff' }}
          >
            Todos ({reportes.length})
          </Chip>
          <Chip
            selected={filtro === 'pendiente'}
            onPress={() => setFiltro('pendiente')}
            style={[
              styles.filtroChip,
              filtro === 'pendiente' && { backgroundColor: '#FFA726' }
            ]}
            textStyle={filtro === 'pendiente' && { color: '#fff' }}
          >
            Pendientes ({reportes.filter(r => r.estado === 'pendiente').length})
          </Chip>
          <Chip
            selected={filtro === 'en_revision'}
            onPress={() => setFiltro('en_revision')}
            style={[
              styles.filtroChip,
              filtro === 'en_revision' && { backgroundColor: '#42A5F5' }
            ]}
            textStyle={filtro === 'en_revision' && { color: '#fff' }}
          >
            En revisión ({reportes.filter(r => r.estado === 'en_revision').length})
          </Chip>
          <Chip
            selected={filtro === 'resuelto'}
            onPress={() => setFiltro('resuelto')}
            style={[
              styles.filtroChip,
              filtro === 'resuelto' && { backgroundColor: '#66BB6A' }
            ]}
            textStyle={filtro === 'resuelto' && { color: '#fff' }}
          >
            Resueltos ({reportes.filter(r => r.estado === 'resuelto').length})
          </Chip>
          <Chip
            selected={filtro === 'rechazado'}
            onPress={() => setFiltro('rechazado')}
            style={[
              styles.filtroChip,
              filtro === 'rechazado' && { backgroundColor: '#EF5350' }
            ]}
            textStyle={filtro === 'rechazado' && { color: '#fff' }}
          >
            Rechazados ({reportes.filter(r => r.estado === 'rechazado').length})
          </Chip>
        </ScrollView>
      </View>

      {/* Lista de reportes */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {reportesFiltrados.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text variant="titleMedium" style={styles.emptyText}>
              {filtro === 'todos'
                ? 'No tienes reportes'
                : `No tienes reportes ${filtro.replace('_', ' ')}`}
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Productos')}
              style={styles.emptyButton}
            >
              Ir a productos
            </Button>
          </View>
        ) : (
          reportesFiltrados.map((reporte) => (
            <Card key={reporte.id} style={styles.card} onPress={() => verDetalle(reporte)}>
              <Card.Content>
                {/* Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.headerLeft}>
                    <Text variant="titleMedium" style={styles.cardTitle}>
                      {getMotivoTexto(reporte.motivo)}
                    </Text>
                    <Text variant="bodySmall" style={styles.fecha}>
                      {format(new Date(reporte.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                    </Text>
                  </View>
                  <Badge
                    size={24}
                    style={[
                      styles.estadoBadge,
                      { backgroundColor: getEstadoColor(reporte.estado) }
                    ]}
                  >
                    {reporte.estado === 'en_revision' ? 'En revisión' : reporte.estado}
                  </Badge>
                </View>

                <Divider style={styles.divider} />

                {/* Información del reportado */}
                <View style={styles.infoRow}>
                  <Text variant="bodySmall" style={styles.label}>
                    {reporte.tipo_reportado === 'producto' ? 'Producto:' : 
                     reporte.tipo_reportado === 'pedido' ? 'Pedido:' : 'Reportado:'}
                  </Text>
                  <Text variant="bodyMedium" style={styles.value}>
                    {reporte.tipo_reportado === 'producto' && reporte.producto ? 
                      reporte.producto.nombre :
                     reporte.tipo_reportado === 'pedido' && reporte.pedido ?
                      `Pedido #${reporte.pedido.id}` :
                     reporte.reportado ?
                      `${reporte.reportado.nombre} ${reporte.reportado.apellido || ''}`.trim() :
                      'No especificado'
                    }
                  </Text>
                </View>

                {/* Tipo */}
                <View style={styles.infoRow}>
                  <Text variant="bodySmall" style={styles.label}>Tipo:</Text>
                  <Chip compact style={styles.tipoChip}>
                    {reporte.tipo_reportado}
                  </Chip>
                </View>

                {/* Descripción (preview) */}
                <Text variant="bodySmall" numberOfLines={2} style={styles.descripcion}>
                  {reporte.descripcion}
                </Text>

                {/* Evidencias */}
                {reporte.evidencias && reporte.evidencias.length > 0 && (
                  <View style={styles.evidenciasContainer}>
                    <Text variant="bodySmall" style={styles.evidenciasText}>
                      📎 {reporte.evidencias.length} evidencia(s)
                    </Text>
                  </View>
                )}

                {/* Respuesta admin si existe */}
                {reporte.respuesta_admin && (
                  <View style={styles.respuestaContainer}>
                    <Text variant="bodySmall" style={styles.respuestaLabel}>
                      Respuesta del administrador:
                    </Text>
                    <Text variant="bodySmall" style={styles.respuestaTexto}>
                      {reporte.respuesta_admin}
                    </Text>
                  </View>
                )}
              </Card.Content>

              <Card.Actions>
                <Button mode="text" onPress={() => verDetalle(reporte)}>
                  Ver detalles
                </Button>
              </Card.Actions>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Botón flotante para crear nuevo reporte */}
      <Button
        mode="contained"
        icon="alert-circle"
        onPress={() => navigation.navigate('CrearReporte')}
        style={styles.fab}
        contentStyle={styles.fabContent}
      >
        Nuevo reporte
      </Button>
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
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000
  },
  filtrosContainer: {
    paddingHorizontal: 16,
    gap: 8
  },
  filtroChip: {
    marginRight: 8
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80
  },
  card: {
    marginBottom: 16,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  headerLeft: {
    flex: 1
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 4
  },
  fecha: {
    color: '#666'
  },
  estadoBadge: {
    marginLeft: 8
  },
  divider: {
    marginVertical: 12
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  label: {
    color: '#666',
    marginRight: 8,
    minWidth: 80
  },
  value: {
    fontWeight: '500',
    flex: 1
  },
  tipoChip: {
    height: 28,
    paddingHorizontal: 8
  },
  descripcion: {
    color: '#333',
    marginTop: 8,
    marginBottom: 8
  },
  evidenciasContainer: {
    marginTop: 8
  },
  evidenciasText: {
    color: '#666',
    fontStyle: 'italic'
  },
  respuestaContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3'
  },
  respuestaLabel: {
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4
  },
  respuestaTexto: {
    color: '#333'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64
  },
  emptyText: {
    color: '#666',
    marginBottom: 24,
    textAlign: 'center'
  },
  emptyButton: {
    marginTop: 8
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    elevation: 4
  },
  fabContent: {
    paddingVertical: 8
  }
});

export default MisReportesScreen;
