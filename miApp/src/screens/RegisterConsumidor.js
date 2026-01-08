import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { roleColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';

export default function RegisterConsumidor({ navigation }) {
  const role = 'consumidor';

  const [formData, setFormData] = useState({
    name: '',
    cedula: '',
    telefono: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.cedula.trim()) newErrors.cedula = 'La cédula es requerida';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    if (!formData.email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Correo inválido';
    }
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    alert('¡Cuenta creada exitosamente!');
    navigation.navigate('Login', { role });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={roleColors[role].primary} />
          </TouchableOpacity>
          <Text variant="displaySmall" style={[styles.logo, { color: roleColors[role].primary, textAlign: 'center', width: '100%' }]}>AgroConnect</Text>
        </View>

        <Text variant="headlineMedium" style={styles.title}>Registro Consumidor</Text>
        <View style={styles.form}>
          <TextInput label="Nombre Completo" value={formData.name} onChangeText={text => updateFormData('name', text)} mode="outlined" style={styles.input} outlineColor={roleColors[role].primary} activeOutlineColor={roleColors[role].primary} error={!!errors.name} />
          {errors.name && <HelperText type="error">{errors.name}</HelperText>}
          <TextInput label="Cédula" value={formData.cedula} onChangeText={text => updateFormData('cedula', text)} mode="outlined" style={styles.input} outlineColor={roleColors[role].primary} activeOutlineColor={roleColors[role].primary} error={!!errors.cedula} />
          {errors.cedula && <HelperText type="error">{errors.cedula}</HelperText>}
          <TextInput label="Teléfono/WhatsApp" value={formData.telefono} onChangeText={text => updateFormData('telefono', text)} mode="outlined" style={styles.input} outlineColor={roleColors[role].primary} activeOutlineColor={roleColors[role].primary} error={!!errors.telefono} />
          {errors.telefono && <HelperText type="error">{errors.telefono}</HelperText>}
          <TextInput label="Correo" value={formData.email} onChangeText={text => updateFormData('email', text)} mode="outlined" style={styles.input} outlineColor={roleColors[role].primary} activeOutlineColor={roleColors[role].primary} error={!!errors.email} />
          {errors.email && <HelperText type="error">{errors.email}</HelperText>}
          <TextInput label="Contraseña" value={formData.password} onChangeText={text => updateFormData('password', text)} mode="outlined" secureTextEntry={!showPassword} style={styles.input} outlineColor={roleColors[role].primary} activeOutlineColor={roleColors[role].primary} error={!!errors.password} right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />} />
          {errors.password && <HelperText type="error">{errors.password}</HelperText>}
          <TextInput label="Confirmar Contraseña" value={formData.confirmPassword} onChangeText={text => updateFormData('confirmPassword', text)} mode="outlined" secureTextEntry={!showConfirmPassword} style={styles.input} outlineColor={roleColors[role].primary} activeOutlineColor={roleColors[role].primary} error={!!errors.confirmPassword} right={<TextInput.Icon icon={showConfirmPassword ? "eye-off" : "eye"} onPress={() => setShowConfirmPassword(!showConfirmPassword)} />} />
          {errors.confirmPassword && <HelperText type="error">{errors.confirmPassword}</HelperText>}
          <Button mode="contained" style={[styles.registerButton, { backgroundColor: roleColors[role].primary }]} onPress={handleRegister}>Registrarse</Button>
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
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1C1B1F',
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  registerButton: {
    borderRadius: 30,
    marginTop: 8,
    marginBottom: 16,
  },
});