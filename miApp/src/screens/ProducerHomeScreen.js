import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';

const ProducerHomeScreen = () => {
  const products = [
    { id: '1', name: 'Tomate Riñón', category: 'Verduras', price: '$1.50/kg', stock: '500 kg', status: 'Alto' },
    { id: '2', name: 'Papas Superchola', category: 'Tubérculos', price: '$0.80/kg', stock: '1200 kg', status: 'Alto' },
    { id: '3', name: 'Cebolla Paiteña', category: 'Verduras', price: '$1.00/kg', stock: '50 kg', status: 'Bajo' },
  ];

  const renderProduct = ({ item }) => (
    <View style={styles.productRow}>
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productCategory}>{item.category}</Text>
      <Text style={styles.productPrice}>{item.price}</Text>
      <Text style={styles.productStock}>{item.stock}</Text>
      <Text style={[styles.productStatus, item.status === 'Alto' ? styles.statusHigh : styles.statusLow]}>
        {item.status}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>¡Buenas tardes, Productor!</Text>
      <Text style={styles.subHeader}>Bienvenido a AgroConnect</Text>

      <View style={styles.profileSection}>
        <Text style={styles.profileLabel}>Nombre:</Text>
        <Text style={styles.profileValue}>Juan Pérez</Text>
        <Text style={styles.profileLabel}>Email:</Text>
        <Text style={styles.profileValue}>productor@test.com</Text>
        <Text style={styles.profileLabel}>Rol:</Text>
        <Text style={styles.profileValue}>Productor</Text>
      </View>

      <Text style={styles.sectionTitle}>Mis Productos y Stock</Text>
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
  profileSection: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  profileLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  profileValue: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 5,
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
  statusHigh: {
    color: '#4CAF50',
  },
  statusLow: {
    color: '#F44336',
  },
});

export default ProducerHomeScreen;