import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Tema Claro (Light)
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6B9B37', // Verde corporativo AgroConnect
    primaryContainer: '#B8C9A0',
    secondary: '#8B7355', // Marrón tierra
    secondaryContainer: '#D4C4B0',
    tertiary: '#F5A623', // Dorado (para destacar)
    background: '#F5F5F5',
    surface: '#FFFFFF',
    surfaceVariant: '#E8E8E8',
    error: '#D32F2F',
    errorContainer: '#FFCDD2',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#1A2E00',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#2C1A0D',
    onBackground: '#1C1B1F',
    onSurface: '#1C1B1F',
    onSurfaceVariant: '#49454F',
    onError: '#FFFFFF',
    onErrorContainer: '#410E0B',
    outline: '#79747E',
    outlineVariant: '#CAC4D0',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#313033',
    inverseOnSurface: '#F4EFF4',
    inversePrimary: '#A8D070',
    elevation: {
      level0: 'transparent',
      level1: '#F7F9F4',
      level2: '#F2F5EC',
      level3: '#EDF1E5',
      level4: '#EBF0E3',
      level5: '#E8EDDD',
    },
  },
  roundness: 12,
};

// Tema Oscuro (Dark) - Fondo completamente negro
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#A8D070', // Verde más claro para modo oscuro
    primaryContainer: '#4A6B1F',
    secondary: '#C9A87C', // Marrón más claro
    secondaryContainer: '#5C3F28',
    tertiary: '#FFB84D', // Dorado más brillante
    background: '#000000', // Fondo completamente negro
    surface: '#1C1C1E', // Cards un poco más claros que el fondo
    surfaceVariant: '#2C2C2E',
    error: '#FF6B6B',
    errorContainer: '#8B0000',
    onPrimary: '#1A2E00',
    onPrimaryContainer: '#C5E19F',
    onSecondary: '#2C1A0D',
    onSecondaryContainer: '#E8D5C1',
    onBackground: '#FFFFFF', // Texto blanco sobre fondo negro
    onSurface: '#FFFFFF', // Texto blanco sobre surfaces
    onSurfaceVariant: '#E0E0E0',
    onError: '#690005',
    onErrorContainer: '#FFDAD6',
    outline: '#8E8E93',
    outlineVariant: '#3A3A3C',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#E6E1E5',
    inverseOnSurface: '#000000',
    inversePrimary: '#6B9B37',
    elevation: {
      level0: 'transparent',
      level1: '#1C1C1E',
      level2: '#2C2C2E',
      level3: '#3A3A3C',
      level4: '#48484A',
      level5: '#58585A',
    },
  },
  roundness: 12,
};

// Exportar tema por defecto (para compatibilidad)
export const theme = lightTheme;

// Colores específicos para roles
export const roleColors = {
  productor: {
    primary: '#6B9B37',
    light: '#B8C9A0',
    icon: '🌾',
  },
  consumidor: {
    primary: '#4A90E2',
    light: '#A8CDEC',
    icon: '🛒',
  },
  administrador: {
    primary: '#F5A623',
    light: '#F9D89C',
    icon: '⚙️',
  },
};
