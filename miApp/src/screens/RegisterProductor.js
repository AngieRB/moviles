import React, { useState } from 'react';
import * as Location from 'expo-location';
import { Modal, TouchableOpacity } from 'react-native';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import apiClient from '../services/apiClient';
import { Text, TextInput, Button, IconButton, HelperText } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { roleColors } from '../theme/theme';

export default function RegisterProductor({ route, navigation }) {
  const [cultivoModalVisible, setCultivoModalVisible] = useState(false);
  const { role = 'productor' } = route.params || {};

  // Estado para los pasos del registro (Ahora solo son 2 pasos)
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    cedula: '',
    telefono: '',
    email: '',
    password: '',
    confirmPassword: '',
    nombreFinca: '',
    ubicacionGPS: '',
    tipoCultivos: [],
    experiencia: '',
    areaCultivo: '',
    // Se eliminaron fotoCedula y fotoFinca
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Para selección de cultivos
  const cultivosOpciones = ['Maíz', 'Cacao', 'Café', 'Verde', 'Tomate', 'Naranja', 'Banano', 'Otros'];

  // Obtener ubicación GPS
  const handleGetLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permiso de ubicación denegado');
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    if (location && location.coords) {
      updateFormData('ubicacionGPS', `${location.coords.latitude}, ${location.coords.longitude}`);
    }
  };

  // Selector de cultivos
  const handleSelectCultivo = (cultivo) => {
    let seleccionados = formData.tipoCultivos.includes(cultivo)
      ? formData.tipoCultivos.filter(c => c !== cultivo)
      : [...formData.tipoCultivos, cultivo];
    // Limitar a máximo 5
    if (seleccionados.length <= 5) {
      updateFormData('tipoCultivos', seleccionados);
    }
  };
  const handleCloseCultivoModal = () => {
    setCultivoModalVisible(false);
  };

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  };

  // Validaciones por paso
  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.name.trim()) newErrors.nombre = 'El nombre es requerido';
      // Validación cédula: solo números, 10 dígitos
      if (!formData.cedula.trim()) {
        newErrors.cedula = 'La cédula es requerida';
      } else if (!/^\d{10}$/.test(formData.cedula)) {
        newErrors.cedula = 'La cédula debe tener 10 dígitos numéricos';
      }
      // Validación teléfono: solo números, 10 dígitos
      if (!formData.telefono.trim()) {
        newErrors.telefono = 'El teléfono es requerido';
      } else if (!/^\d{10}$/.test(formData.telefono)) {
        newErrors.telefono = 'El teléfono debe tener 10 dígitos numéricos';
      }
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
    }
    if (step === 2) {
      if (!formData.nombreFinca.trim()) newErrors.nombreFinca = 'El nombre de la finca es requerido';
      if (!formData.ubicacionGPS.trim()) newErrors.ubicacionGPS = 'La ubicación es requerida';
      if (formData.tipoCultivos.length < 3) newErrors.tipoCultivos = 'Selecciona de 3 a 5 cultivos';
      if (!formData.experiencia.trim()) newErrors.experiencia = 'Año de experiencia requerido';
      if (!formData.areaCultivo.trim()) newErrors.areaCultivo = 'Área de cultivo requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep(step + 1);
  };
  const handleBack = () => {
    setStep(step - 1);
  };

  const handleRegister = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      // Preparar datos para el backend SIN FOTOS
      const payload = {
        name: formData.name,
        cedula: formData.cedula,
        telefono: formData.telefono,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        nombreFinca: formData.nombreFinca,
        ubicacionGPS: formData.ubicacionGPS,
        tipoCultivos: formData.tipoCultivos,
        experiencia: formData.experiencia,
        areaCultivo: formData.areaCultivo,
      };
      
      const response = await apiClient.post('/register-productor', payload);
      setLoading(false);
      alert('¡Cuenta creada exitosamente!');
      navigation.navigate('Login', { role });
    } catch (error) {
      setLoading(false);
      let msg = 'Error al registrar. Intenta nuevamente.';
      if (error.response && error.response.data && error.response.data.errors) {
        const errors = error.response.data.errors;
        msg = Object.values(errors).flat().join('\n');
      }
      alert(msg);
      console.log(error);
    }
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
        {/* Header con flecha */}
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={28}
            style={{ marginRight: 0 }}
            onPress={() => navigation.goBack()}
            color={roleColors.productor.primary}
          />
          <Text variant="displaySmall" style={[styles.logo, { color: roleColors.productor.primary, textAlign: 'center', width: '100%' }]}>AgroConnect</Text>
        </View>

        {step === 1 && (
          <>
            <Text variant="headlineMedium" style={styles.title}>Registro Productor</Text>
            <View style={styles.form}>
              <TextInput label="Nombre Completo" value={formData.name} onChangeText={text => updateFormData('name', text)} mode="outlined" style={styles.input} outlineColor={roleColors.productor.primary} activeOutlineColor={roleColors.productor.primary} error={!!errors.nombre} />
              {errors.nombre && <HelperText type="error">{errors.nombre}</HelperText>}
              <TextInput label="Cédula" value={formData.cedula} onChangeText={text => updateFormData('cedula', text.replace(/[^0-9]/g, ''))} mode="outlined" style={styles.input} outlineColor={roleColors.productor.primary} activeOutlineColor={roleColors.productor.primary} error={!!errors.cedula} keyboardType="numeric" maxLength={10} />
              {errors.cedula && <HelperText type="error">{errors.cedula}</HelperText>}
              <TextInput label="Teléfono/WhatsApp" value={formData.telefono} onChangeText={text => updateFormData('telefono', text.replace(/[^0-9]/g, ''))} mode="outlined" style={styles.input} outlineColor={roleColors.productor.primary} activeOutlineColor={roleColors.productor.primary} error={!!errors.telefono} keyboardType="numeric" maxLength={10} />
              {errors.telefono && <HelperText type="error">{errors.telefono}</HelperText>}
              <TextInput label="Correo" value={formData.email} onChangeText={text => updateFormData('email', text)} mode="outlined" style={styles.input} outlineColor={roleColors.productor.primary} activeOutlineColor={roleColors.productor.primary} error={!!errors.email} />
              {errors.email && <HelperText type="error">{errors.email}</HelperText>}
              <TextInput label="Contraseña" value={formData.password} onChangeText={text => updateFormData('password', text)} mode="outlined" secureTextEntry={!showPassword} style={styles.input} outlineColor={roleColors.productor.primary} activeOutlineColor={roleColors.productor.primary} error={!!errors.password} right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />} />
              {errors.password && <HelperText type="error">{errors.password}</HelperText>}
              <TextInput label="Confirmar Contraseña" value={formData.confirmPassword} onChangeText={text => updateFormData('confirmPassword', text)} mode="outlined" secureTextEntry={!showConfirmPassword} style={styles.input} outlineColor={roleColors.productor.primary} activeOutlineColor={roleColors.productor.primary} error={!!errors.confirmPassword} right={<TextInput.Icon icon={showConfirmPassword ? "eye-off" : "eye"} onPress={() => setShowConfirmPassword(!showConfirmPassword)} />} />
              {errors.confirmPassword && <HelperText type="error">{errors.confirmPassword}</HelperText>}
              <Button mode="contained" style={[styles.registerButton, { backgroundColor: roleColors.productor.primary }]} onPress={handleNext}>Siguiente</Button>
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <Text variant="headlineMedium" style={styles.title}>Información de la Finca</Text>
            <View style={{ alignItems: 'center', marginVertical: 12 }}>
              <Button mode="contained" style={{ backgroundColor: roleColors.productor.primary, borderRadius: 20, minWidth: 120 }} onPress={handleBack}>
                Atrás
              </Button>
            </View>
            <View style={styles.form}>
              <TextInput label="Nombre de la Finca" value={formData.nombreFinca} onChangeText={text => updateFormData('nombreFinca', text)} mode="outlined" style={styles.input} outlineColor={roleColors.productor.primary} activeOutlineColor={roleColors.productor.primary} error={!!errors.nombreFinca} placeholder="Ej: Finca El Paraíso" />
              {errors.nombreFinca && <HelperText type="error">{errors.nombreFinca}</HelperText>}
              <TextInput label="Ubicación" value={formData.ubicacionGPS} onChangeText={text => updateFormData('ubicacionGPS', text)} mode="outlined" style={styles.input} outlineColor={roleColors.productor.primary} activeOutlineColor={roleColors.productor.primary} error={!!errors.ubicacionGPS} placeholder="Ubicación GPS Obtenida (Presione Usar GPS)" />
              <Button mode="contained" style={{ backgroundColor: roleColors.productor.primary, borderRadius: 20, marginBottom: 8 }} onPress={handleGetLocation}>Usar GPS</Button>
              {errors.ubicacionGPS && <HelperText type="error">{errors.ubicacionGPS}</HelperText>}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ flex: 1 }}>Tipo de cultivos (3 a 5)</Text>
                <Button mode="contained" style={{ backgroundColor: roleColors.productor.primary, borderRadius: 20 }} onPress={() => setCultivoModalVisible(true)}>Seleccionar</Button>
              </View>
              <Text style={{ marginBottom: 8 }}>{formData.tipoCultivos.length === 0 ? 'Ningún cultivo seleccionado' : formData.tipoCultivos.join(', ')}</Text>
              {errors.tipoCultivos && <HelperText type="error">{errors.tipoCultivos}</HelperText>}

              {/* Modal de selección de cultivos */}
              <Modal visible={cultivoModalVisible} animationType="slide" transparent={true} onRequestClose={handleCloseCultivoModal}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                  <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 16, width: '80%' }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Selecciona de 3 a 5 cultivos</Text>
                    {cultivosOpciones.map(cultivo => (
                      <TouchableOpacity key={cultivo} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }} onPress={() => handleSelectCultivo(cultivo)}>
                        <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: roleColors.productor.primary, backgroundColor: formData.tipoCultivos.includes(cultivo) ? roleColors.productor.primary : 'white', marginRight: 8 }} />
                        <Text>{cultivo}</Text>
                      </TouchableOpacity>
                    ))}
                    <Button mode="contained" style={{ backgroundColor: roleColors.productor.primary, borderRadius: 20, marginTop: 12 }} onPress={handleCloseCultivoModal} disabled={formData.tipoCultivos.length < 3}>Aceptar</Button>
                  </View>
                </View>
              </Modal>
              <TextInput label="Año de experiencia" value={formData.experiencia} onChangeText={text => updateFormData('experiencia', text)} mode="outlined" style={styles.input} outlineColor={roleColors.productor.primary} activeOutlineColor={roleColors.productor.primary} error={!!errors.experiencia} placeholder="Ej: 5" keyboardType="numeric" />
              {errors.experiencia && <HelperText type="error">{errors.experiencia}</HelperText>}
              <TextInput label="Área de cultivo (Hectáreas)" value={formData.areaCultivo} onChangeText={text => updateFormData('areaCultivo', text)} mode="outlined" style={styles.input} outlineColor={roleColors.productor.primary} activeOutlineColor={roleColors.productor.primary} error={!!errors.areaCultivo} placeholder="Ej: 10.5" keyboardType="numeric" />
              {errors.areaCultivo && <HelperText type="error">{errors.areaCultivo}</HelperText>}
              
              {/* Botón final cambiado a CREAR CUENTA */}
              <Button mode="contained" style={[styles.registerButton, { backgroundColor: roleColors.productor.primary }]} onPress={handleRegister} loading={loading} disabled={loading}>Crear cuenta</Button>
            </View>
          </>
        )}

        {/* Barra de progreso ajustada a 2 pasos */}
        <View style={{ flexDirection: 'row', height: 8, marginVertical: 16 }}>
          <View style={{ flex: step, backgroundColor: roleColors.productor.primary, borderRadius: 4 }} />
          <View style={{ flex: 2 - step, backgroundColor: '#D3E6C5', borderRadius: 4 }} />
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 8,
    minHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
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
    maxWidth: 400,
    alignSelf: 'center',
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