import React from 'react';
import { StyleSheet, View, ScrollView, Image } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text 
          variant="displayMedium"
          style={styles.header}
        >
          AgroConnect
        </Text>

        {/* Central Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require('../../assets/logo-agroconnect.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Welcome Title */}
        <Text 
          variant="headlineLarge"
          style={styles.welcomeTitle}
        >
          ¡Bienvenido!
        </Text>

        {/* Subtitle */}
        <Text 
          variant="bodyLarge"
          style={styles.subtitle}
        >
          Conectando productores agrícolas{'\n'}con consumidores
        </Text>

        {/* Primary Action Button */}
        <Button
          mode="contained"
          onPress={() => navigation.navigate('RoleSelection')}
          style={styles.primaryButton}
          contentStyle={styles.primaryButtonContent}
          labelStyle={styles.primaryButtonLabel}
        >
          Registrarse
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D8D8D8',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  header: {
    fontWeight: 'bold',
    color: '#6B9B37',
    marginBottom: 40,
    textAlign: 'center',
  },
  illustrationContainer: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 260,
    height: 260,
  },
  welcomeTitle: {
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  primaryButton: {
    minWidth: 280,
    borderRadius: 30,
  },
  primaryButtonContent: {
    paddingVertical: 8,
  },
  primaryButtonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
