import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { Card, Text, Divider, Button, ActivityIndicator, Portal, Dialog } from 'react-native-paper';
import { MaterialCommunityIcons, MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import apiClient from '../../services/apiClient';

export default function DetallePedidoScreen({ route, navigation }) {
  const { pedido: pedidoInicial } = route.params;
  const [pedido, setPedido] = useState(pedidoInicial);
  const [confirmando, setConfirmando] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [detalles, setDetalles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [direccion, setDireccion] = useState('N/A');
  const [telefono, setTelefono] = useState('N/A');

  // Cargar detalles completos del pedido
  React.useEffect(() => {
    cargarDetallesPedido();
  }, []);

  const cargarDetallesPedido = async () => {
    try {
      setCargando(true);
      const pedidoId = pedidoInicial.idReal || pedidoInicial.id;
      const response = await apiClient.get(`/pedidos/${pedidoId}`, { timeout: 8000 });
      const pedidoCompleto = response.data.pedido || response.data;
      
      console.log('Pedido completo:', pedidoCompleto);
      
      // Actualizar pedido con datos completos
      setPedido({
        ...pedidoInicial,
        ...pedidoCompleto,
      });
      
      // Extraer items/detalles
      const items = pedidoCompleto.items || pedidoCompleto.detalles || [];
      setDetalles(items);
      
      // Extraer dirección y teléfono del usuario
      if (pedidoCompleto.user || pedidoCompleto.consumidor) {
        const usuario = pedidoCompleto.user || pedidoCompleto.consumidor;
        setDireccion(usuario.role_data?.direccion || usuario.direccion || 'N/A');
        setTelefono(usuario.telefono || 'N/A');
      }
    } catch (error) {
      console.log('Error cargando detalles del pedido');
      // Si falla, usar datos del pedido inicial
      setDetalles([]);
    } finally {
      setCargando(false);
    }
  };

  const getEstadoColor = (estado) => {
    const estadoLower = estado?.toLowerCase();
    switch (estadoLower) {
      case 'entregado':
        return '#4CAF50';
      case 'enviado':
        return '#FF9800';
      case 'procesando':
        return '#2196F3';
      case 'pendiente':
        return '#9C27B0';
      case 'cancelado':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const getEstadoNormalizado = (estado) => {
    const estadoLower = estado?.toLowerCase();
    switch (estadoLower) {
      case 'entregado':
        return 'Entregado';
      case 'enviado':
        return 'Enviado';
      case 'procesando':
        return 'Procesando';
      case 'pendiente':
        return 'Pendiente';
      case 'cancelado':
        return 'Cancelado';
      default:
        return estado;
    }
  };

  const confirmarEntrega = async () => {
    if (Platform.OS === 'web') {
      // En web, usar el diálogo de React Native Paper
      setDialogVisible(true);
    } else {
      // En móvil, usar Alert nativo
      Alert.alert(
        'Confirmar Entrega',
        '¿Confirmas que has recibido tu pedido correctamente?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sí, lo recibí', onPress: ejecutarConfirmacion },
        ]
      );
    }
  };

  const ejecutarConfirmacion = async () => {
    setDialogVisible(false);
    setConfirmando(true);
    try {
      // Usar idReal si existe (ID numérico), sino usar id
      const pedidoId = pedido.idReal || pedido.id;
      console.log('Confirmando pedido ID:', pedidoId);
      const response = await apiClient.put(`/pedidos/${pedidoId}/confirmar-recepcion`);
      console.log('Respuesta:', response.data);
      setPedido({ ...pedido, estado: 'entregado' });
      if (Platform.OS === 'web') {
        alert('¡Gracias por confirmar la recepción de tu pedido!');
      } else {
        Alert.alert('¡Éxito!', 'Gracias por confirmar la recepción de tu pedido');
      }
    } catch (error) {
      console.error('Error al confirmar:', error.response?.data || error);
      const mensaje = error.response?.data?.message || 'No se pudo confirmar la entrega';
      if (Platform.OS === 'web') {
        alert('Error: ' + mensaje);
      } else {
        Alert.alert('Error', mensaje);
      }
    } finally {
      setConfirmando(false);
    }
  };

  const estadoActual = pedido.estado?.toLowerCase();
  
  const pasos = [
    { 
      titulo: 'Pedido Realizado', 
      completado: true, 
      fecha: pedido.fecha ? new Date(pedido.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : '-'
    },
    {
      titulo: 'Procesando',
      completado: ['procesando', 'enviado', 'entregado'].includes(estadoActual),
      fecha: '-',
    },
    {
      titulo: 'Enviado',
      completado: ['enviado', 'entregado'].includes(estadoActual),
      fecha: '-',
    },
    {
      titulo: 'Entregado',
      completado: estadoActual === 'entregado',
      fecha: estadoActual === 'entregado' ? 'Completado' : '-',
    },
  ];


  return (
    <ScrollView style={styles.container}>
      {/* Estado del pedido */}
      <Card style={styles.estadoCard}>
        <View style={styles.estadoContent}>
          <View>
            <Text style={styles.estadoLabel}>Estado actual</Text>
            <Text style={[styles.estadoValor, { color: getEstadoColor(pedido.estado) }]}>
              {getEstadoNormalizado(pedido.estado)}
            </Text>
          </View>
          <Icon
            name={
              estadoActual === 'entregado'
                ? 'check-circle'
                : estadoActual === 'enviado'
                  ? 'truck-fast'
                  : estadoActual === 'procesando'
                    ? 'clock-check'
                    : estadoActual === 'cancelado'
                      ? 'close-circle'
                      : 'clock-outline'
            }
            size={48}
            color={getEstadoColor(pedido.estado)}
          />
        </View>
      </Card>

      {/* Botón para confirmar entrega - solo si está enviado o procesando */}
      {['enviado', 'procesando'].includes(estadoActual) && (
        <Card style={styles.confirmarCard}>
          <View style={styles.confirmarContent}>
            <Icon name="package-variant-closed-check" size={32} color="#4CAF50" />
            <View style={styles.confirmarTexto}>
              <Text style={styles.confirmarTitulo}>¿Ya recibiste tu pedido?</Text>
              <Text style={styles.confirmarSubtitulo}>
                Confirma cuando hayas recibido tus productos
              </Text>
            </View>
          </View>
          <Button
            mode="contained"
            onPress={confirmarEntrega}
            loading={confirmando}
            disabled={confirmando}
            style={styles.btnConfirmar}
            icon="check"
          >
            Confirmar Recepción
          </Button>
        </Card>
      )}

      {/* Timeline de estados */}
      <Card style={styles.timelineCard}>
        <Text style={styles.timelineTitle}>Progreso del pedido</Text>
        <View style={styles.timelineContainer}>
          {pasos.map((paso, index) => (
            <View key={index} style={styles.pasoContainer}>
              <View
                style={[
                  styles.pasoCirculo,
                  paso.completado && styles.pasoCirculoCompleto,
                ]}
              >
                {paso.completado && (
                  <MaterialCommunityIcons name="check" size={16} color="#fff" />
                )}
              </View>
              <View style={styles.pasoTexto}>
                <Text style={styles.pasoTitulo}>{paso.titulo}</Text>
                <Text style={styles.pasoFecha}>{paso.fecha}</Text>
              </View>
              {index < pasos.length - 1 && (
                <View
                  style={[
                    styles.pasoLinea,
                    paso.completado && styles.pasoLineaCompleta,
                  ]}
                />
              )}
            </View>
          ))}
        </View>
      </Card>

      {/* Información del pedido */}
      <Card style={styles.infoCard}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="receipt" size={20} color="#4A90E2" />
          <View style={styles.infoTexto}>
            <Text style={styles.infoLabel}>Número de pedido</Text>
            <Text style={styles.infoValor}>{pedido.id}</Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="calendar" size={20} color="#4A90E2" />
          <View style={styles.infoTexto}>
            <Text style={styles.infoLabel}>Fecha del pedido</Text>
            <Text style={styles.infoValor}>
              {new Date(pedido.fecha).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="map-marker" size={20} color="#4A90E2" />
          <View style={styles.infoTexto}>
            <Text style={styles.infoLabel}>Dirección de entrega</Text>
            <Text style={styles.infoValor}>
              {direccion}
            </Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="phone" size={20} color="#4A90E2" />
          <View style={styles.infoTexto}>
            <Text style={styles.infoLabel}>Contacto</Text>
            <Text style={styles.infoValor}>{telefono}</Text>
          </View>
        </View>
      </Card>

      {/* Detalles de productos */}
      <Card style={styles.productosCard}>
        <Text style={styles.productosTitle}>Productos</Text>
        <Divider style={styles.divider} />

        {cargando ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#4A90E2" />
            <Text style={{ marginTop: 8, color: '#999' }}>Cargando detalles...</Text>
          </View>
        ) : detalles.length > 0 ? (
          detalles.map((item, index) => {
            const nombre = item.producto?.nombre || item.nombre || 'Producto';
            const cantidad = item.cantidad || 1;
            const precio = parseFloat(item.precio || item.producto?.precio || 0);
            const subtotal = cantidad * precio;
            
            return (
              <View key={item.id || index}>
                <View style={styles.productoRow}>
                  <View style={styles.productoInfo}>
                    <Text style={styles.productoNombre}>{nombre}</Text>
                    <Text style={styles.productoCantidad}>
                      {cantidad} x ${precio.toFixed(2)}
                    </Text>
                  </View>
                  <Text style={styles.productoSubtotal}>
                    ${subtotal.toFixed(2)}
                  </Text>
                </View>
                {index < detalles.length - 1 && (
                  <Divider style={styles.dividerProducto} />
                )}
              </View>
            );
          })
        ) : (
          <Text style={{ padding: 16, textAlign: 'center', color: '#999' }}>
            No hay productos en este pedido
          </Text>
        )}

        <Divider style={styles.divider} />

        <View style={styles.resumenRow}>
          <Text style={styles.resumenLabel}>Subtotal</Text>
          <Text style={styles.resumenValor}>
            ${detalles.reduce((sum, item) => {
              const cantidad = item.cantidad || 1;
              const precio = parseFloat(item.precio || item.producto?.precio || 0);
              return sum + (cantidad * precio);
            }, 0).toFixed(2)}
          </Text>
        </View>

        <View style={styles.resumenRow}>
          <Text style={styles.resumenLabel}>Envío</Text>
          <Text style={[styles.resumenValor, styles.resumenGratis]}>
            Gratis
          </Text>
        </View>

        <View style={styles.resumenRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValor}>
            ${(parseFloat(pedido.total) || 0).toFixed(2)}
          </Text>
        </View>
      </Card>

      {/* Botones de acción */}
      <View style={styles.actionContainer}>
        {pedido.estado !== 'Entregado' && (
          <Button
            mode="outlined"
            onPress={() => console.log('Rastrear pedido')}
            style={styles.btnAccion}
          >
            📍 Rastrear pedido
          </Button>
        )}

        <Button
          mode="outlined"
          onPress={() => Linking.openURL('mailto:soporte@agroconnect.com')}
          style={styles.btnAccion}
        >
          📧 Contactar soporte
        </Button>

        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.btnVolver}
        >
          Volver a pedidos
        </Button>
      </View>

      {/* Diálogo de confirmación para web */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Confirmar Entrega</Dialog.Title>
          <Dialog.Content>
            <Text>¿Confirmas que has recibido tu pedido correctamente?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancelar</Button>
            <Button onPress={ejecutarConfirmacion} loading={confirmando}>
              Sí, lo recibí
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  estadoCard: {
    margin: 12,
    padding: 16,
    elevation: 2,
    backgroundColor: '#fff',
  },
  estadoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  estadoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  estadoValor: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  timelineCard: {
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 16,
    elevation: 2,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  timelineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pasoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  pasoCirculo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  pasoCirculoCompleto: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  pasoTexto: {
    alignItems: 'center',
  },
  pasoTitulo: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  pasoFecha: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  pasoLinea: {
    position: 'absolute',
    top: 16,
    left: '50%',
    width: '100%',
    height: 2,
    backgroundColor: '#ddd',
    zIndex: -1,
  },
  pasoLineaCompleta: {
    backgroundColor: '#4CAF50',
  },
  infoCard: {
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 12,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  infoTexto: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
  },
  infoValor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  divider: {
    marginVertical: 0,
  },
  productosCard: {
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 12,
    elevation: 2,
  },
  productosTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  productoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  productoInfo: {
    flex: 1,
  },
  productoNombre: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  productoCantidad: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  productoSubtotal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  dividerProducto: {
    marginVertical: 0,
  },
  resumenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  resumenLabel: {
    fontSize: 12,
    color: '#666',
  },
  resumenValor: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  resumenGratis: {
    color: '#4CAF50',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  actionContainer: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 10,
  },
  btnAccion: {
    borderColor: '#4A90E2',
  },
  btnVolver: {
    backgroundColor: '#4A90E2',
    marginTop: 6,
  },
  confirmarCard: {
    margin: 12,
    marginTop: 0,
    padding: 16,
    elevation: 3,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  confirmarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmarTexto: {
    flex: 1,
    marginLeft: 12,
  },
  confirmarTitulo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  confirmarSubtitulo: {
    fontSize: 12,
    color: '#66BB6A',
    marginTop: 2,
  },
  btnConfirmar: {
    backgroundColor: '#4CAF50',
  },
});
