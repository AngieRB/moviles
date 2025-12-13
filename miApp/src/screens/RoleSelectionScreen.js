import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, IconButton } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { roleColors } from '../theme/theme';

export default function RoleSelectionScreen({ navigation }) {
  const roles = [
    {
      id: 'productor',
      title: 'Productor/Agricultor',
      description: 'Vende tus productos directamente',
      icon: 'leaf',
      color: roleColors.productor.primary,
      lightColor: roleColors.productor.light,
    },
    {
      id: 'consumidor',
      title: 'Consumidor/Cliente',
      description: 'Compra productos frescos y locales',
      icon: 'cart',
      color: roleColors.consumidor.primary,
      lightColor: roleColors.consumidor.light,
    },
  ];

  const handleRoleSelect = (roleId) => {
    navigation.navigate('Login', { role: roleId });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Botón de atrás */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={28}
          onPress={() => navigation.goBack()}
          iconColor="#6B9B37"
        />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="headlineLarge" style={styles.title}>
          Selecciona tu rol
        </Text>
        
        <Text variant="bodyLarge" style={styles.subtitle}>
          ¿Cómo deseas usar AgroConnect?
        </Text>

        <View style={styles.cardsContainer}>
          {roles.map((role) => (
            <Card
              key={role.id}
              style={[styles.card, { borderColor: role.color }]}
              onPress={() => handleRoleSelect(role.id)}
              mode="elevated"
            >
              <Card.Content style={styles.cardContent}>
                <View style={[styles.iconContainer, { backgroundColor: role.lightColor }]}>
                  <IconButton
                    icon={role.icon}
                    size={40}
                    iconColor={role.color}
                  />
                </View>
                <Text variant="titleLarge" style={[styles.roleTitle, { color: role.color }]}>
                  {role.title}
                </Text>
                <Text variant="bodyMedium" style={styles.roleDescription}>
                  {role.description}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>

        <Text variant="bodySmall" style={styles.footerText}>
          Podrás cambiar tu rol más tarde en la configuración
        </Text>

        {/* Acceso administrativo discreto */}
        <TouchableOpacity 
          onPress={() => handleRoleSelect('administrador')}
          style={styles.adminAccess}
        >
          <Text variant="bodySmall" style={styles.adminText}>
            Ingreso administrativo
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 40,
    paddingLeft: 8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontWeight: 'bold',
    color: '#1C1B1F',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
  },
  cardsContainer: {
    gap: 20,
    marginBottom: 30,
  },
  card: {
    borderRadius: 16,
    borderWidth: 2,
    elevation: 3,
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  iconContainer: {
    borderRadius: 50,
    marginBottom: 16,
  },
  roleTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  roleDescription: {
    color: '#666666',
    textAlign: 'center',
  },
  footerText: {
    color: '#999999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  adminAccess: {
    marginTop: 30,
    paddingVertical: 12,
    alignItems: 'center',
  },
  adminText: {
    color: '#999999',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});
