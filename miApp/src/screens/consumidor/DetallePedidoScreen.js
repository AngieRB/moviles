import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Card, Text, Divider, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function DetallePedidoScreen({ route, navigation }) {
  const { pedido } = route.params;

  // Datos detallados del pedido
  const detalles = [
    {
      id: '1',
      nombre: 'Tomates Frescos',
      cantidad: 2,
      precio: 2.50,
      subtotal: 5.00,
    },
    {
      id: '2',
      nombre: 'Lechuga Orgánica',
      cantidad: 1,
      precio: 1.80,
      subtotal: 1.80,
    },
    {
      id: '3',
      nombre: 'Zanahorias',
      cantidad: 3,
      precio: 1.50,
      subtotal: 4.50,
    },
  ];

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Entregado':
        return '#4CAF50';
      case 'En camino':
        return '#FF9800';
      case 'Confirmado':
        return '#2196F3';
      default:
        return '#999';
    }
  };

  const pasos = [
    { titulo: 'Pedido Realizado', completado: true, fecha: '01 Ene' },
    {
      titulo: 'Confirmado',
      completado: true,
      fecha: '01 Ene',
    },
    {
      titulo: 'En camino',
      completado: pedido.estado !== 'Confirmado',
      fecha: '02 Ene',
    },
    {
      titulo: 'Entregado',
      completado: pedido.estado === 'Entregado',
      fecha: pedido.estado === 'Entregado' ? '03 Ene' : '-',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Estado del pedido */}
      <Card style={styles.estadoCard}>
        <View style={styles.estadoContent}>
          <View>
            <Text style={styles.estadoLabel}>Estado actual</Text>
            <Text style={styles.estadoValor}>{pedido.estado}</Text>
          </View>
          <Icon
            name={
              pedido.estado === 'Entregado'
                ? 'check-circle'
                : pedido.estado === 'En camino'
                  ? 'truck-fast'
                  : 'clock-outline'
            }
            size={48}
            color={getEstadoColor(pedido.estado)}
          />
        </View>
      </Card>

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
              Calle Principal 123, Apartamento 5B
            </Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="phone" size={20} color="#4A90E2" />
          <View style={styles.infoTexto}>
            <Text style={styles.infoLabel}>Contacto</Text>
            <Text style={styles.infoValor}>+1 234 567 8900</Text>
          </View>
        </View>
      </Card>

      {/* Detalles de productos */}
      <Card style={styles.productosCard}>
        <Text style={styles.productosTitle}>Productos</Text>
        <Divider style={styles.divider} />

        {detalles.map((item, index) => (
          <View key={item.id}>
            <View style={styles.productoRow}>
              <View style={styles.productoInfo}>
                <Text style={styles.productoNombre}>{item.nombre}</Text>
                <Text style={styles.productoCantidad}>
                  {item.cantidad} x ${item.precio.toFixed(2)}
                </Text>
              </View>
              <Text style={styles.productoSubtotal}>
                ${item.subtotal.toFixed(2)}
              </Text>
            </View>
            {index < detalles.length - 1 && (
              <Divider style={styles.dividerProducto} />
            )}
          </View>
        ))}

        <Divider style={styles.divider} />

        <View style={styles.resumenRow}>
          <Text style={styles.resumenLabel}>Subtotal</Text>
          <Text style={styles.resumenValor}>$13.30</Text>
        </View>

        <View style={styles.resumenRow}>
          <Text style={styles.resumenLabel}>Envío</Text>
          <Text style={[styles.resumenValor, styles.resumenGratis]}>
            Gratis
          </Text>
        </View>

        <View style={styles.resumenRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValor}>${pedido.total.toFixed(2)}</Text>
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
});
