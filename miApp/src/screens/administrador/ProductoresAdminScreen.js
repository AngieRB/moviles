import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Alert, Platform, Linking } from 'react-native';
import { Card, Text, Button, Chip, Searchbar, ActivityIndicator, Portal, Dialog, Divider, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import apiClient from '../../services/apiClient';
import { useApp } from '../../context/AppContext';

export default function ProductoresAdminScreen() {
  const navigation = useNavigation();
  const { logout } = useApp();
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
      
      // Auto-refresh cada 10 segundos para ver nuevos productores
      const interval = setInterval(() => {
        cargarProductoresSilencioso();
      }, 10000);
      
      return () => clearInterval(interval);
    }, [])
  );

  const cargarProductores = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/usuarios?role=productor', { timeout: 8000 });
      const data = response.data.usuarios || response.data || [];
      setProductores(data);
    } catch (error) {
      // Si es error 401, cerrar sesión automáticamente
      if (error.response?.status === 401) {
        mostrarAlerta('Sesión expirada', 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        await logout();
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        return;
      }
      
      // Para otros errores
      if (error.code !== 'ECONNABORTED') {
        console.log('Error cargando productores');
        mostrarAlerta('Error', 'No se pudieron cargar los productores. Verifica tu conexión.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cargar productores sin mostrar loading (para auto-refresh)
  const cargarProductoresSilencioso = async () => {
    try {
      const response = await apiClient.get('/usuarios?role=productor', { timeout: 5000 });
      const data = response.data.usuarios || response.data || [];
      setProductores(data);
    } catch (error) {
      // Silencioso - no mostrar errores en auto-refresh
      if (error.code !== 'ECONNABORTED') {
        console.log('Error en auto-refresh (no crítico)');
      }
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
      {/* Sticky Header con Search y Filtros */}
      <View style={styles.stickyHeader}>
        <Searchbar
          placeholder="Buscar productor..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          elevation={1}
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
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }} 
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
                    {productor.foto_perfil ? (
                      <Avatar.Image
                        size={50}
                        source={{ uri: `http://192.168.10.243:8000/storage/${productor.foto_perfil}` }}
                      />
                    ) : (
                      <Avatar.Icon
                        size={50}
                        icon="account-circle"
                        style={{ backgroundColor: productor.verificado ? '#4CAF50' : '#FF9800' }}
                      />
                    )}
                    {productor.verificado && (
                      <View style={styles.verificadoBadge}>
                        <Icon name="check-decagram" size={16} color="#4CAF50" />
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
                      { backgroundColor: productor.verificado ? '#4CAF50' : '#FF9800' }
                    ]}
                    textStyle={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}
                    icon={productor.verificado ? "check-circle" : "clock-outline"}
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
                        loading={procesando}
                        compact
                      >
                        Aprobar
                      </Button>
                      <Button
                        mode="outlined"
                        onPress={() => abrirDialogo(productor, 'eliminar')}
                        style={styles.btn}
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
                      style={styles.btn}
                      textColor="#FF9800"
                      icon="close"                      compact                    >
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
  stickyHeader: {
    backgroundColor: '#f5f5f5',
    paddingBottom: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000,
  },
  searchbar: {
    margin: 12,
    marginBottom: 8,
    elevation: 1,
    backgroundColor: 'white',
  },
  filtrosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  chip: {
    backgroundColor: '#e0e0e0',
  },
  chipActivo: {
    backgroundColor: '#F5A623',
  },
  chipVerificado: {
    backgroundColor: '#4CAF50',
  },
  chipPendiente: {
    backgroundColor: '#FF9800',
  },
  chipTextoActivo: {
    color: 'white',
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
    marginHorizontal: 12,
    marginBottom: 16, // Más separación entre tarjetas
    borderRadius: 12,
    elevation: 3,
    backgroundColor: 'white',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  avatarContainer: {
    marginRight: 10,
  },
  verificadoBadge: {
    position: 'absolute',
    bottom: 0, 
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 4,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 13,
    color: '#666',
  },
  telefono: {
    fontSize: 12,
    color: '#888',
  },
  finca: {
    fontSize: 12,
    color: '#6B9B37',
    fontWeight: '500',
    marginTop: 2,
  },
  estadoChip: {
    height: 32,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
  },
  divider: {
    marginVertical: 10,
  },
  detalles: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  detalleItem: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
  },
  detalleLabel: {
    fontWeight: 'bold',
    color: '#444',
  },
  // --- ESTILOS DE BOTONES CORREGIDOS ---
  botonesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Separa los botones a los extremos
    gap: 10, // Espacio entre botones
  },
  btn: {
    flex: 1, // HACE QUE LOS BOTONES TENGAN EL MISMO TAMAÑO
    borderRadius: 8,
    marginHorizontal: 0, // Quitamos margenes extraños
  },
});