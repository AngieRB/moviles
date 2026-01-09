import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';

const ProducerProfileScreen = () => {
  const [name, setName] = useState('Juan');
  const [lastName, setLastName] = useState('Pérez');
  const [phone, setPhone] = useState('0987654321');
  const [address, setAddress] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSaveChanges = () => {
    // Lógica para guardar cambios
    console.log({ name, lastName, phone, address, currentPassword, newPassword });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Image
          source={{ uri: 'https://via.placeholder.com/150' }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>Juan Pérez</Text>
        <Text style={styles.profileEmail}>productor@test.com</Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Información Personal</Text>

        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Apellido"
          value={lastName}
          onChangeText={setLastName}
        />

        <TextInput
          style={styles.input}
          placeholder="Teléfono"
          value={phone}
          onChangeText={setPhone}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Dirección"
          value={address}
          onChangeText={setAddress}
        />

        <Text style={styles.sectionTitle}>Cambiar Contraseña</Text>

        <TextInput
          style={styles.input}
          placeholder="Contraseña Actual"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Nueva Contraseña"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
            <Text style={styles.buttonText}>GUARDAR CAMBIOS</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => console.log('Cancelar')}>
            <Text style={styles.buttonText}>CANCELAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerSection: {
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileEmail: {
    fontSize: 16,
    color: '#ffffff',
  },
  formSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#ffffff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginRight: 10,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default ProducerProfileScreen;