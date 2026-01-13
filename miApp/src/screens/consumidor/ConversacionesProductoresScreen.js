import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import apiClient from '../../services/apiClient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function ConversacionesProductoresScreen() {
  const { user } = useApp();
  const navigation = useNavigation();
  const [chats, setChats] = useState([]);
  const [productores, setProductores] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log('🔍 Render - Chats:', chats.length, '| Productores:', productores.length, '| Loading:', loading);

  // Cargar chats cuando la pantalla está enfocada
  useFocusEffect(
    React.useCallback(() => {
      cargarChats();
    }, [])
  );

  // Actualizar chats cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      actualizarChatsSilencioso();
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const cargarChats = async () => {
    try {
      console.log('🟡 Iniciando cargarChats...');
      setLoading(true);
      console.log('🟡 Llamando a /chats...');
      const response = await apiClient.get('/chats');
      console.log('🟡 Respuesta /chats recibida');
      const chatsObtenidos = response.data.chats || [];
      setChats(chatsObtenidos);
      console.log('🟡 Chats actualizados:', chatsObtenidos.length);
      
      // Cargar productores disponibles
      console.log('🔵 Cargando productores...');
      const resProductores = await apiClient.get('/usuarios?role=productor');
      console.log('✅ Respuesta productores:', resProductores.data);
      const todosProductores = resProductores.data.usuarios || resProductores.data || [];
      console.log('✅ Total productores recibidos:', todosProductores.length);
      
      setProductores(todosProductores);
      console.log('✅ Estado productores actualizado');
    } catch (error) {
      console.error('Error al cargar chats:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
        
        if (error.response.status === 401) {
          Alert.alert(
            'Sesión expirada',
            'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
            [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
          );
          return;
        }
      }
      Alert.alert('Error', 'No se pudieron cargar los chats');
    } finally {
      setLoading(false);
    }
  };

  const actualizarChatsSilencioso = async () => {
    try {
      const response = await apiClient.get('/chats');
      setChats(response.data.chats || []);
    } catch (error) {
      console.error('Error al actualizar chats:', error);
      // Si es 401, no mostramos alerta porque ya se manejó en cargarChats
      if (error.response?.status !== 401) {
        console.error('Error actualizando chats:', error.message);
      }
    }
  };

  const abrirChat = (chat) => {
    navigation.navigate('ChatIndividualProductor', { chat });
  };

  const iniciarChatConProductor = async (productor) => {
    try {
      // Buscar si ya existe un chat con este productor
      const chatExistente = chats.find(
        chat => chat.otro_usuario.id === productor.id
      );

      if (chatExistente) {
        // Si ya existe, abrir ese chat
        abrirChat(chatExistente);
        return;
      }

      // Si no existe, crear uno nuevo
      const response = await apiClient.post('/chats/get-or-create', {
        otro_usuario_id: productor.id
      });

      // Agregar info del otro usuario al chat
      const nuevoChat = {
        ...response.data.chat,
        otro_usuario: {
          id: productor.id,
          nombre: productor.name || productor.nombre,
        }
      };
      
      setChats(prev => [...prev, nuevoChat]);
      abrirChat(nuevoChat);
      
    } catch (error) {
      console.error('Error al iniciar chat:', error);
      Alert.alert('Error', 'No se pudo iniciar el chat');
    }
  };

  const formatearHora = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderChat = ({ item }) => (
    <TouchableOpacity 
      style={styles.chatCard} 
      onPress={() => abrirChat(item)}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.otro_usuario.nombre?.charAt(0).toUpperCase()}
          </Text>
        </View>
        {item.mensajes_no_leidos > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.mensajes_no_leidos}</Text>
          </View>
        )}
      </View>

      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.nombre}>
            {item.otro_usuario.nombre}
          </Text>
          {item.ultimo_mensaje_at && (
            <Text style={[
              styles.hora,
              item.mensajes_no_leidos > 0 && styles.horaNoLeida
            ]}>
              {formatearHora(item.ultimo_mensaje_at)}
            </Text>
          )}
        </View>
        <Text 
          style={[
            styles.ultimoMensaje,
            item.mensajes_no_leidos > 0 && styles.mensajeNoLeido
          ]}
          numberOfLines={1}
        >
          {item.ultimo_mensaje || 'Sin mensajes'}
        </Text>
      </View>

      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  const renderProductor = ({ item }) => {
    const nombreMostrar = item.nombre || item.name || 'Productor';
    const inicial = nombreMostrar.charAt(0).toUpperCase();
    
    return (
      <TouchableOpacity 
        style={styles.productorCard} 
        onPress={() => iniciarChatConProductor(item)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{inicial}</Text>
        </View>
        <View style={styles.productorInfo}>
          <Text style={styles.productorNombre}>{nombreMostrar}</Text>
          <Text style={styles.productorEmail} numberOfLines={1}>
            {item.email || 'Sin email'}
          </Text>
        </View>
        <Ionicons name="chatbubble-outline" size={24} color="#2196F3" />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Cargando conversaciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Sección de Chats Activos */}
        {chats.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chats Activos</Text>
            {chats.map((chat) => (
              <View key={chat.id.toString()}>
                {renderChat({ item: chat })}
              </View>
            ))}
          </View>
        )}

        {/* Sección de Productores Disponibles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Productores Disponibles</Text>
          {productores.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptySectionText}>
                No hay productores disponibles
              </Text>
            </View>
          ) : (
            productores.map((productor) => (
              <View key={productor.id.toString()}>
                {renderProductor({ item: productor })}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 10,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF5252',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  nombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  hora: {
    fontSize: 12,
    color: '#999',
  },
  horaNoLeida: {
    color: '#2196F3',
    fontWeight: '600',
  },
  ultimoMensaje: {
    fontSize: 14,
    color: '#666',
  },
  mensajeNoLeido: {
    fontWeight: 'bold',
    color: '#000',
  },
  arrow: {
    fontSize: 24,
    color: '#ccc',
    marginLeft: 10,
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#E8E8E8',
  },
  productorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  productorInfo: {
    flex: 1,
    marginLeft: 15,
  },
  productorNombre: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  productorEmail: {
    fontSize: 13,
    color: '#666',
  },
  emptySection: {
    padding: 20,
    alignItems: 'center',
  },
  emptySectionText: {
    fontSize: 14,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});
