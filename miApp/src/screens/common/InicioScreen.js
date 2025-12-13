import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, Avatar, useTheme } from 'react-native-paper';
import { useApp } from '../../context/AppContext';

// Pantalla de Inicio común para todos los usuarios
export default function InicioScreen() {
  const { user, personalizedGreeting } = useApp();
  const theme = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Saludo personalizado */}
        <Card style={styles.greetingCard} mode="elevated">
          <Card.Content>
            <View style={styles.greetingContent}>
              <Avatar.Icon 
                size={60} 
                icon="hand-wave" 
                style={styles.avatar}
              />
              <View style={styles.greetingText}>
                <Text variant="headlineSmall" style={styles.greeting}>
                  {personalizedGreeting}
                </Text>
                <Text variant="bodyMedium" style={styles.subGreeting}>
                  Bienvenido a AgroConnect
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Información del usuario */}
        {user && (
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Text variant="titleLarge" style={styles.cardTitle}>
                Tu Perfil
              </Text>
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Nombre:
                </Text>
                <Text variant="bodyMedium" style={styles.value}>
                  {user.nombre} {user.apellido}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Email:
                </Text>
                <Text variant="bodyMedium" style={styles.value}>
                  {user.email}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Rol:
                </Text>
                <Text variant="bodyMedium" style={[styles.value, styles.roleBadge]}>
                  {user.role === 'productor' ? '🌾 Productor' : 
                   user.role === 'consumidor' ? '🛒 Consumidor' : 
                   '⚙️ Administrador'}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Estadísticas o contenido dinámico */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Resumen
            </Text>
            <Text variant="bodyMedium">
              Esta es tu pantalla de inicio. Aquí verás el resumen de tu actividad en AgroConnect.
            </Text>
          </Card.Content>
        </Card>
      </View>
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
  greetingCard: {
    marginBottom: 16,
  },
  greetingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 16,
  },
  greetingText: {
    flex: 1,
  },
  greeting: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subGreeting: {
    opacity: 0.7,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
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
  roleBadge: {
    fontWeight: 'bold',
  },
});
