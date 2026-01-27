import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
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

export default function ReportsManagementScreen() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [respuestaAdmin, setRespuestaAdmin] = useState('');
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [modalBloqueo, setModalBloqueo] = useState(false);
  const [motivoBloqueo, setMotivoBloqueo] = useState('');
  const [tipoBloqueo, setTipoBloqueo] = useState('permanente');
  const [diasBloqueo, setDiasBloqueo] = useState('30');

  const fetchReportes = async () => {
    try {
      const params = filtroEstado ? `?estado=${filtroEstado}` : '';
      const response = await apiClient.get(`/reportes${params}`);
      setReportes(response.data.data || response.data);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportes();
  }, [filtroEstado]);

  const actualizarEstado = async () => {
    try {
      await apiClient.put(`/reportes/${reporteSeleccionado.id}/estado`, {
        estado: nuevoEstado,
        respuesta_admin: respuestaAdmin
      });
      Alert.alert('Éxito', 'Estado actualizado');
      setModalVisible(false);
      fetchReportes();
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudo actualizar');
    }
  };

  const bloquearUsuario = async () => {
    if (!motivoBloqueo.trim()) {
      Alert.alert('Error', 'Debes especificar el motivo del bloqueo');
      return;
    }

    try {
      await apiClient.post(`/usuarios/${reporteSeleccionado.reportado_id}/bloqueo`, {
        bloquear: true,
        tipo_bloqueo: tipoBloqueo,
        motivo_bloqueo: motivoBloqueo,
        dias_bloqueo: tipoBloqueo === 'temporal' ? parseInt(diasBloqueo) : undefined
      });

      const mensaje = tipoBloqueo === 'permanente'
        ? 'Usuario bloqueado permanentemente'
        : `Usuario bloqueado por ${diasBloqueo} días`;

      Alert.alert('Éxito', mensaje);
      setModalBloqueo(false);
      setMotivoBloqueo('');
      fetchReportes();
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudo bloquear al usuario');
    }
  };

  const renderReporte = ({ item }) => {
    const estadoConfig = ESTADO_CONFIG[item.estado];
    const fecha = new Date(item.created_at).toLocaleDateString('es-ES');

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          setReporteSeleccionado(item);
          setNuevoEstado(item.estado);
          setRespuestaAdmin(item.respuesta_admin || '');
          setModalVisible(true);
        }}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: estadoConfig.color + '20' }]}>
            <Icon name={estadoConfig.icon} size={14} color={estadoConfig.color} />
            <Text style={[styles.badgeText, { color: estadoConfig.color }]}>
              {estadoConfig.label}
            </Text>
          </View>
          <Text style={styles.fecha}>{fecha}</Text>
        </View>

        <Text style={styles.motivo}>{MOTIVO_LABELS[item.motivo]}</Text>
        <Text style={styles.descripcion} numberOfLines={2}>{item.descripcion}</Text>

        <View style={styles.usuarios}>
          <Text style={styles.usuarioInfo}>
            <Icon name="account" size={14} /> {item.reportador?.name} (reporta)
          </Text>
          {item.reportado && (
            <Text style={styles.usuarioInfo}>
              <Icon name="account-alert" size={14} /> {item.reportado.name} (reportado)
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F5A623" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sticky Filter Header */}
      <View style={styles.stickyHeader}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtros}>
          <TouchableOpacity
            style={[styles.filtroBtn, !filtroEstado && styles.filtroActivo]}
            onPress={() => setFiltroEstado('')}
          >
            <Text style={[styles.filtroText, !filtroEstado && styles.filtroTextoActivo]}>Todos</Text>
          </TouchableOpacity>
          {Object.keys(ESTADO_CONFIG).map((estado) => (
            <TouchableOpacity
              key={estado}
              style={[styles.filtroBtn, filtroEstado === estado && styles.filtroActivo]}
              onPress={() => setFiltroEstado(estado)}
            >
              <Text style={[styles.filtroText, filtroEstado === estado && styles.filtroTextoActivo]}>
                {ESTADO_CONFIG[estado].label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={reportes}
        renderItem={renderReporte}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal de gestión de reporte */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Gestionar Reporte</Text>
            
            <Text style={styles.label}>Estado:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.estadoSelector}>
              {Object.keys(ESTADO_CONFIG).map((estado) => (
                <TouchableOpacity
                  key={estado}
                  style={[
                    styles.estadoBtn,
                    nuevoEstado === estado && { backgroundColor: ESTADO_CONFIG[estado].color }
                  ]}
                  onPress={() => setNuevoEstado(estado)}
                >
                  <Text style={[styles.estadoBtnText, nuevoEstado === estado && { color: '#fff' }]}>
                    {ESTADO_CONFIG[estado].label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Respuesta Admin:</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Escribe una respuesta..."
              value={respuestaAdmin}
              onChangeText={setRespuestaAdmin}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnSecondaryText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary]}
                onPress={actualizarEstado}
              >
                <Text style={styles.btnPrimaryText}>Guardar</Text>
              </TouchableOpacity>
            </View>

            {reporteSeleccionado?.reportado && (
              <TouchableOpacity
                style={styles.btnBloquear}
                onPress={() => {
                  setModalVisible(false);
                  setTimeout(() => setModalBloqueo(true), 300);
                }}
              >
                <Icon name="account-lock" size={20} color="#fff" />
                <Text style={styles.btnBloquearText}>Bloquear Usuario</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de bloqueo */}
      <Modal
        visible={modalBloqueo}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalBloqueo(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Bloquear Usuario</Text>
            
            <Text style={styles.label}>Tipo de Bloqueo:</Text>
            <View style={styles.tipoBloqueoContainer}>
              <TouchableOpacity
                style={[styles.tipoBtn, tipoBloqueo === 'temporal' && styles.tipoBtnActivo]}
                onPress={() => setTipoBloqueo('temporal')}
              >
                <Text style={[styles.tipoBtnText, tipoBloqueo === 'temporal' && styles.tipoBtnTextoActivo]}>
                  Temporal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tipoBtn, tipoBloqueo === 'permanente' && styles.tipoBtnActivo]}
                onPress={() => setTipoBloqueo('permanente')}
              >
                <Text style={[styles.tipoBtnText, tipoBloqueo === 'permanente' && styles.tipoBtnTextoActivo]}>
                  Permanente
                </Text>
              </TouchableOpacity>
            </View>

            {tipoBloqueo === 'temporal' && (
              <>
                <Text style={styles.label}>Días de Bloqueo:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="30"
                  value={diasBloqueo}
                  onChangeText={setDiasBloqueo}
                  keyboardType="number-pad"
                />
              </>
            )}

            <Text style={styles.label}>Motivo:</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe el motivo del bloqueo..."
              value={motivoBloqueo}
              onChangeText={setMotivoBloqueo}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary]}
                onPress={() => setModalBloqueo(false)}
              >
                <Text style={styles.btnSecondaryText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.btn, styles.btnDanger]}
                onPress={bloquearUsuario}
              >
                <Text style={styles.btnDangerText}>Bloquear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  stickyHeader: {
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filtros: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    maxHeight: 60,
  },
  filtroBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    minHeight: 32,
  },
  filtroActivo: {
    backgroundColor: '#F5A623',
  },
  filtroText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filtroTextoActivo: {
    color: '#fff',
  },
  list: {
    padding: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  fecha: {
    fontSize: 10,
    color: '#999',
  },
  motivo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  descripcion: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  usuarios: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  usuarioInfo: {
    fontSize: 10,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  estadoSelector: {
    marginBottom: 12,
  },
  estadoBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  estadoBtnText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  btn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnSecondary: {
    backgroundColor: '#f0f0f0',
  },
  btnSecondaryText: {
    color: '#666',
    fontWeight: '600',
  },
  btnPrimary: {
    backgroundColor: '#4CAF50',
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '600',
  },
  btnDanger: {
    backgroundColor: '#FF3B30',
  },
  btnDangerText: {
    color: '#fff',
    fontWeight: '600',
  },
  btnBloquear: {
    flexDirection: 'row',
    backgroundColor: '#FF3B30',
    padding: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  btnBloquearText: {
    color: '#fff',
    fontWeight: '600',
  },
  tipoBloqueoContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  tipoBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  tipoBtnActivo: {
    backgroundColor: '#FF3B30',
  },
  tipoBtnText: {
    color: '#666',
    fontWeight: '600',
  },
  tipoBtnTextoActivo: {
    color: '#fff',
  },
});
