import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, Switch, List, Button, Divider, Snackbar, useTheme, FAB } from 'react-native-paper';
import { useApp } from '../../context/AppContext';

export default function ConfiguracionScreen({ navigation }) {
  const { themeMode, setTheme, isDarkMode, logout } = useApp();
  const theme = useTheme();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleThemeToggle = () => {
    const newMode = isDarkMode ? 'light' : 'dark';
    setTheme(newMode);
    const message = newMode === 'dark' 
      ? '🌙 Tema oscuro activado' 
      : '☀️ Tema claro activado';
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  // --- CORRECCIÓN AQUÍ ---
  const handleLogout = () => {
    // Solo llamamos a logout. El AppNavigator hará el resto automáticamente.
    logout(); 
  };
  // -----------------------

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.colors.background }]}>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Configuración de Tema */}
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Text variant="titleLarge" style={styles.cardTitle}>
                🎨 Apariencia
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Cambia entre tema claro y oscuro
              </Text>
              
              <View style={styles.themeOptions}>
                <List.Item
                  title={isDarkMode ? "Tema Oscuro" : "Tema Claro"}
                  description={isDarkMode 
                    ? "Fondo negro, ideal para la noche 🌙" 
                    : "Fondo blanco, ideal para el día ☀️"
                  }
                  left={() => (
                    <List.Icon 
                      icon={isDarkMode ? "moon-waning-crescent" : "white-balance-sunny"} 
                    />
                  )}
                  right={() => (
                    <Switch
                      value={isDarkMode}
                      onValueChange={handleThemeToggle}
                    />
                  )}
                />
              </View>

              <View style={styles.themePreview}>
                <Text variant="bodySmall" style={styles.themeStatus}>
                  Tema activo: {isDarkMode ? '🌙 Oscuro' : '☀️ Claro'}
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Configuración General */}
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Text variant="titleLarge" style={styles.cardTitle}>
                ⚙️ General
              </Text>
              
              <List.Item
                title="Notificaciones"
                description="Recibe alertas importantes"
                left={() => <List.Icon icon="bell" />}
                right={() => <Switch value={true} />}
              />
              <Divider />
              <List.Item
                title="Idioma"
                description="Español"
                left={() => <List.Icon icon="translate" />}
                right={() => <List.Icon icon="chevron-right" />}
              />
              <Divider />
              <List.Item
                title="Ayuda y soporte"
                description="Obtén ayuda sobre la app"
                left={() => <List.Icon icon="help-circle" />}
                right={() => <List.Icon icon="chevron-right" />}
              />
            </Card.Content>
          </Card>

          {/* Información de la App */}
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Text variant="titleLarge" style={styles.cardTitle}>
                ℹ️ Acerca de
              </Text>
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Versión:
                </Text>
                <Text variant="bodyMedium">1.0.0</Text>
              </View>
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Aplicación:
                </Text>
                <Text variant="bodyMedium">AgroConnect</Text>
              </View>
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Desarrollado por:
                </Text>
                <Text variant="bodyMedium">Tu equipo</Text>
              </View>
            </Card.Content>
          </Card>

          {/* Botón de Cerrar Sesión */}
          <Button
            mode="contained"
            onPress={handleLogout}
            icon="logout"
            style={styles.logoutButton}
            buttonColor="#D32F2F"
          >
            Cerrar Sesión
          </Button>
        </View>
      </ScrollView>

      <FAB
        icon="arrow-left"
        label=""
        onPress={() => navigation.goBack()}
        mode="elevated"
        color={isDarkMode ? '#000' : '#fff'}
        style={{ 
           position: 'absolute',
           margin: 20,
           left: 0,
           bottom: 0,
           backgroundColor: isDarkMode ? '#fff' : '#554747ff',
           zIndex: 100 
        }}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.7,
    marginBottom: 16,
  },
  themeOptions: {
    marginTop: 8,
  },
  themePreview: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(107, 155, 55, 0.1)',
    borderRadius: 8,
  },
  themeStatus: {
    marginBottom: 4,
    opacity: 0.8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  label: {
    fontWeight: '600',
    opacity: 0.7,
  },
  logoutButton: {
    marginTop: 16,
    marginBottom: 16,
  },
});