import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// IMPORTANTE: Cambia esta IP por la IP de tu servidor Laravel
// La IP del backend según tu .env es: 10.82.23.101
const API_URL = "http://10.82.16.222/api";

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
 * Interceptor de response: Maneja errores de autenticación
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido, limpiar sesión
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
