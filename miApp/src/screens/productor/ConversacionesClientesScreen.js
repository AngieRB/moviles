import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { useApp } from '../../context/AppContext';
import apiClient from '../../services/apiClient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function ConversacionesClientesScreen() {
  const { user } = useApp();
  const navigation = useNavigation();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar chats cuando la pantalla está enfocada
  useFocusEffect(
    React.useCallback(() => {
      cargarChats();
    }, [])
  );

  // Actualizar chats cada 3 segundos mientras la pantalla está visible
  useEffect(() => {
    const interval = setInterval(() => {
      actualizarChatsSilencioso();
    }, 3000); // Cada 3 segundos
    
    return () => clearInterval(interval);
  }, []);

  const cargarChats = async () => {
    try {
      if (loading) return; // Evitar múltiples cargas simultáneas
      setLoading(true);
      const response = await apiClient.get('/chats');
      setChats(response.data.chats || []);
    } catch (error) {
      console.error('Error al cargar chats:', error);
      Alert.alert('Error', 'No se pudieron cargar los chats');
    } finally {
      setLoading(false);
    }
  };

  const actualizarChatsSilencioso = async () => {
    try {
      const response = await apiClient.get('/chats', { timeout: 5000 });
      setChats(response.data.chats || []);
    } catch (error) {
      // Manejo silencioso - no mostrar errores de timeout o red
      if (error.code !== 'ECONNABORTED' && error.code !== 'ERR_NETWORK') {
        console.log('Error actualizando chats (no crítico)');
      }
    }
  };

  const abrirChat = (chat) => {
    navigation.navigate('ChatIndividualCliente', { chat });
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Cargando conversaciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>📭</Text>
          <Text style={styles.emptyTitle}>No hay conversaciones</Text>
          <Text style={styles.emptySubtitle}>
            Tus clientes podrán contactarte desde tus productos
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={item => item.id.toString()}
          renderItem={renderChat}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#4CAF50',
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
    backgroundColor: '#4CAF50',
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
  nombreNoLeido: {
    fontWeight: 'bold',
  },
  hora: {
    fontSize: 12,
    color: '#999',
  },
  horaNoLeida: {
    color: '#4CAF50',
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
