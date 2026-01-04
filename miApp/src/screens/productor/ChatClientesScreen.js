import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ChatClientesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat con Clientes</Text>
      {/* Aquí se mostrarán los contactos para chatear */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B9B37',
  },
});