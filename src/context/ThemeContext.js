import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [accentColor, setAccentColor] = useState(COLORS.primary || '#6200EE');
  const [isLoading, setIsLoading] = useState(true);

  // 1. CARGAR DATOS AL INICIAR
  useEffect(() => {
    const loadThemeSettings = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('@is_dark_mode');
        const savedColor = await AsyncStorage.getItem('@accent_color');

        if (savedMode !== null) setIsDarkMode(JSON.parse(savedMode));
        if (savedColor !== null) setAccentColor(savedColor);
      } catch (e) {
        console.error("Error cargando tema", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadThemeSettings();
  }, []);

  // 2. GUARDAR CADA VEZ QUE CAMBIE EL MODO
  const toggleDarkMode = async (value) => {
    setIsDarkMode(value);
    await AsyncStorage.setItem('@is_dark_mode', JSON.stringify(value));
  };

  // 3. GUARDAR CADA VEZ QUE CAMBIE EL COLOR
  const updateAccentColor = async (color) => {
    setAccentColor(color);
    await AsyncStorage.setItem('@accent_color', color);
  };

  const theme = {
    dark: isDarkMode,
    colors: {
      primary: accentColor,
      background: isDarkMode ? '#121212' : '#F8F9FA',
      card: isDarkMode ? '#1E1E1E' : '#FFFFFF',
      text: isDarkMode ? '#FFFFFF' : '#1A1A1A',
      border: isDarkMode ? '#333333' : '#EEEEEE',
    }
  };

  // Si está cargando, podemos retornar null o una pantalla de carga
  if (isLoading) return null;

  return (
    <ThemeContext.Provider value={{
      isDarkMode,
      setIsDarkMode: toggleDarkMode, // Usamos la nueva función con persistencia
      accentColor,
      setAccentColor: updateAccentColor, // Usamos la nueva función con persistencia
      theme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);