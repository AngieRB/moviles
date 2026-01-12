import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
// IMPORTANTE: Importamos Modal como RNModal
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity, 
  Modal as RNModal,
  Alert 
} from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { roleColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient from '../services/apiClient';

export default function RegisterConsumidor({ navigation }) {
  const role = 'consumidor';
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    cedula: '',
    telefono: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilePhoto: null,
    base64Image: null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const pickProfilePhoto = () => {
    setImageModalVisible(true);
  };

  const handleImageOption = async (option) => {
    setImageModalVisible(false);
    let result;
    try {
      if (option === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso', 'Se necesita acceso a la cámara');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.5,
          base64: true,
        });
      } else if (option === 'gallery') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso', 'Se necesita acceso a la galería');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.5,
          base64: true,
        });
      }
    } catch (error) {
      console.error('Error imagen:', error);
      return;
    }
    
    if (result && !result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setProfilePhoto(asset.uri);
      setFormData(prev => ({ 
          ...prev, 
          profilePhoto: asset.uri,
          base64Image: asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : null
      }));
    }
  };

  const updateFormData = (key, value) => {
    // FILTRO ESTRICTO: Solo permite números para cédula y teléfono
    if (key === 'cedula' || key === 'telefono') {
        value = value.replace(/[^0-9]/g, '');
    }

    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    
    // VALIDACIÓN CÉDULA (10 DÍGITOS EXACTOS)
    if (!formData.cedula.trim()) {
        newErrors.cedula = 'La cédula es requerida';
    } else if (formData.cedula.length !== 10) {
        newErrors.cedula = 'La cédula debe tener 10 dígitos';
    }

    // VALIDACIÓN TELÉFONO (10 DÍGITOS EXACTOS)
    if (!formData.telefono.trim()) {
        newErrors.telefono = 'El teléfono es requerido';
    } else if (formData.telefono.length !== 10) {
        newErrors.telefono = 'El teléfono debe tener 10 dígitos';
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
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Debe contener letras y números';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- FUNCIÓN DE REGISTRO CORREGIDA ---
  const handleRegister = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
        const payload = {
            // CORRECCIÓN 1: Usamos 'name' en lugar de 'nombre' para Laravel
            name: formData.name.split(" ")[0] || formData.name, 
            apellido: formData.name.split(" ").slice(1).join(" ") || formData.name, 
            cedula: formData.cedula,
            telefono: formData.telefono,
            email: formData.email,
            password: formData.password,
            password_confirmation: formData.confirmPassword,
            role: 'consumidor',
            avatar: formData.base64Image || null 
        };

        // CORRECCIÓN 2: Ruta específica '/register-consumidor'
        await apiClient.post('/register-consumidor', payload);
        
        setLoading(false);
        
        Alert.alert(
            '¡Éxito!',
            'Cuenta creada exitosamente. Ahora puedes iniciar sesión.',
            [{ text: 'Ir al Login', onPress: () => navigation.navigate('Login', { role }) }]
        );

    } catch (error) {
        setLoading(false);
        console.log(error);
        
        let msg = 'Error al registrarse';
        if (error.response) {
            if (error.response.status === 404) {
                msg = 'Error de conexión: Ruta no encontrada en el servidor.';
            } else if (error.response.data?.errors) {
                // Mensaje detallado de validación del servidor
                const serverErrors = Object.values(error.response.data.errors).flat();
                msg = serverErrors.join('\n');
            } else if (error.response.data?.message) {
                msg = error.response.data.message;
            }
        }
        
        Alert.alert('Error', msg);
    }
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
          <Text style={{ marginBottom: 8, fontWeight: 'bold' }}>Foto de perfil</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Button mode="contained" style={{ backgroundColor: roleColors[role].primary, borderRadius: 20 }} onPress={pickProfilePhoto}>Subir Foto</Button>
            <Text style={{ marginLeft: 8, flex: 1 }}>{formData.profilePhoto ? 'Imagen seleccionada' : 'Opcional'}</Text>
          </View>
          {errors.profilePhoto && <HelperText type="error">{errors.profilePhoto}</HelperText>}
                
          <RNModal visible={imageModalVisible} transparent animationType="fade" onRequestClose={() => setImageModalVisible(false)}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
              <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 16, width: '80%', alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>Selecciona una opción</Text>
                <Button mode="contained" style={{ backgroundColor: roleColors[role].primary, borderRadius: 20, marginBottom: 12, minWidth: 180 }} onPress={() => handleImageOption('camera')}>Tomar foto</Button>
                <Button mode="contained" style={{ backgroundColor: roleColors[role].primary, borderRadius: 20, minWidth: 180 }} onPress={() => handleImageOption('gallery')}>Seleccionar de galería</Button>
                {formData.profilePhoto && (
                  <Button mode="contained" style={{ backgroundColor: roleColors[role].primary, borderRadius: 20, marginTop: 16, minWidth: 180 }} onPress={() => setImageModalVisible(false)}>
                    Confirmar imagen
                  </Button>
                )}
                <Button mode="text" style={{ marginTop: 16 }} onPress={() => setImageModalVisible(false)}>Cancelar</Button>
              </View>
            </View>
          </RNModal>

          <TextInput 
            label="Nombre Completo" 
            value={formData.name} 
            onChangeText={text => updateFormData('name', text)} 
            mode="outlined" 
            style={styles.input} 
            outlineColor={roleColors[role].primary} 
            activeOutlineColor={roleColors[role].primary} 
            error={!!errors.name} 
          />
          {errors.name && <HelperText type="error">{errors.name}</HelperText>}
          
          <TextInput 
            label="Cédula" 
            value={formData.cedula} 
            onChangeText={text => updateFormData('cedula', text)} 
            mode="outlined" 
            style={styles.input} 
            outlineColor={roleColors[role].primary} 
            activeOutlineColor={roleColors[role].primary} 
            error={!!errors.cedula} 
            keyboardType="numeric" 
            maxLength={10} 
          />
          {errors.cedula && <HelperText type="error">{errors.cedula}</HelperText>}
          
          <TextInput 
            label="Teléfono/WhatsApp" 
            value={formData.telefono} 
            onChangeText={text => updateFormData('telefono', text)} 
            mode="outlined" 
            style={styles.input} 
            outlineColor={roleColors[role].primary} 
            activeOutlineColor={roleColors[role].primary} 
            error={!!errors.telefono} 
            keyboardType="phone-pad" 
            maxLength={10} 
          />
          {errors.telefono && <HelperText type="error">{errors.telefono}</HelperText>}
          
          <TextInput 
            label="Correo" 
            value={formData.email} 
            onChangeText={text => updateFormData('email', text)} 
            mode="outlined" 
            style={styles.input} 
            outlineColor={roleColors[role].primary} 
            activeOutlineColor={roleColors[role].primary} 
            error={!!errors.email} 
            autoCapitalize="none" 
            keyboardType="email-address" 
          />
          {errors.email && <HelperText type="error">{errors.email}</HelperText>}
          
          <TextInput 
            label="Contraseña" 
            value={formData.password} 
            onChangeText={text => updateFormData('password', text)} 
            mode="outlined" 
            secureTextEntry={!showPassword} 
            style={styles.input} 
            outlineColor={roleColors[role].primary} 
            activeOutlineColor={roleColors[role].primary} 
            error={!!errors.password} 
            right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />} 
          />
          {errors.password && <HelperText type="error">{errors.password}</HelperText>}
          
          <TextInput 
            label="Confirmar Contraseña" 
            value={formData.confirmPassword} 
            onChangeText={text => updateFormData('confirmPassword', text)} 
            mode="outlined" 
            secureTextEntry={!showConfirmPassword} 
            style={styles.input} 
            outlineColor={roleColors[role].primary} 
            activeOutlineColor={roleColors[role].primary} 
            error={!!errors.confirmPassword} 
            right={<TextInput.Icon icon={showConfirmPassword ? "eye-off" : "eye"} onPress={() => setShowConfirmPassword(!showConfirmPassword)} />} 
          />
          {errors.confirmPassword && <HelperText type="error">{errors.confirmPassword}</HelperText>}
          
          <Button 
            mode="contained" 
            style={[styles.registerButton, { backgroundColor: roleColors[role].primary }]} 
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
          >
            Registrarse
          </Button>
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