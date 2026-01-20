import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import apiClient from '../../services/apiClient';

const MOTIVOS = [
  { value: 'contenido_inapropiado', label: 'Contenido Inapropiado' },
  { value: 'fraude', label: 'Fraude' },
  { value: 'producto_falso', label: 'Producto Falso' },
  { value: 'mala_calidad', label: 'Mala Calidad' },
  { value: 'no_entregado', label: 'No Entregado' },
  { value: 'comportamiento_abusivo', label: 'Comportamiento Abusivo' },
  { value: 'spam', label: 'Spam' },
  { value: 'otro', label: 'Otro' }
];

export default function ReportScreen({ route, navigation }) {
  const { reportado_id, producto_id, pedido_id, tipo_reportado } = route.params || {};

  const [motivo, setMotivo] = useState('contenido_inapropiado');
  const [descripcion, setDescripcion] = useState('');
  const [evidencias, setEvidencias] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    if (evidencias.length >= 5) {
      Alert.alert('Límite alcanzado', 'Solo puedes agregar hasta 5 fotos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setEvidencias([...evidencias, result.assets[0]]);
    }
  };

  const removeImage = (index) => {
    setEvidencias(evidencias.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!descripcion.trim()) {
      Alert.alert('Error', 'Por favor describe el motivo del reporte');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      
      if (reportado_id) formData.append('reportado_id', reportado_id);
      if (producto_id) formData.append('producto_id', producto_id);
      if (pedido_id) formData.append('pedido_id', pedido_id);
      
      formData.append('tipo_reportado', tipo_reportado || 'usuario');
      formData.append('motivo', motivo);
      formData.append('descripcion', descripcion.trim());

      // Agregar evidencias
      evidencias.forEach((evidencia, index) => {
        const filename = evidencia.uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('evidencias[]', {
          uri: evidencia.uri,
          name: filename,
          type: type,
        });
      });

      const response = await apiClient.post('/reportes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        Alert.alert('Éxito', 'Reporte enviado correctamente. El equipo de soporte lo revisará pronto.', [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]);
      }
    } catch (error) {
      console.error('Error al crear reporte:', error);
      Alert.alert('Error', error.response?.data?.message || 'No se pudo enviar el reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon name="alert-octagon" size={48} color="#FF3B30" />
        <Text style={styles.title}>Crear Reporte</Text>
        <Text style={styles.subtitle}>
          Ayúdanos a mantener la comunidad segura reportando contenido o comportamientos inapropiados
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Motivo del Reporte *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={motivo}
            onValueChange={(value) => setMotivo(value)}
            style={styles.picker}
          >
            {MOTIVOS.map((m) => (
              <Picker.Item key={m.value} label={m.label} value={m.value} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Descripción Detallada *</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Describe detalladamente el problema..."
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Evidencias (opcional - máx 5 fotos)</Text>
        <Text style={styles.hint}>Agrega capturas de pantalla o fotos que respalden tu reporte</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.evidenciasScroll}>
          {evidencias.map((evidencia, index) => (
            <View key={index} style={styles.evidenciaContainer}>
              <Image source={{ uri: evidencia.uri }} style={styles.evidenciaImage} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}
              >
                <Icon name="close-circle" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ))}
          
          {evidencias.length < 5 && (
            <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
              <Icon name="camera-plus" size={32} color="#4A90E2" />
              <Text style={styles.addImageText}>Agregar Foto</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Icon name="send" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.submitButtonText}>ENVIAR REPORTE</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.note}>
        * Los reportes son revisados por nuestro equipo de moderación en un plazo de 24-48 horas
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 120,
    backgroundColor: '#fafafa',
  },
  evidenciasScroll: {
    marginTop: 8,
  },
  evidenciaContainer: {
    marginRight: 12,
    position: 'relative',
  },
  evidenciaImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#4A90E2',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
  },
  addImageText: {
    fontSize: 10,
    color: '#4A90E2',
    marginTop: 4,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#FF3B30',
    margin: 20,
    padding: 16,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#ffb3ae',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  note: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 30,
    fontStyle: 'italic',
  },
});
