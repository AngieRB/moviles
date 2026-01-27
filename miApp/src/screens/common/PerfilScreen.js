import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Avatar, TextInput, Button, IconButton, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../../context/AppContext';

// Pantalla de Perfil común para todos los usuarios
export default function PerfilScreen() {
  const { user, updateUser } = useApp();
  const navigation = useNavigation();
  const [editing, setEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    email: user?.email || 'productor@test.com',
    telefono: user?.telefono || '0987654321',
  });
  const [errors, setErrors] = useState({});

  const fincaData = {
    ubicacion: 'Km 15 Vía Portoviejo',
    area: '10.5 Hectáreas',
    experiencia: '15 años',
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.telefono.trim() || !/^[0-9]{10}$/.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono debe tener 10 dígitos numéricos';
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Correo inválido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    console.log('=== handleSave iniciado ===');
    console.log('profileImage:', profileImage);
    console.log('formData:', formData);
    
    if (!validateForm()) {
      console.log('Validación falló');
      return;
    }
    
    console.log('Validación OK, continuando...');
    
    try {
      // Si hay una imagen nueva, subirla primero
      if (profileImage) {
        console.log('Subiendo foto de perfil...');
        const formDataImage = new FormData();
        
        // Crear el objeto de archivo desde la URI
        const filename = profileImage.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formDataImage.append('foto_perfil', {
          uri: profileImage,
          name: filename,
          type: type,
        });
        
        console.log('FormData creado, enviando a /actualizar-foto-perfil');
        
        // Subir la imagen (NO establecer Content-Type, axios lo hace automático con FormData)
        const response = await apiClient.post('/actualizar-foto-perfil', formDataImage);
        
        console.log('Respuesta del servidor:', response.data);
        
        // Actualizar el usuario con la nueva foto
        if (response.data.foto_perfil) {
          console.log('Actualizando usuario con foto_perfil:', response.data.foto_perfil);
          await updateUser({ foto_perfil: response.data.foto_perfil });
          console.log('Usuario actualizado');
        }
        
        setProfileImage(null);
        Alert.alert('Éxito', 'Foto de perfil actualizada correctamente');
      }
      
      // Actualizar otros datos del perfil si es necesario
      if (formData.email !== user.email || formData.telefono !== user.telefono) {
        await updateUser(formData);
      }
      
      setEditing(false);
    } catch (error) {
      console.error('=== ERROR en handleSave ===');
      console.error('Error completo:', error);
      console.error('Error.response:', error.response);
      console.error('Error.message:', error.message);
      Alert.alert('Error', 'No se pudo actualizar el perfil. Intenta de nuevo.');
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permiso denegado', 
          'Necesitas dar permiso para acceder a las fotos. Ve a Configuración de la app para habilitar el permiso.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo abrir la galería. Por favor intenta de nuevo.');
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permiso denegado', 
          'Necesitas dar permiso para usar la cámara. Ve a Configuración de la app para habilitar el permiso.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al tomar foto:', error);
      Alert.alert('Error', 'No se pudo abrir la cámara. Por favor intenta de nuevo.');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Seleccionar foto de perfil',
      'Elige una opción',
      [
        { text: 'Tomar foto', onPress: takePhoto },
        { text: 'Elegir de galería', onPress: pickImage },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content style={styles.headerContent}>
          <TouchableOpacity onPress={showImageOptions} style={styles.avatarContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : user?.foto_perfil ? (
              <Image 
                source={{ uri: `http://192.168.10.243:8000/storage/${user.foto_perfil}` }} 
                style={styles.profileImage} 
              />
            ) : (
              <Avatar.Icon size={100} icon="leaf" style={styles.avatar} />
            )}
            <View style={styles.cameraIconContainer}>
              <IconButton icon="camera" size={24} iconColor="#fff" style={styles.cameraIcon} />
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>
            {user?.nombre || user?.name || 'Usuario'} {user?.apellido || ''}
          </Text>
          <Text style={styles.userRole}>
            {user?.role === 'productor' ? '🌾 Productor Verificado' : '🛒 Consumidor'}
          </Text>
          {user?.role === 'productor' && user?.role_data?.nombreFinca && (
            <Text style={styles.userFinca}>
              {user.role_data.nombreFinca} - {user.role_data.ubicacion || 'Ecuador'}
            </Text>
          )}
          {user?.role === 'consumidor' && user?.role_data?.direccion && (
            <Text style={styles.userFinca}>{user.role_data.direccion}</Text>
          )}
        </Card.Content>
      </Card>

      {/* Mostrar información de la finca solo si es productor */}
      {user?.role === 'productor' && (
        <View style={styles.sectionContainer}>
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Resumen de la Finca</Text>
              <Text style={styles.infoText}>
                Ubicación: {user?.role_data?.ubicacion || fincaData.ubicacion}
              </Text>
              <Text style={styles.infoText}>
                Tipo de productos: {user?.role_data?.tipoProductos || 'Productos agrícolas'}
              </Text>
            </Card.Content>
          </Card>
        </View>
      )}

      <View style={styles.sectionContainer}>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Información de Contacto</Text>
            {editing ? (
              <View>
                <TextInput
                  label="Email"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.email}
                />
                {errors.email && <HelperText type="error">{errors.email}</HelperText>}

                <TextInput
                  label="Teléfono"
                  value={formData.telefono}
                  onChangeText={(text) => setFormData({ ...formData, telefono: text.replace(/[^0-9]/g, '').slice(0, 10) })}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="phone-pad"
                  error={!!errors.telefono}
                />
                {errors.telefono && <HelperText type="error">{errors.telefono}</HelperText>}

                <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
                  Guardar
                </Button>
              </View>
            ) : (
              <View>
                <Text style={styles.infoText}>Email: {formData.email}</Text>
                <Text style={styles.infoText}>Teléfono: {formData.telefono}</Text>
                <IconButton
                  icon="pencil"
                  size={20}
                  onPress={() => setEditing(true)}
                  style={styles.editIcon}
                />
              </View>
            )}
          </Card.Content>
        </Card>
      </View>

      {/* Botón de Mis Reportes */}
      <TouchableOpacity
        style={styles.reportesButton}
        onPress={() => {
          // Para administrador, navegar directamente al Tab de Reportes
          if (user?.role === 'administrador') {
            navigation.navigate('Reportes');
          } else {
            // Para consumidor y productor, navegar al Stack de Reportes
            navigation.navigate('ReportesTab', { screen: 'MisReportes' });
          }
        }}
      >
        <View style={styles.reportesContent}>
          <Icon name="alert-octagon" size={24} color="#FF3B30" style={styles.reportesIcon} />
          <View style={styles.reportesTextContainer}>
            <Text style={styles.reportesTitle}>{user?.role === 'administrador' ? 'Gestionar Reportes' : 'Mis Reportes'}</Text>
            <Text style={styles.reportesSubtitle}>{user?.role === 'administrador' ? 'Administrar reportes del sistema' : 'Ver mis reportes realizados'}</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#999" />
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatar: {
    backgroundColor: '#6B9B37',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6B9B37',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    margin: 0,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  userRole: {
    fontSize: 16,
    color: '#6B9B37',
  },
  userFinca: {
    fontSize: 14,
    color: '#757575',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  card: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    marginBottom: 10,
  },
  saveButton: {
    marginTop: 10,
  },
  editIcon: {
    alignSelf: 'flex-end',
  },
  reportesButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reportesContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  reportesIcon: {
    marginRight: 12,
  },
  reportesTextContainer: {
    flex: 1,
  },
  reportesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reportesSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});