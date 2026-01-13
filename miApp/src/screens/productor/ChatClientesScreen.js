import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { useApp } from '../../context/AppContext';
import apiClient from '../../services/apiClient';
import { useNotificaciones } from '../../context/NotificacionesContext';

export default function ChatClientesScreen() {
  const { user } = useApp();
  const { marcarMensajesLeidos } = useNotificaciones();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef();

  // Cargar lista de chats del productor
  useEffect(() => {
    cargarChats();
  }, []);

  const cargarChats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/chats', { timeout: 8000 });
      setChats(response.data.chats || []);
      
      // Si hay chats, seleccionar el primero automáticamente
      if (response.data.chats && response.data.chats.length > 0 && !selectedChat) {
        seleccionarChat(response.data.chats[0]);
      }
    } catch (error) {
      if (error.code !== 'ECONNABORTED') {
        console.log('Error al cargar chats');
        Alert.alert('Error', 'No se pudieron cargar los chats');
      }
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar un chat y cargar sus mensajes
  const seleccionarChat = async (chat) => {
    try {
      setSelectedChat(chat);
      const response = await apiClient.get(`/chats/${chat.id}/mensajes`);
      setMensajes(response.data.mensajes || []);
      
      // Marcar mensajes como leídos
      await marcarMensajesLeidos(chat.id);
      
      // Scroll al final de los mensajes
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
      Alert.alert('Error', 'No se pudieron cargar los mensajes');
    }
  };

  // Enviar mensaje
  const enviarMensaje = async () => {
    if (!input.trim() || !selectedChat) return;
    
    const mensajeTexto = input.trim();
    setInput('');
    
    try {
      setSending(true);
      const response = await apiClient.post(`/chats/${selectedChat.id}/mensajes`, {
        mensaje: mensajeTexto,
      });
      
      // Agregar el nuevo mensaje a la lista
      const nuevoMensaje = {
        id: response.data.mensaje?.id || Date.now(),
        mensaje: mensajeTexto,
        user_id: user.id,
        es_mio: true,
        created_at: new Date().toISOString(),
      };
      
      setMensajes(prev => [...prev, nuevoMensaje]);
      
      // Actualizar último mensaje en la lista de chats
      setChats(prev => prev.map(chat => 
        chat.id === selectedChat.id 
          ? { ...chat, ultimo_mensaje: mensajeTexto }
          : chat
      ));
      
      // Scroll al final
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      Alert.alert('Error', 'No se pudo enviar el mensaje');
      // Devolver el texto al input si falló
      setInput(mensajeTexto);
    } finally {
      setSending(false);
    }
  };

  // Recargar mensajes cada cierto tiempo (polling simple)
  useEffect(() => {
    if (!selectedChat) return;
    
    const interval = setInterval(async () => {
      try {
        const response = await apiClient.get(`/chats/${selectedChat.id}/mensajes`);
        const nuevosMensajes = response.data.mensajes || [];
        
        // Solo actualizar si hay cambios
        if (nuevosMensajes.length !== mensajes.length) {
          setMensajes(nuevosMensajes);
        }
      } catch (error) {
        console.error('Error al actualizar mensajes:', error);
      }
    }, 3000); // Cada 3 segundos
    
    return () => clearInterval(interval);
  }, [selectedChat, mensajes.length]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Cargando chats...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Chat con Clientes</Text>
        
        {/* Lista de conversaciones */}
        <View style={styles.chatListContainer}>
          <Text style={styles.subTitle}>Conversaciones:</Text>
          {chats.length === 0 ? (
            <Text style={styles.emptyText}>No tienes conversaciones activas</Text>
          ) : (
            <FlatList
              horizontal
              data={chats}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.chatItem, 
                    selectedChat?.id === item.id && styles.chatItemSelected
                  ]}
                  onPress={() => seleccionarChat(item)}
                >
                  <Text style={styles.chatItemName}>{item.otro_usuario.nombre}</Text>
                  <Text style={styles.chatItemRole}>
                    {item.otro_usuario.role === 'consumidor' ? '🛒' : '🌾'}
                  </Text>
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
            />
          )}
        </View>

        {/* Mensajes */}
        <View style={styles.messagesContainer}>
          {!selectedChat ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Selecciona una conversación</Text>
            </View>
          ) : (
            <>
              <View style={styles.chatHeader}>
                <Text style={styles.chatHeaderText}>
                  {selectedChat.otro_usuario.nombre}
                </Text>
              </View>
              
              <FlatList
                ref={flatListRef}
                data={mensajes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View 
                    style={[
                      styles.messageBubble, 
                      item.es_mio ? styles.messageOut : styles.messageIn
                    ]}
                  >
                    <Text style={[
                      styles.messageText,
                      item.es_mio && styles.messageTextOut
                    ]}>
                      {item.mensaje}
                    </Text>
                    <Text style={[
                      styles.messageTime,
                      item.es_mio && styles.messageTimeOut
                    ]}>
                      {new Date(item.created_at).toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Text>
                  </View>
                )}
                contentContainerStyle={{ 
                  flexGrow: 1, 
                  paddingVertical: 10,
                  paddingHorizontal: 10,
                }}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No hay mensajes aún</Text>
                    <Text style={styles.emptySubText}>Envía el primer mensaje</Text>
                  </View>
                }
              />
              
              {/* Input de mensaje */}
              <View style={styles.inputContainer}>
                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder="Escribe un mensaje..."
                  style={styles.input}
                  multiline
                  maxLength={1000}
                />
                <TouchableOpacity 
                  style={[
                    styles.sendButton,
                    (!input.trim() || sending) && styles.sendButtonDisabled
                  ]}
                  onPress={enviarMensaje}
                  disabled={!input.trim() || sending}
                >
                  {sending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.sendButtonText}>➤</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginLeft: 10,
  },
  chatListContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  chatItem: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatItemSelected: {
    backgroundColor: '#4CAF50',
  },
  chatItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 5,
  },
  chatItemRole: {
    fontSize: 16,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatHeader: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  chatHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 5,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 15,
    marginVertical: 4,
    maxWidth: '75%',
  },
  messageIn: {
    backgroundColor: '#e8e8e8',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageOut: {
    backgroundColor: '#4CAF50',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#000',
  },
  messageTextOut: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageTimeOut: {
    color: '#e8f5e9',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
});
