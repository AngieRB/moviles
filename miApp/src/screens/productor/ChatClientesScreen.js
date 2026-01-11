
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Button, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import Pusher from 'pusher-js/react-native';
import axios from 'axios';

// Configura estos valores según tu backend y Pusher
const PUSHER_KEY = 'dc5b6a1aad26978b963c';
const PUSHER_CLUSTER = 'us2';
export const API_URL = "http://192.168.90.15:8000/api";

// Simulación de productor autenticado (ajusta según tu auth real)
const PRODUCTOR_ID = 1;

export default function ChatClientesScreen() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const [conversaciones, setConversaciones] = useState([]); // [{cliente: {id, nombre}, mensajes: []}]
  const [selectedConv, setSelectedConv] = useState(null); // conversación activa
  const flatListRef = useRef();

  // Obtener conversaciones activas desde el backend
  useEffect(() => {
    const fetchConversaciones = async () => {
      try {
        const res = await axios.get(`${API_URL}/chat/conversaciones-activas?productor_id=${PRODUCTOR_ID}`);
        setConversaciones(res.data);
        if (res.data.length > 0 && !selectedConv) {
          setSelectedConv(res.data[0]);
        }
      } catch (e) {
        setConversaciones([]);
      }
    };
    fetchConversaciones();
  }, []);

  // Escuchar mensajes en tiempo real con Pusher SOLO para la conversación activa
  useEffect(() => {
    if (!selectedConv) return;
    const pusher = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER });
    const channel = pusher.subscribe(`chat-productor-${PRODUCTOR_ID}-cliente-${selectedConv.cliente.id}`);
    channel.bind('nuevo-mensaje', function(data) {
      setConversaciones(prev => prev.map(conv =>
        conv.cliente.id === selectedConv.cliente.id
          ? { ...conv, mensajes: [...conv.mensajes, data.message] }
          : conv
      ));
    });
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [selectedConv]);

  // Cambiar de conversación y cargar mensajes históricos
  const handleSelectConv = async (conv) => {
    setSelectedConv(conv);
    // Si quieres, puedes recargar mensajes históricos aquí
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedConv) return;
    try {
      await axios.post(`${API_URL}/chat/enviar`, {
        to: selectedConv.cliente.id,
        from: PRODUCTOR_ID,
        message: input,
      });
      setConversaciones(prev => prev.map(conv =>
        conv.cliente.id === selectedConv.cliente.id
          ? { ...conv, mensajes: [...conv.mensajes, { from: PRODUCTOR_ID, to: selectedConv.cliente.id, text: input }] }
          : conv
      ));
      setInput('');
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (e) {
      alert('Error enviando mensaje');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <Text style={styles.title}>Chat con Clientes</Text>
        {/* Lista de conversaciones activas */}
        <View style={styles.clientesContainer}>
          <Text style={styles.subTitle}>Conversaciones activas:</Text>
          <FlatList
            data={conversaciones}
            keyExtractor={item => item.cliente.id.toString()}
            renderItem={({ item }) => {
              const tieneNoLeidos = item.no_leidos > 0;
              return (
                <TouchableOpacity
                  style={[styles.chatItem, selectedConv?.cliente.id === item.cliente.id && styles.chatItemSelected]}
                  onPress={() => handleSelectConv(item)}
                >
                  <Image
                    source={item.cliente.foto ? { uri: item.cliente.foto } : require('../../../assets/default-user.png')}
                    style={styles.avatar}
                  />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.clienteNombre}>{item.cliente.nombre}</Text>
                      {tieneNoLeidos && <View style={styles.dot} />}
                    </View>
                    <Text style={styles.ultimoMensaje} numberOfLines={1}>{item.ultimo_mensaje}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={<Text style={{ marginTop: 10, marginLeft: 10 }}>No tienes conversaciones activas</Text>}
          />
        </View>
        {/* Mensajes de la conversación activa */}
        <View style={styles.chatContainer}>
          {selectedConv ? (
            <>
              <FlatList
                ref={flatListRef}
                data={selectedConv.mensajes}
                keyExtractor={(_, idx) => idx.toString()}
                renderItem={({ item }) => (
                  <View style={[styles.messageBubble, item.from === PRODUCTOR_ID ? styles.messageOut : styles.messageIn]}>
                    <Text style={styles.messageText}>{item.text}</Text>
                  </View>
                )}
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
              />
              <View style={styles.inputRow}>
                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder="Escribe un mensaje..."
                  style={styles.input}
                />
                <Button title="Enviar" onPress={sendMessage} />
              </View>
            </>
          ) : (
            <Text style={{ marginTop: 40 }}>No tienes conversaciones activas</Text>
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
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B9B37',
    textAlign: 'center',
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    marginLeft: 10,
  },
  clientesContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
    minHeight: 90,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  chatItemSelected: {
    backgroundColor: '#eaf7d3',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#e0e0e0',
  },
  clienteNombre: {
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 6,
  },
  ultimoMensaje: {
    color: '#666',
    fontSize: 14,
    marginTop: 2,
    maxWidth: 180,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    marginLeft: 4,
  },
  chatContainer: {
    flex: 1,
    padding: 10,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 12,
    marginVertical: 4,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  messageIn: {
    backgroundColor: '#e0e0e0',
    alignSelf: 'flex-start',
  },
  messageOut: {
    backgroundColor: '#c0e6a0',
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 40,
  },
});