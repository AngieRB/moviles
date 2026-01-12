import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  TextInput,
} from 'react-native';
import { Text, Button, Card, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import apiClient from '../../services/apiClient';
import { useCarrito } from '../../context/CarritoContext';

// Pantalla de pago simplificada (sin Stripe nativo - se agregará después)
export default function PagoScreen({ route, navigation }) {
  const { total, items, direccionEnvio } = route.params || {};
  const { vaciarCarrito } = useCarrito();
  
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const mostrarAlerta = (titulo, mensaje, onOk) => {
    if (Platform.OS === 'web') {
      alert(`${titulo}\n${mensaje}`);
      if (onOk) onOk();
    } else {
      Alert.alert(titulo, mensaje, [{ text: 'OK', onPress: onOk }]);
    }
  };

  const handlePayment = async () => {
    // Validar campos
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      mostrarAlerta('Error', 'Por favor ingresa un número de tarjeta válido (16 dígitos)');
      return;
    }
    if (!expiry || expiry.length < 4) {
      mostrarAlerta('Error', 'Por favor ingresa la fecha de expiración (MM/YY)');
      return;
    }
    if (!cvc || cvc.length < 3) {
      mostrarAlerta('Error', 'Por favor ingresa el CVC (3 dígitos)');
      return;
    }

    // Simular tarjeta rechazada
    if (cardNumber.replace(/\s/g, '') === '4000000000000002') {
      mostrarAlerta('Pago Rechazado', 'Tu tarjeta fue rechazada. Intenta con otra.');
      return;
    }

    try {
      setLoading(true);

      // Crear el pedido en el backend
      await apiClient.post('/pedidos', {
        items: items.map(item => ({
          producto_id: item.producto_id || item.id,
          cantidad: item.cantidad,
        })),
        direccion_envio: direccionEnvio || '',
      });

      // Vaciar carrito después del pago exitoso
      await vaciarCarrito();

      mostrarAlerta(
        '¡Pago exitoso! 🎉',
        'Tu pedido ha sido creado correctamente. Te notificaremos cuando esté en camino.',
        () => navigation.navigate('PedidosTab')
      );

    } catch (error) {
      console.error('Error procesando pago:', error);
      mostrarAlerta(
        'Error',
        error.response?.data?.message || 'No se pudo procesar el pago. Intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Formatear número de tarjeta con espacios
  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s/g, '').replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  // Formatear fecha de expiración
  const formatExpiry = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Resumen del pedido */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>
            🛒 Resumen del pedido
          </Text>
          
          {items?.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {item.nombre} x{item.cantidad}
              </Text>
              <Text style={styles.itemPrice}>
                ${(item.precio * item.cantidad).toFixed(2)}
              </Text>
            </View>
          ))}

          <Divider style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total a pagar:</Text>
            <Text style={styles.totalValue}>${total?.toFixed(2) || '0.00'}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Formulario de pago */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>
            💳 Datos de pago
          </Text>

          <Text style={styles.inputLabel}>Número de tarjeta</Text>
          <TextInput
            style={styles.input}
            placeholder="4242 4242 4242 4242"
            placeholderTextColor="#999"
            value={cardNumber}
            onChangeText={(text) => setCardNumber(formatCardNumber(text))}
            keyboardType="numeric"
            maxLength={19}
          />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Expiración</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/YY"
                placeholderTextColor="#999"
                value={expiry}
                onChangeText={(text) => setExpiry(formatExpiry(text))}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>CVC</Text>
              <TextInput
                style={styles.input}
                placeholder="123"
                placeholderTextColor="#999"
                value={cvc}
                onChangeText={(text) => setCvc(text.replace(/\D/g, ''))}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.securityNote}>
            <MaterialCommunityIcons name="shield-check" size={16} color="#27AE60" />
            <Text style={styles.securityText}>
              Pago seguro - Modo de prueba
            </Text>
          </View>

          {/* Tarjetas de prueba */}
          <View style={styles.testCards}>
            <Text style={styles.testCardsTitle}>🧪 Tarjetas de prueba:</Text>
            <Text style={styles.testCard}>✅ 4242 4242 4242 4242 (Éxito)</Text>
            <Text style={styles.testCard}>❌ 4000 0000 0000 0002 (Rechazada)</Text>
            <Text style={styles.testCardNote}>Usa cualquier fecha futura y CVC</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Botón de pago */}
      <Button
        mode="contained"
        onPress={handlePayment}
        loading={loading}
        disabled={loading}
        style={styles.payButton}
        contentStyle={styles.payButtonContent}
        icon="lock"
      >
        {loading ? 'Procesando...' : `Pagar $${total?.toFixed(2) || '0.00'}`}
      </Button>

      <Button
        mode="text"
        onPress={() => navigation.goBack()}
        style={styles.cancelButton}
        disabled={loading}
      >
        Cancelar
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  securityText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#27AE60',
  },
  testCards: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  testCardsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#F57C00',
  },
  testCard: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  testCardNote: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  payButton: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#27AE60',
  },
  payButtonContent: {
    paddingVertical: 8,
  },
  cancelButton: {
    marginBottom: 32,
  },
});
