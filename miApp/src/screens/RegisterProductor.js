import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform, Modal, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { roleColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export default function RegisterProductor({ navigation }) {
  const role = 'productor';
  const { registerUser } = useApp();

  const [formData, setFormData] = useState({
    nombre: '',
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
    fotoCedula: null,
    fotoFinca: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [cultivoModalVisible, setCultivoModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [imageField, setImageField] = useState(null);

  const cultivosOpciones = ['Maíz', 'Cacao', 'Café', 'Verde', 'Tomate', 'Naranja', 'Banano', 'Otros'];

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
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
    if (!formData.nombreFinca.trim()) newErrors.nombreFinca = 'El nombre de la finca es requerido';
    if (!formData.ubicacionGPS.trim()) newErrors.ubicacionGPS = 'La ubicación es requerida';
    if (formData.tipoCultivos.length < 3) newErrors.tipoCultivos = 'Selecciona de 3 a 5 cultivos';
    if (!formData.experiencia.trim()) newErrors.experiencia = 'Año de experiencia requerido';
    if (!formData.areaCultivo.trim()) newErrors.areaCultivo = 'Área de cultivo requerida';
    if (!formData.fotoCedula) newErrors.fotoCedula = 'Foto de cédula requerida';
    if (!formData.fotoFinca) newErrors.fotoFinca = 'Foto de finca requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

  const handleSelectCultivo = (cultivo) => {
    let seleccionados = formData.tipoCultivos.includes(cultivo)
      ? formData.tipoCultivos.filter(c => c !== cultivo)
      : [...formData.tipoCultivos, cultivo];
    if (seleccionados.length <= 5) {
      updateFormData('tipoCultivos', seleccionados);
    }
  };

  const handleImageOption = async (option) => {
    let result;
    if (option === 'camera') {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaType.IMAGE,
        allowsEditing: true,
        quality: 0.7,
      });
    } else if (option === 'gallery') {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.IMAGE,
        allowsEditing: true,
        quality: 0.7,
      });
    }
    setImageModalVisible(false);
    if (result && !result.canceled && result.assets && result.assets.length > 0) {
      updateFormData(imageField, result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    const userData = {
      nombre: formData.nombre,
      cedula: formData.cedula,
      telefono: formData.telefono,
      email: formData.email,
      password: formData.password,
      role: role,
    };

    registerUser(userData);
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

        <Text variant="headlineMedium" style={styles.title}>Registro Productor</Text>
        <View style={styles.form}>
          <TextInput label="Nombre Completo" value={formData.nombre} onChangeText={text => updateFormData('nombre', text)} mode="outlined" style={styles.input} outlineColor={roleColors[role].primary} activeOutlineColor={roleColors[role].primary} error={!!errors.nombre} />
          {errors.nombre && <HelperText type="error">{errors.nombre}</HelperText>}
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
          <TextInput label="Nombre de la Finca" value={formData.nombreFinca} onChangeText={text => updateFormData('nombreFinca', text)} mode="outlined" style={styles.input} outlineColor={roleColors[role].primary} activeOutlineColor={roleColors[role].primary} error={!!errors.nombreFinca} />
          {errors.nombreFinca && <HelperText type="error">{errors.nombreFinca}</HelperText>}
          <TextInput label="Ubicación GPS" value={formData.ubicacionGPS} onChangeText={text => updateFormData('ubicacionGPS', text)} mode="outlined" style={styles.input} outlineColor={roleColors[role].primary} activeOutlineColor={roleColors[role].primary} error={!!errors.ubicacionGPS} />
          <Button mode="contained" style={{ backgroundColor: roleColors[role].primary }} onPress={handleGetLocation}>Obtener GPS</Button>
          {errors.ubicacionGPS && <HelperText type="error">{errors.ubicacionGPS}</HelperText>}
          <TextInput label="Año de experiencia" value={formData.experiencia} onChangeText={text => updateFormData('experiencia', text)} mode="outlined" style={styles.input} outlineColor={roleColors[role].primary} activeOutlineColor={roleColors[role].primary} error={!!errors.experiencia} />
          {errors.experiencia && <HelperText type="error">{errors.experiencia}</HelperText>}
          <TextInput label="Área de cultivo" value={formData.areaCultivo} onChangeText={text => updateFormData('areaCultivo', text)} mode="outlined" style={styles.input} outlineColor={roleColors[role].primary} activeOutlineColor={roleColors[role].primary} error={!!errors.areaCultivo} />
          {errors.areaCultivo && <HelperText type="error">{errors.areaCultivo}</HelperText>}
          <Button mode="contained" style={{ backgroundColor: roleColors[role].primary }} onPress={() => setCultivoModalVisible(true)}>Seleccionar Cultivos</Button>
          <Modal visible={cultivoModalVisible} transparent animationType="slide">
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
                {cultivosOpciones.map(cultivo => (
                  <TouchableOpacity key={cultivo} onPress={() => handleSelectCultivo(cultivo)}>
                    <Text>{cultivo}</Text>
                  </TouchableOpacity>
                ))}
                <Button onPress={() => setCultivoModalVisible(false)}>Cerrar</Button>
              </View>
            </View>
          </Modal>
          <Button mode="contained" style={{ backgroundColor: roleColors[role].primary }} onPress={() => pickImage('fotoCedula')}>Subir Foto Cédula</Button>
          <Button mode="contained" style={{ backgroundColor: roleColors[role].primary }} onPress={() => pickImage('fotoFinca')}>Subir Foto Finca</Button>
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