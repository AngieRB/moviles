import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, Avatar, TextInput, Button, IconButton, HelperText } from 'react-native-paper';
import { useApp } from '../../context/AppContext';

// Pantalla de Perfil común para todos los usuarios
export default function PerfilScreen() {
  const { user, updateUser } = useApp();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || 'productor@test.com',
    telefono: user?.telefono || '0987654321',
  });
  const [errors, setErrors] = useState({});

  const fincaData = {
    ubicacion: 'Km 15 Vía Portoviejo',
    area: '10.5 Hectáreas',
    experiencia: '15 años',
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.telefono.trim() || !/^[0-9]{10}$/.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono debe tener 10 dígitos numéricos';
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Correo inválido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    updateUser(formData);
    setEditing(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content style={styles.headerContent}>
          <Avatar.Icon size={100} icon="leaf" style={styles.avatar} />
          <Text style={styles.userName}>{user?.nombre || 'Juan Pérez'}</Text>
          <Text style={styles.userRole}>Productor Verificado</Text>
          <Text style={styles.userFinca}>Finca El Paraíso - Manabí</Text>
        </Card.Content>
      </Card>

      <View style={styles.sectionContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Resumen de la Finca</Text>
            <Text style={styles.infoText}>Ubicación: {fincaData.ubicacion}</Text>
            <Text style={styles.infoText}>Área: {fincaData.area}</Text>
            <Text style={styles.infoText}>Experiencia: {fincaData.experiencia}</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Información de Contacto</Text>
            {editing ? (
              <View>
                <TextInput
                  label="Email"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.email}
                />
                {errors.email && <HelperText type="error">{errors.email}</HelperText>}

                <TextInput
                  label="Teléfono"
                  value={formData.telefono}
                  onChangeText={(text) => setFormData({ ...formData, telefono: text.replace(/[^0-9]/g, '').slice(0, 10) })}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="phone-pad"
                  error={!!errors.telefono}
                />
                {errors.telefono && <HelperText type="error">{errors.telefono}</HelperText>}

                <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
                  Guardar
                </Button>
              </View>
            ) : (
              <View>
                <Text style={styles.infoText}>Email: {formData.email}</Text>
                <Text style={styles.infoText}>Teléfono: {formData.telefono}</Text>
                <IconButton
                  icon="pencil"
                  size={20}
                  onPress={() => setEditing(true)}
                  style={styles.editIcon}
                />
              </View>
            )}
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#6B9B37',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  userRole: {
    fontSize: 16,
    color: '#6B9B37',
  },
  userFinca: {
    fontSize: 14,
    color: '#757575',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  card: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    marginBottom: 10,
  },
  saveButton: {
    marginTop: 10,
  },
  editIcon: {
    alignSelf: 'flex-end',
  },
});