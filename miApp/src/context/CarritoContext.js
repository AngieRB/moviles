import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../services/apiClient';
import { Alert, Platform } from 'react-native';

// Crear el contexto del carrito
const CarritoContext = createContext();

// Hook personalizado para usar el carrito
export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error('useCarrito debe usarse dentro de un CarritoProvider');
  }
  return context;
};

// Provider del carrito
export const CarritoProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar carrito al iniciar
  useEffect(() => {
    cargarCarrito();
  }, []);

  // Guardar carrito en AsyncStorage cuando cambie
  useEffect(() => {
    guardarCarritoLocal();
  }, [items]);

  // Cargar carrito desde AsyncStorage o API
  const cargarCarrito = async () => {
    try {
      setLoading(true);
      // Primero intentar desde el backend
      try {
        const response = await apiClient.get('/carrito');
        if (response.data.items && response.data.items.length > 0) {
          setItems(response.data.items.map(item => ({
            id: item.id,
            producto_id: item.producto_id,
            nombre: item.producto?.nombre || item.nombre,
            precio: parseFloat(item.producto?.precio || item.precio),
            cantidad: item.cantidad,
            imagen: item.producto?.imagen || '🛒',
            productor: item.producto?.productor?.nombre || 'Productor local',
            disponibles: item.producto?.disponibles || 100,
          })));
          return;
        }
      } catch (apiError) {
        console.log('No se pudo cargar del API, intentando local');
      }

      // Si falla el API, cargar desde AsyncStorage
      const carritoLocal = await AsyncStorage.getItem('carrito');
      if (carritoLocal) {
        setItems(JSON.parse(carritoLocal));
      }
    } catch (error) {
      console.error('Error al cargar carrito:', error);
    } finally {
      setLoading(false);
    }
  };

  // Guardar carrito en AsyncStorage
  const guardarCarritoLocal = async () => {
    try {
      await AsyncStorage.setItem('carrito', JSON.stringify(items));
    } catch (error) {
      console.error('Error al guardar carrito local:', error);
    }
  };

  // Agregar producto al carrito
  const agregarAlCarrito = async (producto, cantidad = 1) => {
    try {
      // Verificar si el producto ya está en el carrito
      const itemExistente = items.find(
        item => item.producto_id === producto.id || item.id === producto.id
      );

      if (itemExistente) {
        // Actualizar cantidad
        const nuevaCantidad = itemExistente.cantidad + cantidad;
        
        // Verificar disponibilidad
        if (nuevaCantidad > (producto.disponibles || 100)) {
          mostrarAlerta('Sin stock', 'No hay suficiente stock disponible');
          return false;
        }

        await actualizarCantidad(itemExistente.id, nuevaCantidad);
        mostrarAlerta('¡Actualizado!', `${producto.nombre} - Cantidad: ${nuevaCantidad}`);
      } else {
        // Agregar nuevo item
        const nuevoItem = {
          id: Date.now().toString(), // ID temporal
          producto_id: producto.id,
          nombre: producto.nombre,
          precio: parseFloat(producto.precio),
          cantidad: cantidad,
          imagen: producto.imagen || '🛒',
          productor: producto.productor?.nombre || 'Productor local',
          disponibles: producto.disponibles || 100,
        };

        // Intentar guardar en el backend
        try {
          const response = await apiClient.post('/carrito', {
            producto_id: producto.id,
            cantidad: cantidad,
          });
          nuevoItem.id = response.data.item?.id || nuevoItem.id;
        } catch (apiError) {
          console.log('Guardando solo localmente:', apiError.message);
        }

        setItems(prev => [...prev, nuevoItem]);
        mostrarAlerta('¡Agregado!', `${producto.nombre} se agregó al carrito`);
      }

      return true;
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      mostrarAlerta('Error', 'No se pudo agregar al carrito');
      return false;
    }
  };

  // Actualizar cantidad de un item
  const actualizarCantidad = async (id, nuevaCantidad) => {
    if (nuevaCantidad < 1) {
      return eliminarDelCarrito(id);
    }

    try {
      // Intentar actualizar en el backend
      try {
        await apiClient.put(`/carrito/${id}`, { cantidad: nuevaCantidad });
      } catch (apiError) {
        console.log('Actualizando solo localmente');
      }

      setItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, cantidad: nuevaCantidad } : item
        )
      );
      return true;
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      return false;
    }
  };

  // Eliminar item del carrito
  const eliminarDelCarrito = async (id) => {
    try {
      // Intentar eliminar del backend
      try {
        await apiClient.delete(`/carrito/${id}`);
      } catch (apiError) {
        console.log('Eliminando solo localmente');
      }

      setItems(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (error) {
      console.error('Error al eliminar del carrito:', error);
      return false;
    }
  };

  // Vaciar carrito
  const vaciarCarrito = async () => {
    try {
      // Intentar vaciar en el backend
      try {
        await apiClient.delete('/carrito');
      } catch (apiError) {
        console.log('Vaciando solo localmente');
      }

      setItems([]);
      await AsyncStorage.removeItem('carrito');
      return true;
    } catch (error) {
      console.error('Error al vaciar carrito:', error);
      return false;
    }
  };

  // Calcular totales
  const subtotal = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const envio = subtotal > 20 ? 0 : 3.50;
  const total = subtotal + envio;
  const cantidadTotal = items.reduce((sum, item) => sum + item.cantidad, 0);

  // Función auxiliar para mostrar alertas
  const mostrarAlerta = (titulo, mensaje) => {
    if (Platform.OS === 'web') {
      // En web, usar alert nativo del navegador
      window.alert(`${titulo}\n${mensaje}`);
    } else {
      Alert.alert(titulo, mensaje, [{ text: 'OK' }], { cancelable: true });
    }
  };

  const value = {
    items,
    loading,
    subtotal,
    envio,
    total,
    cantidadTotal,
    agregarAlCarrito,
    actualizarCantidad,
    eliminarDelCarrito,
    vaciarCarrito,
    cargarCarrito,
  };

  return (
    <CarritoContext.Provider value={value}>
      {children}
    </CarritoContext.Provider>
  );
};

export default CarritoContext;
