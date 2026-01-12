import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Alert, Platform, Linking } from 'react-native';
import { Card, Text, Button, Chip, Searchbar, ActivityIndicator, Portal, Dialog, Divider } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../../services/apiClient';

export default function ProductoresAdminScreen() {
  const [productores, setProductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtro, setFiltro] = useState('todos'); // todos, verificados, pendientes
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedProductor, setSelectedProductor] = useState(null);
  const [actionType, setActionType] = useState(''); // verificar, rechazar, eliminar
  const [procesando, setProcesando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      cargarProductores();
    }, [])
  );

  const cargarProductores = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/usuarios?role=productor');
      const data = response.data.usuarios || response.data || [];
      setProductores(data);
    } catch (error) {
      console.error('Error cargando productores:', error);
      mostrarAlerta('Error', 'No se pudieron cargar los productores');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const mostrarAlerta = (titulo, mensaje) => {
    if (Platform.OS === 'web') {
      alert(`${titulo}: ${mensaje}`);
    } else {
      Alert.alert(titulo, mensaje);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarProductores();
  };

  const abrirDialogo = (productor, accion) => {
    setSelectedProductor(productor);
    setActionType(accion);
    setDialogVisible(true);
  };

  const ejecutarAccion = async () => {
    if (!selectedProductor) return;
    
    setProcesando(true);
    try {
      let endpoint = '';
      let method = 'put';
      
      switch (actionType) {
        case 'verificar':
          endpoint = `/usuarios/${selectedProductor.id}/verificar`;
          break;
        case 'rechazar':
          endpoint = `/usuarios/${selectedProductor.id}/rechazar`;
          break;
        case 'eliminar':
          endpoint = `/usuarios/${selectedProductor.id}`;
          method = 'delete';
          break;
      }

      if (method === 'put') {
        await apiClient.put(endpoint);
      } else {
        await apiClient.delete(endpoint);
      }

      mostrarAlerta('Éxito', `Productor ${actionType === 'eliminar' ? 'eliminado' : actionType === 'verificar' ? 'verificado' : 'rechazado'} correctamente`);
      cargarProductores();
    } catch (error) {
      console.error('Error:', error);
      mostrarAlerta('Error', error.response?.data?.message || 'No se pudo completar la acción');
    } finally {
      setProcesando(false);
      setDialogVisible(false);
      setSelectedProductor(null);
    }
  };

  // Función para enviar mensaje de aprobación por WhatsApp
  const enviarWhatsAppAprobacion = (productor) => {
    let telefono = productor.telefono || '';
    
    // Limpiar el número de teléfono (quitar espacios, guiones, etc.)
    telefono = telefono.replace(/[\s\-\(\)]/g, '');
    
    // Si no empieza con +, agregar código de país (Ecuador por defecto)
    if (!telefono.startsWith('+')) {
      // Si empieza con 0, quitarlo
      if (telefono.startsWith('0')) {
        telefono = telefono.substring(1);
      }
      telefono = '+593' + telefono;
    }
    
    // Mensaje de bienvenida y aprobación
    const mensaje = `Estimado/a ${productor.nombre} ${productor.apellido || ''},

Reciba un cordial saludo de parte del equipo de AgroConnect.

Nos complace informarle que su solicitud de registro como productor ha sido *APROBADA* ✅.

A partir de este momento, usted puede acceder a nuestra plataforma y comenzar a publicar sus productos para conectar directamente con consumidores interesados en productos agrícolas de calidad.

Le damos la más cordial bienvenida a la comunidad AgroConnect 🌾.

Si tiene alguna consulta, no dude en contactarnos.

Atentamente,
*Equipo AgroConnect*`;
    
    // Codificar el mensaje para URL
    const mensajeCodificado = encodeURIComponent(mensaje);
    
    // Crear URL de WhatsApp
    const url = `https://wa.me/${telefono}?text=${mensajeCodificado}`;
    
    // Abrir WhatsApp
    Linking.openURL(url).catch(err => {
      console.error('Error abriendo WhatsApp:', err);
      mostrarAlerta('Error', 'No se pudo abrir WhatsApp');
    });
  };

  // Verificar y enviar mensaje de aprobación
  const verificarYNotificar = async (productor) => {
    setProcesando(true);
    try {
      await apiClient.put(`/usuarios/${productor.id}/verificar`);
      
      // Enviar mensaje de aprobación por WhatsApp automáticamente
      enviarWhatsAppAprobacion(productor);
      
      mostrarAlerta('Éxito', 'Productor verificado. Se abrirá WhatsApp para enviar el mensaje de bienvenida.');
      cargarProductores();
    } catch (error) {
      console.error('Error:', error);
      mostrarAlerta('Error', error.response?.data?.message || 'No se pudo verificar');
    } finally {
      setProcesando(false);
    }
  };

  const productoresFiltrados = productores.filter(p => {
    // Filtro por búsqueda
    const matchSearch = p.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       p.role_data?.nombreFinca?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro por estado
    let matchFiltro = true;
    if (filtro === 'verificados') matchFiltro = p.verificado === true;
    if (filtro === 'pendientes') matchFiltro = p.verificado === false;
    
    return matchSearch && matchFiltro;
  });

  const getDialogContent = () => {
    switch (actionType) {
      case 'verificar':
        return {
          titulo: 'Verificar Productor',
          mensaje: `¿Deseas verificar al productor "${selectedProductor?.nombre}"? Esto le permitirá vender productos en la plataforma.`,
          btnColor: '#4CAF50',
          btnText: 'Verificar',
        };
      case 'rechazar':
        return {
          titulo: 'Rechazar/Desverificar Productor',
          mensaje: `¿Deseas rechazar o quitar la verificación al productor "${selectedProductor?.nombre}"?`,
          btnColor: '#FF9800',
          btnText: 'Rechazar',
        };
      case 'eliminar':
        return {
          titulo: 'Eliminar Productor',
          mensaje: `¿Estás seguro de eliminar al productor "${selectedProductor?.nombre}"? Esta acción no se puede deshacer.`,
          btnColor: '#F44336',
          btnText: 'Eliminar',
        };
      default:
        return { titulo: '', mensaje: '', btnColor: '#666', btnText: '' };
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F5A623" />
        <Text style={styles.loadingText}>Cargando productores...</Text>
      </View>
    );
  }

  const dialogContent = getDialogContent();

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <Searchbar
        placeholder="Buscar productor..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      {/* Chips de filtro */}
      <View style={styles.filtrosContainer}>
        <Chip
          selected={filtro === 'todos'}
          onPress={() => setFiltro('todos')}
          style={[styles.chip, filtro === 'todos' && styles.chipActivo]}
          textStyle={filtro === 'todos' ? styles.chipTextoActivo : {}}
        >
          Todos ({productores.length})
        </Chip>
        <Chip
          selected={filtro === 'verificados'}
          onPress={() => setFiltro('verificados')}
          style={[styles.chip, filtro === 'verificados' && styles.chipVerificado]}
          textStyle={filtro === 'verificados' ? styles.chipTextoActivo : {}}
        >
          ✅ Verificados ({productores.filter(p => p.verificado).length})
        </Chip>
        <Chip
          selected={filtro === 'pendientes'}
          onPress={() => setFiltro('pendientes')}
          style={[styles.chip, filtro === 'pendientes' && styles.chipPendiente]}
          textStyle={filtro === 'pendientes' ? styles.chipTextoActivo : {}}
        >
          ⏳ Pendientes ({productores.filter(p => !p.verificado).length})
        </Chip>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F5A623']} />
        }
      >
        {productoresFiltrados.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="account-off" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No hay productores {filtro !== 'todos' ? filtro : ''}</Text>
          </View>
        ) : (
          productoresFiltrados.map((productor) => (
            <Card key={productor.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.avatarContainer}>
                    <Icon name="account-circle" size={50} color={productor.verificado ? '#4CAF50' : '#FF9800'} />
                    {productor.verificado && (
                      <View style={styles.verificadoBadge}>
                        <Icon name="check-circle" size={18} color="#4CAF50" />
                      </View>
                    )}
                  </View>
                  <View style={styles.infoContainer}>
                    <Text style={styles.nombre}>{productor.nombre} {productor.apellido}</Text>
                    <Text style={styles.email}>{productor.email}</Text>
                    <Text style={styles.telefono}>📞 {productor.telefono}</Text>
                    {productor.role_data?.nombreFinca && (
                      <Text style={styles.finca}>🏡 {productor.role_data.nombreFinca}</Text>
                    )}
                  </View>
                  <Chip
                    style={[
                      styles.estadoChip,
                      { backgroundColor: productor.verificado ? '#E8F5E9' : '#FFF3E0' }
                    ]}
                    textStyle={{ color: productor.verificado ? '#2E7D32' : '#E65100', fontSize: 11 }}
                  >
                    {productor.verificado ? 'Verificado' : 'Pendiente'}
                  </Chip>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.detalles}>
                  <Text style={styles.detalleItem}>
                    <Text style={styles.detalleLabel}>Cédula: </Text>
                    {productor.cedula || 'N/A'}
                  </Text>
                  {productor.role_data?.ubicacion && (
                    <Text style={styles.detalleItem}>
                      <Text style={styles.detalleLabel}>Ubicación: </Text>
                      {productor.role_data.ubicacion}
                    </Text>
                  )}
                  <Text style={styles.detalleItem}>
                    <Text style={styles.detalleLabel}>Registrado: </Text>
                    {new Date(productor.created_at).toLocaleDateString('es-ES')}
                  </Text>
                </View>

                <View style={styles.botonesContainer}>
                  {!productor.verificado ? (
                    <>
                      <Button
                        mode="contained"
                        onPress={() => verificarYNotificar(productor)}
                        style={[styles.btn, { backgroundColor: '#4CAF50' }]}
                        icon="check"
                        compact
                        loading={procesando}
                      >
                        Aprobar
                      </Button>
                      <Button
                        mode="outlined"
                        onPress={() => abrirDialogo(productor, 'eliminar')}
                        style={[styles.btn, { borderColor: '#F44336' }]}
                        textColor="#F44336"
                        icon="close"
                        compact
                      >
                        Rechazar
                      </Button>
                    </>
                  ) : (
                    <Button
                      mode="outlined"
                      onPress={() => abrirDialogo(productor, 'rechazar')}
                      style={[styles.btn, { borderColor: '#FF9800' }]}
                      textColor="#FF9800"
                      icon="close"
                      compact
                    >
                      Quitar Aprobación
                    </Button>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Diálogo de confirmación */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>{dialogContent.titulo}</Dialog.Title>
          <Dialog.Content>
            <Text>{dialogContent.mensaje}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancelar</Button>
            <Button
              onPress={ejecutarAccion}
              loading={procesando}
              textColor={dialogContent.btnColor}
            >
              {dialogContent.btnText}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    marginTop: 10,
    color: '#666',
  },
  searchbar: {
    margin: 12,
    elevation: 2,
  },
  filtrosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'flex-start',
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  chip: {
    backgroundColor: '#E0E0E0',
    height: 28,
    borderRadius: 14,
    marginRight: 6,
    paddingHorizontal: 10,
    paddingVertical: 0,
    minWidth: 70,
    elevation: 0,
  },
  chipActivo: {
    backgroundColor: '#F5A623',
    elevation: 2,
  },
  chipVerificado: {
    backgroundColor: '#4CAF50',
    elevation: 2,
  },
  chipPendiente: {
    backgroundColor: '#FF9800',
    elevation: 2,
  },
  chipTextoActivo: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  card: {
    marginHorizontal: 8,
    marginBottom: 12,
    borderRadius: 14,
    elevation: 2,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  avatarContainer: {
    position: 'relative',
  },
  verificadoBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    minWidth: 120,
    maxWidth: '70%',
  },
  nombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  telefono: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  finca: {
    fontSize: 12,
    color: '#6B9B37',
    marginTop: 2,
  },
  estadoChip: {
    height: 28,
  },
  divider: {
    marginVertical: 8,
  },
  detalles: {
    marginBottom: 12,
  },
  detalleItem: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
  },
  detalleLabel: {
    fontWeight: 'bold',
    color: '#333',
  },
  botonesContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  btn: {
    borderRadius: 8,
    minWidth: 80,
    height: 32,
    paddingVertical: 0,
    marginRight: 6,
  },
});
