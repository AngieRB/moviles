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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import apiClient from '../../services/apiClient';
import { useNotificaciones } from '../../context/NotificacionesContext';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function ChatIndividualClienteScreen() {
  const { user } = useApp();
  const { marcarMensajesLeidos } = useNotificaciones();
  const route = useRoute();
  const navigation = useNavigation();
  const { chat } = route.params;
  
  const [mensajes, setMensajes] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef();

  // Cargar mensajes al iniciar
  useEffect(() => {
    cargarMensajes();
    // Configurar título de la pantalla
    navigation.setOptions({
      title: chat.otro_usuario.nombre,
    });
  }, []);

  const cargarMensajes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/chats/${chat.id}/mensajes`);
      const mensajesCargados = response.data.mensajes || [];
      setMensajes(mensajesCargados);
      
      // Marcar mensajes como leídos
      await marcarMensajesLeidos(chat.id);
      
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
      Alert.alert('Error', 'No se pudieron cargar los mensajes');
    } finally {
      setLoading(false);
    }
  };

  // Scroll al final cuando se cargan los mensajes
  useEffect(() => {
    if (mensajes.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 300);
    }
  }, [mensajes.length]);

  // Enviar mensaje
  const enviarMensaje = async () => {
    if (!input.trim()) return;
    
    const mensajeTexto = input.trim();
    setInput('');
    
    try {
      setSending(true);
      const response = await apiClient.post(`/chats/${chat.id}/mensajes`, {
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
    const interval = setInterval(async () => {
      try {
        const response = await apiClient.get(`/chats/${chat.id}/mensajes`);
        const nuevosMensajes = response.data.mensajes || [];
        
        // Solo actualizar si hay cambios
        if (nuevosMensajes.length !== mensajes.length) {
          setMensajes(nuevosMensajes);
          // Marcar como leídos
          await marcarMensajesLeidos(chat.id);
        }
      } catch (error) {
        console.error('Error al actualizar mensajes:', error);
      }
    }, 3000); // Cada 3 segundos
    
    return () => clearInterval(interval);
  }, [mensajes.length]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Cargando mensajes...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#4CAF50' }} edges={['top']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
        {/* Header con nombre del usuario */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {chat.otro_usuario.nombre?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.headerTitle}>{chat.otro_usuario.nombre}</Text>
        </View>
        
        {/* Lista de mensajes */}
        <FlatList
          ref={flatListRef}
          data={mensajes}
          keyExtractor={(item) => item.id.toString()}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
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
            </View>
          )}
          contentContainerStyle={{ 
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
      </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E8E8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8E8E8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
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
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageOut: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#000',
  },
  messageTextOut: {
    color: '#000',
  },
  messageTime: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageTimeOut: {
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'android' ? 8 : 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
    color: '#000',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
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
