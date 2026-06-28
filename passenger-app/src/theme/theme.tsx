import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radius, roundness } from './radius';
import { shadows } from './shadows';
import { motion } from './motion';
import { opacity } from './opacity';
import { icons } from './icons';

// Export everything so that files importing from theme/theme can resolve them directly
export { colors, typography, spacing, radius, roundness, shadows, motion, opacity, icons };

// Backward compatibility map for palette
export const palette = {
  ecoGreen: colors.primary,
  rickshawOrange: colors.warning,
  charcoal: colors.gray800,
  warmWhite: colors.background,
  safetyRed: colors.error,
  successGreen: colors.success,
  gray100: colors.gray100,
  gray200: colors.gray200,
  gray300: colors.gray300,
  gray400: colors.gray400,
  gray500: colors.gray500,
  gray600: colors.gray600,
  gray700: colors.gray700,
  gray800: colors.gray800,
  gray900: colors.gray900,
  white: colors.white,
  black: colors.black,
};

export const themeTokens = {
  light: {
    primary: colors.primary,
    secondary: colors.accentBlue, // EV accent color
    background: colors.background,
    surface: colors.surface,
    text: colors.textPrimary,
    textLight: colors.textSecondary,
    border: colors.gray200,
    card: colors.surface,
    error: colors.error,
    success: colors.success,
    warning: colors.warning,
    tint: colors.primary,
    placeholder: colors.gray400,
  },
  dark: {
    primary: colors.primary,
    secondary: colors.accentBlue,
    background: colors.gray900, // Slate dark theme
    surface: colors.gray800,
    text: colors.gray100,
    textLight: colors.gray400,
    border: colors.gray700,
    card: colors.gray800,
    error: colors.error,
    success: colors.success,
    warning: colors.warning,
    tint: colors.primary,
    placeholder: colors.gray500,
  }
};

export type ThemeType = typeof themeTokens.light;

interface ThemeContextType {
  theme: ThemeType;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: themeTokens.light,
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    setIsDark(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const theme = isDark ? themeTokens.dark : themeTokens.light;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
