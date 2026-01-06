import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';

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
  
  // Estado del tema (light o dark)
  const [themeMode, setThemeMode] = useState('light'); // 'light' o 'dark'
  
  // Estado de los usuarios registrados
  const [registeredUsers, setRegisteredUsers] = useState([]);
  
  // Estado de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Determinar si está en modo oscuro
  const isDarkMode = themeMode === 'dark';

  // Login del usuario
  const login = (userData) => {
    setUser({
      nombre: userData.nombre,
      apellido: userData.apellido,
      email: userData.email,
      telefono: userData.telefono,
      role: userData.role,
      avatar: userData.avatar || null,
      // Datos específicos por rol
      ...userData.roleData,
    });
    setIsAuthenticated(true);
  };

  // Logout del usuario
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  // Actualizar datos del usuario
  const updateUser = (updatedData) => {
    setUser(prev => ({
      ...prev,
      ...updatedData,
    }));
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

  const value = {
    // Estado del usuario
    user,
    isAuthenticated,
    
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
