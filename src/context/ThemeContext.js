import React, { createContext, useState, useContext } from 'react';
import { COLORS } from '../constants/theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [accentColor, setAccentColor] = useState(COLORS.primary || '#6200EE');

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

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode, accentColor, setAccentColor, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);