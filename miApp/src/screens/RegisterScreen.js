import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Checkbox, IconButton, HelperText } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { roleColors } from '../theme/theme';

export default function RegisterScreen({ route, navigation }) {
  const { role = 'productor' } = route.params || {};
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const roleConfig = {
    productor: {
      title: 'Productor',
      icon: '🌾',
      color: roleColors.productor.primary,
      additionalFields: [
        { key: 'cedula', label: 'Cédula *', icon: 'card-account-details' },
        { key: 'nombreFinca', label: 'Nombre de la finca', icon: 'barn' },
        { key: 'ubicacionGPS', label: 'Ubicación GPS', icon: 'map-marker' },
        { key: 'tipoCultivos', label: 'Tipo de cultivos (3 a 5)', icon: 'sprout', type: 'select', options: ['Maíz', 'Cacao', 'Café', 'Verde', 'Tomate', 'Naranja', 'Banano', 'Otros'] },
        { key: 'fotoCedula', label: 'Foto de la cédula', icon: 'camera' },
        { key: 'fotoFinca', label: 'Foto de la finca', icon: 'camera' },
      ],
    },
    consumidor: {
      title: 'Consumidor',
      icon: '🛒',
      color: roleColors.consumidor.primary,
      additionalFields: [
        { key: 'cedula', label: 'Cédula *', icon: 'card-account-details' },
        { key: 'direccionEntrega', label: 'Dirección de entrega', icon: 'map-marker' },
      ],
    },
    administrador: {
      title: 'Administrador',
      icon: '⚙️',
      color: roleColors.administrador.primary,
      additionalFields: [
        { key: 'codigoAcceso', label: 'Código de acceso', icon: 'key', secure: true },
      ],
    },
  };

  const config = roleConfig[role];

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es requerido';
    if (!formData.email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Correo inválido';
    } else if (!isUniqueEmail(formData.email)) {
      newErrors.email = 'El correo ya está registrado';
    }
    if (!formData.cedula.trim()) {
      newErrors.cedula = 'La cédula es requerida';
    } else if (!isUniqueCedula(formData.cedula)) {
      newErrors.cedula = 'La cédula ya está registrada';
    }
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    if (!acceptTerms) {
      newErrors.terms = 'Debes aceptar los términos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    // Bloquear registro de administradores
    if (role === 'administrador') {
      alert('El registro de administradores no está disponible.\nContacte al soporte técnico.');
      return;
    }

    setLoading(true);
    // Simular llamada a API
    setTimeout(() => {
      console.log('Registro:', { ...formData, role });
      setLoading(false);
      alert('¡Cuenta creada exitosamente!');
      // Navegar al login o home
      navigation.navigate('Login', { role });
    }, 1500);
  };

  const isUniqueEmail = (email) => {
    // Simular validación de correo único
    const existingEmails = ['test@example.com', 'user@example.com'];
    return !existingEmails.includes(email);
  };

  const isUniqueCedula = (cedula) => {
    // Simular validación de cédula única
    const existingCedulas = ['123456789', '987654321'];
    return !existingCedulas.includes(cedula);
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
          Crear Cuenta
        </Text>
        
        <Text variant="bodyLarge" style={styles.subtitle}>
          {config.title}
        </Text>

        {/* Form */}
        <View style={styles.form}>
          {/* Nombre */}
          <TextInput
            label="Nombre *"
            value={formData.nombre}
            onChangeText={(text) => updateFormData('nombre', text)}
            mode="outlined"
            autoCapitalize="words"
            left={<TextInput.Icon icon="account" />}
            style={styles.input}
            outlineColor={config.color}
            activeOutlineColor={config.color}
            error={!!errors.nombre}
          />
          {errors.nombre && <HelperText type="error">{errors.nombre}</HelperText>}

          {/* Apellido */}
          <TextInput
            label="Apellido *"
            value={formData.apellido}
            onChangeText={(text) => updateFormData('apellido', text)}
            mode="outlined"
            autoCapitalize="words"
            left={<TextInput.Icon icon="account" />}
            style={styles.input}
            outlineColor={config.color}
            activeOutlineColor={config.color}
            error={!!errors.apellido}
          />
          {errors.apellido && <HelperText type="error">{errors.apellido}</HelperText>}

          {/* Email */}
          <TextInput
            label="Correo electrónico *"
            value={formData.email}
            onChangeText={(text) => updateFormData('email', text)}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            left={<TextInput.Icon icon="email" />}
            style={styles.input}
            outlineColor={config.color}
            activeOutlineColor={config.color}
            error={!!errors.email}
          />
          {errors.email && <HelperText type="error">{errors.email}</HelperText>}

          {/* Teléfono */}
          <TextInput
            label="Teléfono *"
            value={formData.telefono}
            onChangeText={(text) => updateFormData('telefono', text)}
            mode="outlined"
            keyboardType="phone-pad"
            autoComplete="tel"
            left={<TextInput.Icon icon="phone" />}
            style={styles.input}
            outlineColor={config.color}
            activeOutlineColor={config.color}
            error={!!errors.telefono}
          />
          {errors.telefono && <HelperText type="error">{errors.telefono}</HelperText>}

          {/* Campos adicionales según rol */}
          {config.additionalFields.map((field) => (
            <View key={field.key}>
              <TextInput
                label={field.label}
                value={formData[field.key] || ''}
                onChangeText={(text) => updateFormData(field.key, text)}
                mode="outlined"
                secureTextEntry={field.secure}
                left={<TextInput.Icon icon={field.icon} />}
                style={styles.input}
                outlineColor={config.color}
                activeOutlineColor={config.color}
              />
            </View>
          ))}

          {/* Contraseña */}
          <TextInput
            label="Contraseña *"
            value={formData.password}
            onChangeText={(text) => updateFormData('password', text)}
            mode="outlined"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
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
            error={!!errors.password}
          />
          {errors.password && <HelperText type="error">{errors.password}</HelperText>}

          {/* Confirmar Contraseña */}
          <TextInput
            label="Confirmar contraseña *"
            value={formData.confirmPassword}
            onChangeText={(text) => updateFormData('confirmPassword', text)}
            mode="outlined"
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            left={<TextInput.Icon icon="lock-check" />}
            right={
              <TextInput.Icon 
                icon={showConfirmPassword ? "eye-off" : "eye"}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
            style={styles.input}
            outlineColor={config.color}
            activeOutlineColor={config.color}
            error={!!errors.confirmPassword}
          />
          {errors.confirmPassword && <HelperText type="error">{errors.confirmPassword}</HelperText>}

          {/* Términos y Condiciones */}
          <View style={styles.checkboxContainer}>
            <Checkbox
              status={acceptTerms ? 'checked' : 'unchecked'}
              onPress={() => setAcceptTerms(!acceptTerms)}
              color={config.color}
            />
            <Text 
              variant="bodySmall" 
              style={styles.termsText}
              onPress={() => setAcceptTerms(!acceptTerms)}
            >
              Acepto los{' '}
              <Text style={[styles.termsLink, { color: config.color }]}>
                términos y condiciones
              </Text>
            </Text>
          </View>
          {errors.terms && <HelperText type="error">{errors.terms}</HelperText>}

          {/* Botón de registro */}
          <Button
            mode="contained"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={[styles.registerButton, { backgroundColor: config.color }]}
            contentStyle={styles.registerButtonContent}
            labelStyle={styles.registerButtonLabel}
          >
            Registrarse
          </Button>

          {/* Link a login */}
          <View style={styles.loginContainer}>
            <Text variant="bodyMedium" style={styles.loginText}>
              ¿Ya tienes cuenta?
            </Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Login', { role })}
              labelStyle={[styles.loginButtonLabel, { color: config.color }]}
            >
              Inicia sesión
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
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  termsText: {
    flex: 1,
    marginLeft: 8,
    color: '#666666',
  },
  termsLink: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  registerButton: {
    borderRadius: 30,
    marginTop: 8,
    marginBottom: 16,
  },
  registerButtonContent: {
    paddingVertical: 8,
  },
  registerButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  loginText: {
    color: '#666666',
  },
  loginButtonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
