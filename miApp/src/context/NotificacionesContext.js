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
      const response = await apiClient.get('/chats/no-leidos');
      const cantidad = response.data.total || 0;
      setMensajesNoLeidos(cantidad);
    } catch (error) {
      // No imprimimos errores para no ensuciar la consola
    }
  }, [isAuthenticated, user]);

  // EFECTO ÚNICO: Solo se ejecuta al entrar a la app.
  // ALERTA: ¡Aquí ya NO hay setInterval!
  useEffect(() => {
    cargarMensajesNoLeidos();
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