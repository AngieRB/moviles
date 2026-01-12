import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import { Appbar, Avatar, Card, IconButton, ActivityIndicator } from 'react-native-paper';
import apiClient from '../../services/apiClient';
import { useApp } from '../../context/AppContext';
import { useNotificaciones } from '../../context/NotificacionesContext';

export default function ChatProductoresScreen({ navigation }) {
  const { user } = useApp();
  const { marcarMensajesLeidos } = useNotificaciones();
  const [productores, setProductores] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [inputMensaje, setInputMensaje] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const flatListRef = useRef();

  // Cargar productores disponibles y chats existentes
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar productores disponibles
      const resProductores = await apiClient.get('/usuarios?role=productor');
      setProductores(resProductores.data.usuarios || resProductores.data || []);

      // Cargar chats existentes del usuario
      const resChats = await apiClient.get('/chats');
      setChats(resChats.data.chats || []);
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Configurar polling para actualizar mensajes en tiempo real
  useEffect(() => {
    if (!selectedChat) return;

    const interval = setInterval(async () => {
      try {
        const response = await apiClient.get(`/chats/${selectedChat.id}/mensajes`);
        const nuevosMensajes = response.data.mensajes || [];
        
        // Actualizar mensajes
        setMensajes(nuevosMensajes);
      } catch (error) {
        console.error('Error al actualizar mensajes:', error);
      }
    }, 5000); // Cada 5 segundos
    
    return () => clearInterval(interval);
  }, [selectedChat]);

  // Cargar mensajes cuando se selecciona un chat
  useEffect(() => {
    if (selectedChat) {
      cargarMensajes(selectedChat.id);
    }
  }, [selectedChat]);

  const cargarMensajes = async (chatId) => {
    try {
      const response = await apiClient.get(`/chats/${chatId}/mensajes`);
      setMensajes(response.data.mensajes || []);
      
      // Marcar mensajes como leídos
      await marcarMensajesLeidos(chatId);
      
      // Auto-scroll al final
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    }
  };

  const iniciarChatConProductor = async (productor) => {
    try {
      // Buscar si ya existe un chat con este productor
      const chatExistente = chats.find(
        c => c.otro_usuario && c.otro_usuario.id === productor.id
      );

      if (chatExistente) {
        setSelectedChat(chatExistente);
        return;
      }

      // Crear nuevo chat
      const response = await apiClient.post('/chats', {
        otro_usuario_id: productor.id
      });

      // Agregar info del otro usuario al chat
      const nuevoChat = {
        ...response.data.chat,
        otro_usuario: {
          id: productor.id,
          nombre: productor.nombre || productor.name,
          apellido: productor.apellido,
        }
      };
      
      setChats(prev => [...prev, nuevoChat]);
      setSelectedChat(nuevoChat);
      
    } catch (error) {
      console.error('Error al iniciar chat:', error);
      Alert.alert('Error', 'No se pudo iniciar el chat');
    }
  };

  const enviarMensaje = async () => {
    if (!inputMensaje.trim() || !selectedChat) return;

    const mensajeTexto = inputMensaje.trim();
    setInputMensaje('');
    setSendingMessage(true);

    try {
      const response = await apiClient.post(`/chats/${selectedChat.id}/mensajes`, {
        mensaje: mensajeTexto
      });

      const nuevoMensaje = response.data.mensaje;
      setMensajes(prev => [...prev, nuevoMensaje]);
      
      // Auto-scroll al final
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      Alert.alert('Error', 'No se pudo enviar el mensaje');
      setInputMensaje(mensajeTexto); // Restaurar el mensaje
    } finally {
      setSendingMessage(false);
    }
  };

  const renderProductor = ({ item }) => (
    <TouchableOpacity 
      style={styles.productorCard}
      onPress={() => iniciarChatConProductor(item)}
    >
      <Avatar.Icon size={50} icon="account" />
      <View style={styles.productorInfo}>
        <Text style={styles.productorNombre}>
          {item.nombre} {item.apellido}
        </Text>
        <Text style={styles.productorEmail}>{item.email}</Text>
      </View>
      <IconButton icon="message" size={24} />
    </TouchableOpacity>
  );

  const renderChat = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.chatCard,
        selectedChat?.id === item.id && styles.chatCardSelected
      ]}
      onPress={() => setSelectedChat(item)}
    >
      <Avatar.Icon size={45} icon="account" />
      <View style={styles.chatInfo}>
        <Text style={styles.chatNombre}>
          {item.otro_usuario?.nombre || 'Usuario'}
        </Text>
        <Text style={styles.chatUltimoMensaje} numberOfLines={1}>
          {item.ultimo_mensaje || 'Sin mensajes'}
        </Text>
      </View>
      {item.ultimo_mensaje_at && (
        <Text style={styles.chatFecha}>
          {new Date(item.ultimo_mensaje_at).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit'
          })}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderMensaje = ({ item }) => {
    const esMio = item.user_id === user.id;
    
    return (
      <View style={[
        styles.mensajeContainer,
        esMio ? styles.mensajeMio : styles.mensajeOtro
      ]}>
        <View style={[
          styles.mensajeBurbuja,
          esMio ? styles.burbujaMia : styles.burbujaOtra
        ]}>
          <Text style={[
            styles.mensajeTexto,
            esMio ? styles.textoMio : styles.textoOtro
          ]}>
            {item.mensaje}
          </Text>
          <Text style={[
            styles.mensajeHora,
            esMio ? styles.horaMia : styles.horaOtra
          ]}>
            {new Date(item.created_at).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (!selectedChat) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Chat con Productores" />
        </Appbar.Header>

        {chats.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chats Activos</Text>
            <FlatList
              data={chats}
              renderItem={renderChat}
              keyExtractor={item => item.id.toString()}
              style={styles.chatsList}
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Productores Disponibles</Text>
          <FlatList
            data={productores}
            renderItem={renderProductor}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.productoresList}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No hay productores disponibles</Text>
            }
          />
        </View>
      </View>
    );
  }

  // Vista del chat activo
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Appbar.Header>
        <Appbar.BackAction onPress={() => setSelectedChat(null)} />
        <Appbar.Content 
          title={selectedChat.otro_usuario?.nombre || 'Chat'} 
          subtitle="En línea"
        />
      </Appbar.Header>

      <FlatList
        ref={flatListRef}
        data={mensajes}
        renderItem={renderMensaje}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        style={styles.mensajesList}
        contentContainerStyle={styles.mensajesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje..."
          value={inputMensaje}
          onChangeText={setInputMensaje}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton,
            (!inputMensaje.trim() || sendingMessage) && styles.sendButtonDisabled
          ]}
          onPress={enviarMensaje}
          disabled={!inputMensaje.trim() || sendingMessage}
        >
          {sendingMessage ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <IconButton icon="send" iconColor="#FFF" size={24} />
          )}
        </TouchableOpacity>
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
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  section: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  chatsList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  productoresList: {
    paddingBottom: 16,
  },
  productorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
  },
  productorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productorNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  productorEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
  },
  chatCardSelected: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  chatInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chatNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  chatUltimoMensaje: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  chatFecha: {
    fontSize: 12,
    color: '#999',
  },
  mensajesList: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  mensajesContent: {
    padding: 16,
  },
  mensajeContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  mensajeMio: {
    alignSelf: 'flex-end',
  },
  mensajeOtro: {
    alignSelf: 'flex-start',
  },
  mensajeBurbuja: {
    padding: 12,
    borderRadius: 16,
  },
  burbujaMia: {
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 4,
  },
  burbujaOtra: {
    backgroundColor: '#E0E0E0',
    borderBottomLeftRadius: 4,
  },
  mensajeTexto: {
    fontSize: 15,
    lineHeight: 20,
  },
  textoMio: {
    color: '#FFF',
  },
  textoOtro: {
    color: '#333',
  },
  mensajeHora: {
    fontSize: 11,
    marginTop: 4,
  },
  horaMia: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
  },
  horaOtra: {
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 15,
    marginTop: 24,
  },
});
