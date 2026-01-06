import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, TextInput, Button, Divider, IconButton } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { roleColors } from '../theme/theme';
import { validateAdminCredentials, ADMIN_ERROR_MESSAGE } from '../config/adminConfig';
import { useApp } from '../context/AppContext';

export default function LoginScreen({ route, navigation }) {
  const { role = 'productor' } = route.params || {};
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const roleConfig = {
    productor: {
      title: 'Productor',
      icon: '🌾',
      color: roleColors.productor.primary,
    },
    consumidor: {
      title: 'Consumidor',
      icon: '🛒',
      color: roleColors.consumidor.primary,
    },
    administrador: {
      title: 'Administrador',
      icon: '⚙️',
      color: roleColors.administrador.primary,
    },
  };

  const config = roleConfig[role];

  const handleLogin = async () => {
    setLoading(true);
    
    // Validación especial para administrador con credenciales fijas
    if (role === 'administrador') {
      setTimeout(() => {
        if (validateAdminCredentials(email, password)) {
          console.log('✅ Login exitoso - Administrador');
          
          // Crear usuario administrador
          const userData = {
            nombre: 'Administrador',
            apellido: 'Sistema',
            email: email,
            telefono: 'N/A',
            role: 'administrador',
          };
          
          login(userData);
          setLoading(false);
        } else {
          setLoading(false);
          Alert.alert('Error de autenticación', ADMIN_ERROR_MESSAGE);
        }
      }, 1500);
      return;
    }
    
    // Login normal para productor y consumidor (simulado)
    setTimeout(() => {
      console.log('Login:', { email, password, role });
      
      // Simular datos del usuario (en producción vendrían de tu API)
      const userData = {
        nombre: email.split('@')[0],
        apellido: 'Usuario',
        email: email,
        telefono: '+123456789',
        role: role,
        roleData: role === 'productor' 
          ? { nombreFinca: 'Mi Finca', tipoProductos: 'Vegetales' }
          : { direccion: 'Av. Principal 123' },
      };
      
      login(userData);
      setLoading(false);
    }, 1500);
  };

  const handleForgotPassword = () => {
    console.log('Recuperar contraseña para:', email);
    // navigation.navigate('ForgotPassword', { email, role });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          <Text 
            variant="displaySmall" 
            style={[styles.logo, { color: config.color }]}
          >
            AgroConnect
          </Text>
        </View>

        {/* Role Icon */}
        <View style={[styles.roleIconContainer, { backgroundColor: config.color + '20' }]}>
          <Text style={styles.roleIcon}>{config.icon}</Text>
        </View>

        <Text variant="headlineMedium" style={styles.title}>
          Iniciar Sesión
        </Text>
        
        <Text variant="bodyLarge" style={styles.subtitle}>
          {config.title}
        </Text>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            label="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            left={<TextInput.Icon icon="email" />}
            style={styles.input}
            outlineColor={config.color}
            activeOutlineColor={config.color}
          />

          <TextInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon 
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            style={styles.input}
            outlineColor={config.color}
            activeOutlineColor={config.color}
          />

          <Button
            mode="text"
            onPress={handleForgotPassword}
            style={styles.forgotButton}
            labelStyle={[styles.forgotButtonLabel, { color: config.color }]}
          >
            ¿Olvidaste tu contraseña?
          </Button>

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={!email || !password || loading}
            style={[styles.loginButton, { backgroundColor: config.color }]}
            contentStyle={styles.loginButtonContent}
            labelStyle={styles.loginButtonLabel}
          >
            Iniciar Sesión
          </Button>

          <Divider style={styles.divider} />

          <View style={styles.registerContainer}>
            <Text variant="bodyMedium" style={styles.registerText}>
              ¿No tienes cuenta?
            </Text>
            <Button
              mode="text"
              onPress={() => {
                if (role === 'productor') {
                  navigation.navigate('RegisterProductor');
                } else if (role === 'consumidor') {
                  navigation.navigate('RegisterConsumidor');
                }
              }}
              labelStyle={[styles.registerButtonLabel, { color: config.color }]}
            >
              Regístrate aquí
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  backButton: {
    margin: 0,
  },
  logo: {
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  roleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  roleIcon: {
    fontSize: 40,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1C1B1F',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666666',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotButtonLabel: {
    fontSize: 14,
  },
  loginButton: {
    borderRadius: 30,
    marginBottom: 24,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
  loginButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 24,
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  registerText: {
    color: '#666666',
  },
  registerButtonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});