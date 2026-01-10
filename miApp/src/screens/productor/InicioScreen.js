import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const InicioScreen = () => {
  const userProfile = {
    name: 'Juan Pérez',
    email: 'consumidor@test.com',
    role: 'Consumidor',
  };

  const products = [
    { id: '1', name: 'Tomate Riñón', category: 'Verduras', price: '$1.50/kg', stock: '120 kg', status: 'Alto', statusColor: 'green' },
    { id: '2', name: 'Papas Superchola', category: 'Tubérculos', price: '$0.80/kg', stock: '500 kg', status: 'Alto', statusColor: 'green' },
    { id: '3', name: 'Lechuga Crespa', category: 'Verduras', price: '$0.50/unidad', stock: '25 unidades', status: 'Bajo', statusColor: 'red' },
    { id: '4', name: 'Manzana Roja', category: 'Frutas', price: '$2.00/kg', stock: '80 kg', status: 'Medio', statusColor: 'yellow' },
    { id: '5', name: 'Cebolla Paiteña', category: 'Verduras', price: '$1.00/kg', stock: '150 kg', status: 'Alto', statusColor: 'green' },
  ];

  const renderProduct = ({ item }) => (
    <View style={styles.productRow}>
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productCategory}>{item.category}</Text>
      <Text style={styles.productPrice}>{item.price}</Text>
      <Text style={styles.productStock}>{item.stock}</Text>
      <Text style={[styles.productStatus, { color: item.statusColor }]}>{item.status}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>¡Buenas tardes, {userProfile.name}!</Text>
      <Text style={styles.subHeader}>Bienvenido a AgroConnect</Text>

      <Text style={styles.sectionTitle}>Stock de Productos Disponibles</Text>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        style={styles.productList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 18,
    color: '#757575',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  productList: {
    marginTop: 10,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#ffffff',
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  productCategory: {
    fontSize: 14,
    color: '#757575',
  },
  productPrice: {
    fontSize: 14,
    color: '#757575',
  },
  productStock: {
    fontSize: 14,
    color: '#757575',
  },
  productStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default InicioScreen;