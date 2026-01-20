import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import apiClient from '../../services/apiClient';

const ESTADO_CONFIG = {
  pendiente: { color: '#FFA500', icon: 'clock-outline', label: 'Pendiente' },
  en_revision: { color: '#4A90E2', icon: 'eye', label: 'En Revisión' },
  resuelto: { color: '#4CAF50', icon: 'check-circle', label: 'Resuelto' },
  rechazado: { color: '#FF3B30', icon: 'close-circle', label: 'Rechazado' }
};

const MOTIVO_LABELS = {
  contenido_inapropiado: 'Contenido Inapropiado',
  fraude: 'Fraude',
  producto_falso: 'Producto Falso',
  mala_calidad: 'Mala Calidad',
  no_entregado: 'No Entregado',
  comportamiento_abusivo: 'Comportamiento Abusivo',
  spam: 'Spam',
  otro: 'Otro'
};

export default function MisReportesScreen({ navigation }) {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReportes = async () => {
    try {
      const response = await apiClient.get('/mis-reportes');
      setReportes(response.data);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReportes();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReportes();
  }, []);

  const renderReporte = ({ item }) => {
    const estadoConfig = ESTADO_CONFIG[item.estado];
    const fecha = new Date(item.created_at).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    return (
      <TouchableOpacity
        style={styles.reporteCard}
        onPress={() => navigation.navigate('DetalleReporte', { reporteId: item.id })}
      >
        <View style={styles.reporteHeader}>
          <View style={[styles.estadoBadge, { backgroundColor: estadoConfig.color + '20' }]}>
            <Icon name={estadoConfig.icon} size={16} color={estadoConfig.color} />
            <Text style={[styles.estadoText, { color: estadoConfig.color }]}>
              {estadoConfig.label}
            </Text>
          </View>
          <Text style={styles.fecha}>{fecha}</Text>
        </View>

        <Text style={styles.motivo}>{MOTIVO_LABELS[item.motivo]}</Text>
        <Text style={styles.descripcion} numberOfLines={2}>
          {item.descripcion}
        </Text>

        {item.reportado && (
          <Text style={styles.reportadoInfo}>
            <Icon name="account" size={14} color="#666" /> Reportado: {item.reportado.name}
          </Text>
        )}

        {item.producto && (
          <Text style={styles.reportadoInfo}>
            <Icon name="package-variant" size={14} color="#666" /> Producto: {item.producto.nombre}
          </Text>
        )}

        {item.respuesta_admin && (
          <View style={styles.respuestaContainer}>
            <Icon name="message-reply" size={14} color="#4A90E2" />
            <Text style={styles.respuestaText} numberOfLines={1}>
              {item.respuesta_admin}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Cargando reportes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reportes}
        renderItem={renderReporte}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="clipboard-text-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No has creado reportes aún</Text>
            <Text style={styles.emptySubtext}>
              Puedes reportar contenido inapropiado, fraudes o problemas con productos
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Report', { tipo_reportado: 'usuario' })}
      >
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>
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
    color: '#666',
  },
  list: {
    padding: 16,
  },
  reporteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reporteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '600',
  },
  fecha: {
    fontSize: 12,
    color: '#999',
  },
  motivo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  descripcion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  reportadoInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  respuestaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    gap: 6,
  },
  respuestaText: {
    flex: 1,
    fontSize: 12,
    color: '#4A90E2',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});
