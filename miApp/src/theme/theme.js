import { MD3LightTheme } from 'react-native-paper';

export const theme = {
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
