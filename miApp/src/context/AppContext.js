import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../services/apiClient';

// Crear el contexto
const AppContext = createContext();

// Hook personalizado para usar el contexto fácilmente
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de un AppProvider');
  }
  return context;
};

// Provider del contexto
export const AppProvider = ({ children }) => {
  // Estado del usuario autenticado
  const [user, setUser] = useState(null);
  
  // Token de autenticación
  const [token, setToken] = useState(null);
  
  // Estado del tema (light o dark)
  const [themeMode, setThemeMode] = useState('light'); // 'light' o 'dark'
  
  // Estado de los usuarios registrados
  const [registeredUsers, setRegisteredUsers] = useState([]);
  
  // Estado de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Estado de carga de autenticación
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  // Determinar si está en modo oscuro
  const isDarkMode = themeMode === 'dark';

  // Login del usuario - AHORA GUARDA EN ASYNCSTORAGE
  const login = async (userData, tokenValue) => {
    const userToStore = {
      id: userData.id,
      nombre: userData.nombre,
      apellido: userData.apellido,
      email: userData.email,
      telefono: userData.telefono,
      role: userData.role,
      avatar: userData.avatar || null,
      cedula: userData.cedula,
      foto_perfil: userData.foto_perfil || null,
      // Datos específicos por rol
      roleData: userData.roleData || null,
    };
    setUser(userToStore);
    setToken(tokenValue);
    setIsAuthenticated(true);
    
    // Guardar en AsyncStorage para persistencia
    await AsyncStorage.setItem('token', tokenValue);
    await AsyncStorage.setItem('user', JSON.stringify(userToStore));
  };

  // Logout del usuario - LLAMA A LA API Y LIMPIA ASYNCSTORAGE
  const logout = async () => {
    try {
      // Intentar cerrar sesión en el backend
      await apiClient.post('/logout');
    } catch (error) {
      console.log('Error al cerrar sesión en el servidor:', error);
    }
    
    // Limpiar estado local
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    
    // Limpiar AsyncStorage
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  };

  // Actualizar datos del usuario
  const updateUser = async (updatedData) => {
    const updatedUser = {
      ...user,
      ...updatedData,
    };
    setUser(updatedUser);
    
    // Persistir en AsyncStorage
    try {
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.log('Error al guardar usuario actualizado:', error);
    }
  };

  // Cambiar tema (toggle entre claro y oscuro)
  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Establecer tema específico
  const setTheme = (mode) => {
    if (['light', 'dark'].includes(mode)) {
      setThemeMode(mode);
    }
  };

  // Obtener saludo según la hora
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 19) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  // Saludo personalizado
  const personalizedGreeting = user 
    ? `${getGreeting()}, ${user.nombre}!`
    : getGreeting();

  // Registrar un nuevo usuario
  const registerUser = (userData) => {
    setRegisteredUsers(prev => [...prev, userData]);
  };

  // Cargar sesión guardada al iniciar la app
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.log('Error al cargar sesión:', error);
      } finally {
        setLoadingAuth(false);
      }
    };
    
    loadSession();
  }, []);

  const value = {
    // Estado del usuario
    user,
    token,
    isAuthenticated,
    loadingAuth,
    
    // Funciones de autenticación
    login,
    logout,
    updateUser,
    
    // Estado del tema
    themeMode,
    isDarkMode,
    
    // Funciones del tema
    toggleTheme,
    setTheme,
    
    // Utilidades
    personalizedGreeting,
    getGreeting,

    // Estado de usuarios registrados
    registeredUsers,

    // Funciones de registro
    registerUser,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
