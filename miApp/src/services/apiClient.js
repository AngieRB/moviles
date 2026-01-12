import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// IMPORTANTE: Cambia esta IP por la IP de tu servidor Laravel
// IP local de la máquina: 10.82.16.252
export const API_URL = "http://192.168.10.243:8000/api";
/**
 * Cliente HTTP centralizado con axios
 * Maneja automáticamente la autenticación con tokens
 */
const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 segundos de timeout
});

/**
 * Interceptor de request: Agrega el token de autenticación a cada petición
 */
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    console.log('API Request:', config.method?.toUpperCase(), config.url, 'Token:', token ? 'Sí (' + token.substring(0, 20) + '...)' : 'NO');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de response: Maneja errores de autenticación y red
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Personalizar mensajes de error en español
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      error.mensajeUsuario = 'No hay conexión con el servidor. Verifica que esté encendido.';
    } else if (error.code === 'ECONNABORTED') {
      error.mensajeUsuario = 'La conexión tardó demasiado. Intenta de nuevo.';
    }
    
    if (error.response?.status === 401) {
      // Token expirado o inválido, limpiar sesión
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

export default apiClient;