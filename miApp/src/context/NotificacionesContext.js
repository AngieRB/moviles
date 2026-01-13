import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import apiClient from '../services/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from './AppContext'; 

const NotificacionesContext = createContext();

export const useNotificaciones = () => {
  const context = useContext(NotificacionesContext);
  if (!context) {
    throw new Error('useNotificaciones debe usarse dentro de NotificacionesProvider');
  }
  return context;
};

export const NotificacionesProvider = ({ children }) => {
  const { user, isAuthenticated } = useApp();
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState(0);

  // ESTA ES LA FUNCIÓN SEGURA - SIN BUCLES
  const cargarMensajesNoLeidos = useCallback(async () => {
    // Si es admin o no hay usuario, NO hacemos nada
    if (!isAuthenticated || !user || user.role === 'administrador') return;

    try {
      // Usar un timeout más corto para esta petición (5 segundos)
      const response = await apiClient.get('/chats/no-leidos', {
        timeout: 5000
      });
      const cantidad = response.data.no_leidos || response.data.total || 0;
      setMensajesNoLeidos(cantidad);
    } catch (error) {
      // Manejo silencioso de errores - no afecta la funcionalidad
      // Si hay timeout o error de red, simplemente mantenemos el contador anterior
      if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
        // No hacer nada, mantener el valor actual
      } else {
        console.log('Error al cargar mensajes no leídos (no crítico)');
      }
    }
  }, [isAuthenticated, user]);

  // EFECTO ÚNICO: Solo se ejecuta al entrar a la app.
  useEffect(() => {
    // Pequeño delay inicial para que la app cargue primero
    const initialTimeout = setTimeout(() => {
      cargarMensajesNoLeidos();
    }, 1000);
    
    // Actualizar contador cada 5 segundos (reducido de 3 para dar más tiempo)
    const interval = setInterval(() => {
      cargarMensajesNoLeidos();
    }, 5000);
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [cargarMensajesNoLeidos]);

  const marcarMensajesLeidos = async (chatId) => {
    try {
      await apiClient.put(`/chats/${chatId}/marcar-leidos`);
      cargarMensajesNoLeidos();
    } catch (error) {
      console.log('Error marcar leidos');
    }
  };

  const notificarNuevoMensaje = () => {
    cargarMensajesNoLeidos();
  };

  return (
    <NotificacionesContext.Provider
      value={{
        mensajesNoLeidos,
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