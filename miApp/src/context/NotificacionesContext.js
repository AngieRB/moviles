import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import apiClient from '../services/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificacionesContext = createContext();

export const useNotificaciones = () => {
  const context = useContext(NotificacionesContext);
  if (!context) {
    throw new Error('useNotificaciones debe usarse dentro de NotificacionesProvider');
  }
  return context;
};

export const NotificacionesProvider = ({ children }) => {
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState(0);
  const [ultimaNotificacion, setUltimaNotificacion] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar si hay token de autenticación
  const verificarAutenticacion = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setIsAuthenticated(!!token);
      return !!token;
    } catch (error) {
      return false;
    }
  };

  // Cargar mensajes no leídos
  const cargarMensajesNoLeidos = useCallback(async () => {
    try {
      const autenticado = await verificarAutenticacion();
      if (!autenticado) {
        setMensajesNoLeidos(0);
        return;
      }
      
      const response = await apiClient.get('/chats/no-leidos');
      const cantidad = response.data.total || 0;
      
      // Si hay nuevos mensajes, mostrar notificación
      if (cantidad > mensajesNoLeidos && mensajesNoLeidos > 0) {
        mostrarNotificacion(`Tienes ${cantidad} mensaje(s) nuevo(s)`);
      }
      
      setMensajesNoLeidos(cantidad);
    } catch (error) {
      // No mostrar error si no está autenticado
      if (error.response?.status !== 401) {
        console.error('Error al cargar mensajes no leídos:', error);
      }
    }
  }, [mensajesNoLeidos]);

  // Marcar mensajes como leídos para un chat específico
  const marcarMensajesLeidos = async (chatId) => {
    try {
      await apiClient.put(`/chats/${chatId}/marcar-leidos`);
      // Recargar el conteo de mensajes no leídos
      cargarMensajesNoLeidos();
    } catch (error) {
      console.error('Error al marcar mensajes como leídos:', error);
    }
  };

  // Mostrar notificación
  const mostrarNotificacion = (mensaje) => {
    setUltimaNotificacion(mensaje);
    
    if (Platform.OS === 'web') {
      // Para web, usar Notification API si está disponible
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('AgroConnect', { body: mensaje });
      } else if (typeof window !== 'undefined') {
        // Si no hay permisos, mostrar alert
        console.log('🔔 Nueva notificación:', mensaje);
      }
    } else {
      // Para móvil, mostrar alert
      Alert.alert('💬 Nuevo mensaje', mensaje);
    }
  };

  // Solicitar permisos de notificación en web
  useEffect(() => {
    if (Platform.OS === 'web' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  // Polling cada 5 segundos para verificar nuevos mensajes
  useEffect(() => {
    cargarMensajesNoLeidos();
    
    const interval = setInterval(() => {
      cargarMensajesNoLeidos();
    }, 5000);

    return () => clearInterval(interval);
  }, [cargarMensajesNoLeidos]);

  // Notificar nuevo mensaje (para uso interno)
  const notificarNuevoMensaje = () => {
    cargarMensajesNoLeidos();
  };

  return (
    <NotificacionesContext.Provider
      value={{
        mensajesNoLeidos,
        ultimaNotificacion,
        cargarMensajesNoLeidos,
        marcarMensajesLeidos,
        notificarNuevoMensaje,
      }}
    >
      {children}
    </NotificacionesContext.Provider>
  );
};

export default NotificacionesContext;
