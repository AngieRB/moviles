import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, Avatar, TextInput, Button, Snackbar, useTheme } from 'react-native-paper';
import { useApp } from '../../context/AppContext';

// Pantalla de Perfil común para todos los usuarios
export default function PerfilScreen() {
  const { user, updateUser } = useApp();
  const theme = useTheme();
  const [editing, setEditing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    telefono: user?.telefono || '',
  });

  const handleSave = () => {
    updateUser(formData);
    setEditing(false);
    setSnackbarVisible(true);
  };

  const handleCancel = () => {
    setFormData({
      nombre: user?.nombre || '',
      apellido: user?.apellido || '',
      telefono: user?.telefono || '',
    });
    setEditing(false);
  };

  const getRoleIcon = () => {
    if (user?.role === 'productor') return 'leaf';
    if (user?.role === 'consumidor') return 'cart';
    return 'cog';
  };

  const getRoleColor = () => {
    if (user?.role === 'productor') return '#6B9B37';
    if (user?.role === 'consumidor') return '#4A90E2';
    return '#F5A623';
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Avatar y nombre */}
        <Card style={styles.headerCard} mode="elevated">
          <Card.Content style={styles.headerContent}>
            <Avatar.Icon 
              size={100} 
              icon={getRoleIcon()}
              style={[styles.avatar, { backgroundColor: getRoleColor() }]}
            />
            <Text variant="headlineMedium" style={styles.userName}>
              {user?.nombre} {user?.apellido}
            </Text>
            <Text variant="bodyMedium" style={styles.userEmail}>
              {user?.email}
            </Text>
          </Card.Content>
        </Card>

        {/* Información del perfil */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="titleLarge" style={styles.cardTitle}>
                Información Personal
              </Text>
              {!editing && (
                <Button 
                  mode="text" 
                  onPress={() => setEditing(true)}
                  icon="pencil"
                >
                  Editar
                </Button>
              )}
            </View>

            {editing ? (
              <View style={styles.form}>
                <TextInput
                  label="Nombre"
                  value={formData.nombre}
                  onChangeText={(text) => setFormData({ ...formData, nombre: text })}
                  mode="outlined"
                  style={styles.input}
                />
                <TextInput
                  label="Apellido"
                  value={formData.apellido}
                  onChangeText={(text) => setFormData({ ...formData, apellido: text })}
                  mode="outlined"
                  style={styles.input}
                />
                <TextInput
                  label="Teléfono"
                  value={formData.telefono}
                  onChangeText={(text) => setFormData({ ...formData, telefono: text })}
                  mode="outlined"
                  keyboardType="phone-pad"
                  style={styles.input}
                />
                
                <View style={styles.buttonRow}>
                  <Button 
                    mode="outlined" 
                    onPress={handleCancel}
                    style={styles.button}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    mode="contained" 
                    onPress={handleSave}
                    style={styles.button}
                  >
                    Guardar
                  </Button>
                </View>
              </View>
            ) : (
              <View>
                <View style={styles.infoRow}>
                  <Text variant="bodyMedium" style={styles.label}>
                    Nombre:
                  </Text>
                  <Text variant="bodyMedium" style={styles.value}>
                    {user?.nombre}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text variant="bodyMedium" style={styles.label}>
                    Apellido:
                  </Text>
                  <Text variant="bodyMedium" style={styles.value}>
                    {user?.apellido}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text variant="bodyMedium" style={styles.label}>
                    Email:
                  </Text>
                  <Text variant="bodyMedium" style={styles.value}>
                    {user?.email}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text variant="bodyMedium" style={styles.label}>
                    Teléfono:
                  </Text>
                  <Text variant="bodyMedium" style={styles.value}>
                    {user?.telefono}
                  </Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        ✅ Perfil actualizado correctamente
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    marginBottom: 16,
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    opacity: 0.7,
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: 'bold',
  },
  form: {
    marginTop: 8,
  },
  input: {
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  label: {
    fontWeight: '600',
    opacity: 0.7,
  },
  value: {
    fontWeight: '400',
  },
});
