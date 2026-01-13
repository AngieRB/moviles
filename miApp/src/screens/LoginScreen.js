import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Platform, Alert } from 'react-native';
import { Text, TextInput, Button, Divider, IconButton, Snackbar } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { roleColors } from '../theme/theme';
import { validateAdminCredentials, ADMIN_ERROR_MESSAGE } from '../config/adminConfig';
import { useApp } from '../context/AppContext';
import apiClient from '../services/apiClient';

export default function LoginScreen({ route, navigation }) {
  const { role = 'productor' } = route.params || {};
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    // Validar campos
    if (!email || !password) {
      setError('Todos los campos son obligatorios');
      return;
    }

    setLoading(true);
    setError('');
    
    // LOGIN REAL PARA TODOS LOS ROLES - CONSUME LA API
    try {
      console.log('📡 Intentando login con API...', { email, role });
      
      const { data } = await apiClient.post('/login', {
        email,
        password,
        role,
      }, {
        timeout: 10000 // 10 segundos para login
      });
      
      console.log('✅ Login exitoso:', data);
      
      // Guardar usuario y token
      await login(data.user, data.token);
      
    } catch (error) {
      // Manejo silencioso del error técnico
      console.log('⚠️ Login fallido');
      
      if (error.response) {
        // El servidor respondió con un código de error
        const statusCode = error.response.status;
        const errorMessage = error.response.data?.message || 
                           error.response.data?.errors?.email?.[0] ||
                           'Error de autenticación';
        
        if (statusCode === 422) {
          setError('Correo o contraseña incorrectos');
        } else if (statusCode === 404) {
          setError('No se encontró el servidor. Verifica la conexión.');
        } else if (statusCode === 401) {
          setError('Credenciales inválidas. Verifica tu correo y contraseña.');
        } else {
          setError(errorMessage);
        }
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        // Error de red - servidor no disponible
        setError('No se pudo conectar con el servidor. Verifica que el servidor esté encendido.');
      } else if (error.request) {
        // No se recibió respuesta del servidor
        setError('El servidor no responde. Verifica tu conexión a internet.');
      } else {
        // Otro tipo de error
        setError('Error al iniciar sesión. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Recuperar contraseña para:', email);
    // navigation.navigate('ForgotPassword', { email, role });
  };

  return (
    <View style={styles.container}>
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
              numberOfLines={1}
              adjustsFontSizeToFit
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

          {/* Snackbar para errores */}
          <Snackbar
            visible={!!error}
            onDismiss={() => setError('')}
            duration={5000}
            action={{
              label: 'Cerrar',
              onPress: () => setError(''),
            }}
            style={styles.snackbar}
          >
            {error}
          </Snackbar>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    maxWidth: 400,
    alignSelf: 'center',
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
  snackbar: {
    backgroundColor: '#B00020',
  },
});