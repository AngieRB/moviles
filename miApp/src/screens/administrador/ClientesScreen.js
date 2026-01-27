import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Alert, Platform, Linking } from 'react-native';
import { Card, Text, Button, Chip, Searchbar, ActivityIndicator, Portal, Dialog, Divider, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../../services/apiClient';

export default function ClientesScreen() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [procesando, setProcesando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      cargarClientes();
    }, [])
  );

  const cargarClientes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/usuarios?role=consumidor');
      const data = response.data.usuarios || response.data || [];
      setClientes(data);
    } catch (error) {
      console.error('Error cargando clientes:', error);
      mostrarAlerta('Error', 'No se pudieron cargar los clientes');
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
    cargarClientes();
  };

  const abrirDialogoEliminar = (cliente) => {
    setSelectedCliente(cliente);
    setDialogVisible(true);
  };

  const eliminarCliente = async () => {
    if (!selectedCliente) return;
    
    setProcesando(true);
    try {
      await apiClient.delete(`/usuarios/${selectedCliente.id}`);
      mostrarAlerta('Éxito', 'Cliente eliminado correctamente');
      cargarClientes();
    } catch (error) {
      console.error('Error:', error);
      mostrarAlerta('Error', error.response?.data?.message || 'No se pudo eliminar el cliente');
    } finally {
      setProcesando(false);
      setDialogVisible(false);
      setSelectedCliente(null);
    }
  };

  const clientesFiltrados = clientes.filter(c => {
    const matchSearch = c.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       c.apellido?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });



  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Cargando clientes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sticky Search Bar */}
      <View style={styles.stickyHeader}>
        <Searchbar
          placeholder="Buscar cliente..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          elevation={1}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4A90E2']} />
        }
      >
        {clientesFiltrados.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="account-off" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No hay clientes registrados</Text>
          </View>
        ) : (
          clientesFiltrados.map((cliente) => (
            <Card key={cliente.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.avatarContainer}>
                    {cliente.foto_perfil ? (
                      <Avatar.Image
                        size={50}
                        source={{ uri: `http://192.168.10.243:8000/storage/${cliente.foto_perfil}` }}
                      />
                    ) : (
                      <Avatar.Icon
                        size={50}
                        icon="account-circle"
                        style={{ backgroundColor: '#4A90E2' }}
                      />
                    )}
                  </View>
                  <View style={styles.infoContainer}>
                    <Text style={styles.nombre}>{cliente.nombre} {cliente.apellido}</Text>
                    <Text style={styles.email}>{cliente.email}</Text>
                    <Text style={styles.telefono}>📞 {cliente.telefono}</Text>
                  </View>
                  <Chip
                    style={styles.rolChip}
                    textStyle={{ color: '#1565C0', fontSize: 11 }}
                  >
                    Consumidor
                  </Chip>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.detalles}>
                  <Text style={styles.detalleItem}>
                    <Text style={styles.detalleLabel}>Cédula: </Text>
                    {cliente.cedula || 'N/A'}
                  </Text>
                  {cliente.role_data?.direccion && (
                    <Text style={styles.detalleItem}>
                      <Text style={styles.detalleLabel}>Dirección: </Text>
                      {cliente.role_data.direccion}
                    </Text>
                  )}
                  <Text style={styles.detalleItem}>
                    <Text style={styles.detalleLabel}>Registrado: </Text>
                    {new Date(cliente.created_at).toLocaleDateString('es-ES')}
                  </Text>
                </View>

                {/* Botones de acción */}
                <View style={styles.botonesContainer}>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      Alert.alert(
                        'Bloquear Cliente',
                        `¿Deseas bloquear a ${cliente.nombre}?`,
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          {
                            text: 'Bloquear',
                            style: 'destructive',
                            onPress: () => {
                              // Aquí puedes implementar la lógica de bloqueo
                              mostrarAlerta('Info', 'Función de bloqueo - Por implementar con el endpoint de bloqueo');
                            }
                          }
                        ]
                      );
                    }}
                    icon="account-lock"
                    textColor="#FF5722"
                    style={styles.btn}
                    compact
                  >
                    Bloquear
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => abrirDialogoEliminar(cliente)}
                    icon="delete"
                    textColor="#F44336"
                    style={styles.btn}
                    compact
                  >
                    Eliminar
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Diálogo de confirmación */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Eliminar Cliente</Dialog.Title>
          <Dialog.Content>
            <Text>¿Estás seguro de eliminar al cliente "{selectedCliente?.nombre} {selectedCliente?.apellido}"? Esta acción no se puede deshacer.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancelar</Button>
            <Button
              onPress={eliminarCliente}
              loading={procesando}
              textColor="#F44336"
            >
              Eliminar
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
    paddingBottom: 4,
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
    backgroundColor: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1565C0',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
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
    marginBottom: 12,
    elevation: 2,
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
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
  rolChip: {
    height: 28,
    backgroundColor: '#E3F2FD',
    alignSelf: 'flex-start',
  },
  divider: {
    marginVertical: 12,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  btn: {
    borderRadius: 8,
    flex: 1,
  },
});
