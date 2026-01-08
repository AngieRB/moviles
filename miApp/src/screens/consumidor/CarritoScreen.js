import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card, Text, Button, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CarritoScreen({ navigation }) {
  const [items, setItems] = useState([
    {
      id: '1',
      nombre: 'Tomates Frescos',
      cantidad: 2,
      precio: 2.50,
      imagen: '🍅',
      productor: 'Juan García',
    },
    {
      id: '2',
      nombre: 'Lechugas Orgánicas',
      cantidad: 1,
      precio: 1.80,
      imagen: '🥬',
      productor: 'María López',
    },
  ]);

  const eliminarItem = (id) => {
    Alert.alert(
      'Eliminar producto',
      '¿Deseas eliminar este producto del carrito?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: () => {
            setItems(items.filter((item) => item.id !== id));
          },
          style: 'destructive',
        },
      ]
    );
  };

  const actualizarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad < 1) {
      eliminarItem(id);
      return;
    }
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, cantidad: nuevaCantidad } : item
      )
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const envio = subtotal > 20 ? 0 : 3.50;
  const total = subtotal + envio;

  const renderItem = ({ item }) => (
    <Card style={styles.itemCard}>
      <View style={styles.itemContent}>
        <Text style={styles.imagenProducto}>{item.imagen}</Text>

        <View style={styles.itemInfo}>
          <Text style={styles.itemNombre} numberOfLines={2}>
            {item.nombre}
          </Text>
          <Text style={styles.itemProductor}>{item.productor}</Text>
          <Text style={styles.itemPrecio}>${item.precio.toFixed(2)} c/u</Text>
        </View>

        <View style={styles.itemControles}>
          <View style={styles.cantidadControl}>
            <TouchableOpacity
              onPress={() => actualizarCantidad(item.id, item.cantidad - 1)}
            >
              <MaterialCommunityIcons name="minus-circle" size={20} color="#4A90E2" />
            </TouchableOpacity>
            <Text style={styles.cantidadTexto}>{item.cantidad}</Text>
            <TouchableOpacity
              onPress={() => actualizarCantidad(item.id, item.cantidad + 1)}
            >
              <MaterialCommunityIcons name="plus-circle" size={20} color="#4A90E2" />
            </TouchableOpacity>
          </View>

          <View style={styles.itemTotal}>
            <Text style={styles.itemTotalTexto}>
              ${(item.precio * item.cantidad).toFixed(2)}
            </Text>
            <TouchableOpacity
              onPress={() => eliminarItem(item.id)}
              style={styles.btnEliminar}
            >
              <MaterialCommunityIcons name="trash-can" size={18} color="#E74C3C" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="shopping-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>Carrito vacío</Text>
          <Text style={styles.emptyText}>Agrega productos para continuar</Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Productos')}
            style={styles.btnIrComprar}
          >
            Ir a comprar
          </Button>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
          />

          {/* Resumen de compra */}
          <View style={styles.resumenCard}>
            <Text style={styles.resumenTitulo}>Resumen de compra</Text>

            <View style={styles.resumenRow}>
              <Text style={styles.resumenLabel}>Subtotal:</Text>
              <Text style={styles.resumenValor}>
                ${subtotal.toFixed(2)}
              </Text>
            </View>

            <View style={styles.resumenRow}>
              <Text style={styles.resumenLabel}>Envío:</Text>
              <Text
                style={[
                  styles.resumenValor,
                  envio === 0 && styles.resumenGratis,
                ]}
              >
                {envio === 0 ? '¡Gratis!' : `$${envio.toFixed(2)}`}
              </Text>
            </View>

            {envio > 0 && (
              <Text style={styles.advertencia}>
                📦 Envío gratis en compras mayores a $20.00
              </Text>
            )}

            <Divider style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total a pagar:</Text>
              <Text style={styles.totalValor}>${total.toFixed(2)}</Text>
            </View>

            <View style={styles.buttonsContainer}>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Productos')}
                style={styles.btnContinuar}
              >
                Continuar comprando
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  Alert.alert(
                    'Compra confirmada',
                    'Tu pedido ha sido realizado. Te enviaremos un email con los detalles.',
                    [
                      {
                        text: 'OK',
                        onPress: () => {
                          setItems([]);
                        },
                      },
                    ]
                  );
                }}
                style={styles.btnPagar}
                labelStyle={styles.btnPagarLabel}
              >
                Proceder al pago
              </Button>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 12,
    paddingBottom: 20,
  },
  itemCard: {
    marginBottom: 12,
    elevation: 2,
  },
  itemContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  imagenProducto: {
    fontSize: 40,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemNombre: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  itemProductor: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  itemPrecio: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
    marginTop: 4,
  },
  itemControles: {
    marginLeft: 8,
  },
  cantidadControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cantidadTexto: {
    marginHorizontal: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 30,
    textAlign: 'center',
  },
  itemTotal: {
    alignItems: 'center',
  },
  itemTotalTexto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 4,
  },
  btnEliminar: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    marginBottom: 24,
  },
  btnIrComprar: {
    marginTop: 16,
    backgroundColor: '#4A90E2',
  },
  resumenCard: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    elevation: 3,
  },
  resumenTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  resumenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  resumenLabel: {
    fontSize: 13,
    color: '#666',
  },
  resumenValor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  resumenGratis: {
    color: '#4CAF50',
  },
  advertencia: {
    fontSize: 11,
    color: '#FF9800',
    marginTop: 8,
    fontStyle: 'italic',
  },
  divider: {
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  buttonsContainer: {
    marginTop: 16,
    gap: 10,
  },
  btnContinuar: {
    borderColor: '#4A90E2',
  },
  btnPagar: {
    backgroundColor: '#4A90E2',
  },
  btnPagarLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
