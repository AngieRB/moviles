import React, { useEffect, useState } from 'react';
import { View, Text, Alert, ActivityIndicator } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import { lightTheme, darkTheme } from './src/theme/theme';

// 1. IMPORTAMOS SOLO PUSHER (Nativo)
// Usamos la importación específica para móviles que funciona con NetInfo
import Pusher from 'pusher-js/react-native';

// 2. CONFIGURACIÓN DEL CLIENTE FUERA DEL COMPONENTE
// Esto evita que se reconecte a cada rato
let pusherClient = null;

try {
  pusherClient = new Pusher('dc5b6a1aad26978b963c', {
    cluster: 'us2',
    forceTLS: true,
  });
} catch (error) {
  console.error("Error iniciando Pusher:", error);
}

function AppContent() {
  const { isDarkMode } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [status, setStatus] = useState("🟡 Iniciando...");

  useEffect(() => {
    if (!pusherClient) {
        setStatus("🔴 Error: Pusher no cargó");
        return;
    }

    console.log("⚡ Intentando conectar...");

    // A. ESCUCHAR CONEXIÓN
    pusherClient.connection.bind('connected', () => {
        console.log("✅ ¡CONECTADO AL SERVIDOR!");
        setStatus("🟢 En línea (Stock y Chat activos)");
    });

    pusherClient.connection.bind('error', (err) => {
        console.log("❌ Error de conexión:", err);
        // Si es error de red, no te asustes, reintentará solo
        setStatus("⚠️ Reintentando conexión...");
    });

    // B. SUSCRIBIRSE AL CANAL
    const channel = pusherClient.subscribe('canal-agro');
    
    // C. ESCUCHAR EL EVENTO
    // IMPORTANTE: Sin Laravel Echo, el nombre del evento debe ser EXACTO.
    // Prueba primero con la barra invertida doble:
    const nombreEvento = 'evento-prueba';
    
    channel.bind(nombreEvento, (data) => {
      console.log("📩 ¡DATO RECIBIDO!", data);
      
      // Extraemos el mensaje (a veces llega como objeto JSON)
      let mensajeMostrar = "Nuevo evento";
      if (typeof data === 'string') mensajeMostrar = data;
      else if (data.mensaje) mensajeMostrar = data.mensaje;
      
      Alert.alert("🔔 AgroConnect", mensajeMostrar);
    });

    return () => {
      // Desconectar al salir para no gastar batería
      pusherClient.unsubscribe('canal-agro');
    };
  }, []);

  return (
    <PaperProvider theme={theme}>
        
      <AppNavigator />
    </PaperProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}