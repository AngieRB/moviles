import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image
} from 'react-native';
import {
  Text,
  Button,
  TextInput,
  Card,
  Chip,
  ActivityIndicator,
  useTheme,
  SegmentedButtons,
  Menu,
  Divider as PaperDivider
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '../services/apiClient';

const CrearReporteScreen = ({ route, navigation }) => {
  const { reportadoId, reportadoNombre, pedidoId: pedidoIdParam, productoId: productoIdParam } = route.params || {};
  const theme = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [tipoReportado, setTipoReportado] = useState(
    pedidoIdParam ? 'pedido' : productoIdParam ? 'producto' : 'usuario'
  );
  const [motivo, setMotivo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [evidencias, setEvidencias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(productoIdParam || null);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(pedidoIdParam || null);
  const [loadingDatos, setLoadingDatos] = useState(false);

  // Configurar header con botón de retroceso
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity 
          onPress={() => navigation.navigate('MisReportes')} 
          style={{ paddingLeft: 16, paddingRight: 24, paddingVertical: 8 }}
        >
          <Text style={{ fontSize: 28, color: '#fff', fontWeight: 'bold' }}>←</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Auto-cargar datos del pedido o producto si vienen como parámetros
  useEffect(() => {
    if (pedidoIdParam) {
      cargarPedidos();
    } else if (productoIdParam) {
      cargarProductos();
    }
  }, []);

  // Cargar productos o pedidos según el tipo seleccionado
  useEffect(() => {
    if (tipoReportado === 'producto' && !productoIdParam) {
      cargarProductos();
    } else if (tipoReportado === 'pedido' && !pedidoIdParam) {
      cargarPedidos();
    }
  }, [tipoReportado]);

  const cargarProductos = async () => {
    try {
      setLoadingDatos(true);
      const response = await apiClient.get('/productos');
      setProductos(response.data.productos || response.data || []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoadingDatos(false);
    }
  };

  const cargarPedidos = async () => {
    try {
      setLoadingDatos(true);
      const response = await apiClient.get('/mis-pedidos');
      setPedidos(response.data.pedidos || response.data || []);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    } finally {
      setLoadingDatos(false);
    }
  };

  // Motivos según el tipo de reportado
  const motivosConsumidor = [
    { value: 'producto_defectuoso', label: 'Producto defectuoso', icon: 'package-variant-closed' },
    { value: 'cobro_indebido', label: 'Cobro indebido', icon: 'cash-remove' },
    { value: 'incumplimiento_entrega', label: 'Incumplimiento de entrega', icon: 'truck-delivery' },
    { value: 'producto_diferente', label: 'Producto diferente al anunciado', icon: 'package-variant' },
    { value: 'comportamiento_inadecuado', label: 'Comportamiento inadecuado', icon: 'account-alert' },
    { value: 'fraude_proveedor', label: 'Fraude del proveedor', icon: 'alert-circle' }
  ];

  const motivosProveedor = [
    { value: 'pedido_fraudulento', label: 'Pedido fraudulento', icon: 'alert-octagon' },
    { value: 'pago_no_realizado', label: 'Pago no realizado', icon: 'cash-remove' },
    { value: 'devolucion_injustificada', label: 'Devolución injustificada', icon: 'package-variant-closed-remove' },
    { value: 'abuso_consumidor', label: 'Abuso del consumidor', icon: 'account-cancel' }
  ];

  const motivosGenerales = [
    { value: 'informacion_falsa', label: 'Información falsa', icon: 'alert-decagram' },
    { value: 'otro', label: 'Otro', icon: 'dots-horizontal' }
  ];

  // Obtener motivos según tipo
  const getMotivos = () => {
    // Determinar rol del reportado
    const todosMotivos = [...motivosConsumidor, ...motivosProveedor, ...motivosGenerales];
    return todosMotivos;
  };

  // Seleccionar evidencias (fotos)
  const seleccionarEvidencias = async () => {
    if (evidencias.length >= 5) {
      Alert.alert('Límite alcanzado', 'Puedes subir máximo 5 evidencias');
      return;
    }

    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tus fotos para subir evidencias');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      aspect: [4, 3]
    });

    if (!resultado.canceled) {
      const nuevasEvidencias = resultado.assets.slice(0, 5 - evidencias.length);
      setEvidencias([...evidencias, ...nuevasEvidencias]);
    }
  };

  // Tomar foto
  const tomarFoto = async () => {
    if (evidencias.length >= 5) {
      Alert.alert('Límite alcanzado', 'Puedes subir máximo 5 evidencias');
      return;
    }

    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara');
      return;
    }

    const resultado = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      aspect: [4, 3]
    });

    if (!resultado.canceled) {
      setEvidencias([...evidencias, resultado.assets[0]]);
    }
  };

  // Eliminar evidencia
  const eliminarEvidencia = (index) => {
    const nuevasEvidencias = evidencias.filter((_, i) => i !== index);
    setEvidencias(nuevasEvidencias);
  };

  // Enviar reporte
  const enviarReporte = async () => {
    // Validaciones
    if (!motivo) {
      Alert.alert('Error', 'Debes seleccionar un motivo');
      return;
    }

    if (!descripcion || descripcion.trim().length < 20) {
      Alert.alert('Error', 'La descripción debe tener al menos 20 caracteres');
      return;
    }

    if (evidencias.length === 0) {
      Alert.alert(
        'Sin evidencias',
        '¿Deseas enviar el reporte sin evidencias? Es recomendable incluir pruebas.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Enviar sin evidencias', onPress: () => submitReporte() }
        ]
      );
      return;
    }

    submitReporte();
  };

  // Enviar reporte al backend
  const submitReporte = async () => {
    setLoading(true);

    try {
      const formData = new FormData();
      
      // Solo agregar reportado_id si existe y no es undefined
      if (reportadoId) {
        formData.append('reportado_id', reportadoId);
      }
      
      formData.append('tipo_reportado', tipoReportado);
      formData.append('motivo', motivo);
      formData.append('descripcion', descripcion.trim());
      
      if (pedidoSeleccionado) formData.append('pedido_id', pedidoSeleccionado);
      if (productoSeleccionado) formData.append('producto_id', productoSeleccionado);

      // Agregar evidencias
      evidencias.forEach((evidencia, index) => {
        formData.append('evidencias[]', {
          uri: evidencia.uri,
          type: 'image/jpeg',
          name: `evidencia_${index}.jpg`
        });
      });

      const response = await apiClient.post('/reportes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      Alert.alert(
        'Reporte enviado',
        'Tu reporte ha sido enviado exitosamente. El equipo de administración lo revisará pronto.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error al enviar reporte:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'No se pudo enviar el reporte. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Información del reportado si existe */}
      {reportadoNombre && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Reportando a: <Text style={styles.bold}>{reportadoNombre}</Text>
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Tipo de reporte */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>¿Qué vas a reportar?</Text>
          <SegmentedButtons
            value={tipoReportado}
            onValueChange={setTipoReportado}
            buttons={[
              { value: 'usuario', label: 'Usuario' },
              { value: 'producto', label: 'Producto' },
              { value: 'pedido', label: 'Pedido' }
            ]}
            style={styles.segmentedButtons}
          />
          
          {/* Selector de producto */}
          {tipoReportado === 'producto' && !productoIdParam && (
            <View style={styles.selectorContainer}>
              {loadingDatos ? (
                <ActivityIndicator />
              ) : productos.length === 0 ? (
                <Text variant="bodySmall" style={styles.warningText}>
                  No tienes productos disponibles para reportar
                </Text>
              ) : (
                <>
                  <Text variant="bodySmall" style={styles.label}>Selecciona el producto:</Text>
                  <ScrollView horizontal style={styles.productosScroll} showsHorizontalScrollIndicator={false}>
                    {productos.map((prod) => (
                      <Chip
                        key={prod.id}
                        selected={productoSeleccionado === prod.id}
                        onPress={() => setProductoSeleccionado(prod.id)}
                        style={[
                          styles.productoChip,
                          productoSeleccionado === prod.id && { backgroundColor: theme.colors.primary }
                        ]}
                        textStyle={productoSeleccionado === prod.id && { color: '#fff' }}
                      >
                        {prod.nombre}
                      </Chip>
                    ))}
                  </ScrollView>
                </>
              )}
            </View>
          )}

          {/* Selector de pedido */}
          {tipoReportado === 'pedido' && !pedidoIdParam && (
            <View style={styles.selectorContainer}>
              {loadingDatos ? (
                <ActivityIndicator />
              ) : pedidos.length === 0 ? (
                <Text variant="bodySmall" style={styles.warningText}>
                  No tienes pedidos disponibles para reportar
                </Text>
              ) : (
                <>
                  <Text variant="bodySmall" style={styles.label}>Selecciona el pedido:</Text>
                  <ScrollView horizontal style={styles.productosScroll} showsHorizontalScrollIndicator={false}>
                    {pedidos.map((ped) => (
                      <Chip
                        key={ped.id}
                        selected={pedidoSeleccionado === ped.id}
                        onPress={() => setPedidoSeleccionado(ped.id)}
                        style={[
                          styles.productoChip,
                          pedidoSeleccionado === ped.id && { backgroundColor: theme.colors.primary }
                        ]}
                        textStyle={pedidoSeleccionado === ped.id && { color: '#fff' }}
                      >
                        Pedido #{ped.id} - {ped.estado}
                      </Chip>
                    ))}
                  </ScrollView>
                </>
              )}
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Motivo */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Motivo *</Text>
          <Text variant="bodySmall" style={styles.hint}>
            Selecciona el motivo que mejor describe tu reporte
          </Text>
          <View style={styles.motivosContainer}>
            {getMotivos().map((m) => (
              <Chip
                key={m.value}
                selected={motivo === m.value}
                onPress={() => setMotivo(m.value)}
                style={[
                  styles.chip,
                  motivo === m.value && { backgroundColor: theme.colors.primary }
                ]}
                textStyle={motivo === m.value && { color: '#fff' }}
                icon={m.icon}
              >
                {m.label}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Descripción */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Descripción *</Text>
          <Text variant="bodySmall" style={styles.hint}>
            Describe detalladamente lo sucedido (mínimo 20 caracteres)
          </Text>
          <TextInput
            mode="outlined"
            placeholder="Explica con detalle lo que sucedió..."
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            numberOfLines={6}
            maxLength={1000}
            style={styles.textArea}
          />
          <Text variant="bodySmall" style={styles.charCount}>
            {descripcion.length}/1000 caracteres
          </Text>
        </Card.Content>
      </Card>

      {/* Evidencias */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Evidencias ({evidencias.length}/5)
          </Text>
          <Text variant="bodySmall" style={styles.hint}>
            Sube fotos que respalden tu reporte (opcional pero recomendado)
          </Text>

          {/* Botones para agregar evidencias */}
          <View style={styles.botonesEvidencia}>
            <Button
              mode="contained-tonal"
              icon="camera"
              onPress={tomarFoto}
              style={styles.botonEvidencia}
              disabled={evidencias.length >= 5}
            >
              Tomar foto
            </Button>
            <Button
              mode="contained-tonal"
              icon="image"
              onPress={seleccionarEvidencias}
              style={styles.botonEvidencia}
              disabled={evidencias.length >= 5}
            >
              Galería
            </Button>
          </View>

          {/* Mostrar evidencias seleccionadas */}
          {evidencias.length > 0 && (
            <View style={styles.evidenciasGrid}>
              {evidencias.map((evidencia, index) => (
                <View key={index} style={styles.evidenciaItem}>
                  <Image
                    source={{ uri: evidencia.uri }}
                    style={styles.evidenciaImagen}
                  />
                  <TouchableOpacity
                    style={styles.eliminarEvidencia}
                    onPress={() => eliminarEvidencia(index)}
                  >
                    <Text style={styles.eliminarTexto}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Botón enviar */}
      <Button
        mode="contained"
        onPress={enviarReporte}
        loading={loading}
        disabled={loading || !motivo || descripcion.length < 20}
        style={styles.botonEnviar}
        contentStyle={styles.botonEnviarContent}
      >
        {loading ? 'Enviando reporte...' : 'Enviar reporte'}
      </Button>

      <Text variant="bodySmall" style={styles.disclaimer}>
        Al enviar este reporte, aceptas que la información proporcionada es verídica.
        Los reportes falsos pueden resultar en sanciones.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32
  },
  card: {
    marginBottom: 16,
    elevation: 2
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8
  },
  subtitle: {
    color: '#666'
  },
  bold: {
    fontWeight: 'bold',
    color: '#000'
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 8
  },
  hint: {
    color: '#666',
    marginBottom: 12
  },
  segmentedButtons: {
    marginTop: 8
  },
  motivosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8
  },
  chip: {
    marginRight: 8,
    marginBottom: 8
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top'
  },
  charCount: {
    textAlign: 'right',
    color: '#666',
    marginTop: 4
  },
  botonesEvidencia: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 16
  },
  botonEvidencia: {
    flex: 1
  },
  evidenciasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  evidenciaItem: {
    position: 'relative',
    width: 100,
    height: 100
  },
  evidenciaImagen: {
    width: '100%',
    height: '100%',
    borderRadius: 8
  },
  eliminarEvidencia: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#f44336',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3
  },
  eliminarTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  botonEnviar: {
    marginTop: 8,
    marginBottom: 16
  },
  botonEnviarContent: {
    paddingVertical: 8
  },
  disclaimer: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    paddingHorizontal: 16
  },
  warningText: {
    color: '#FF9800',
    marginTop: 8,
    fontStyle: 'italic'
  },
  selectorContainer: {
    marginTop: 12
  },
  productosScroll: {
    marginTop: 8
  },
  productoChip: {
    marginRight: 8
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600'
  }
});

export default CrearReporteScreen;
