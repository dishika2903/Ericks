import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

export const palette = {
  ecoGreen: '#0F9D58',
  rickshawOrange: '#FF9F00',
  charcoal: '#1E293B',
  warmWhite: '#F8FAFC',
  safetyRed: '#EF4444',
  successGreen: '#10B981',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',
  white: '#FFFFFF',
  black: '#000000',
};

export const themeTokens = {
  light: {
    primary: palette.ecoGreen,
    secondary: palette.rickshawOrange,
    background: palette.warmWhite,
    surface: palette.white,
    text: palette.charcoal,
    textLight: palette.gray500,
    border: palette.gray200,
    card: palette.white,
    error: palette.safetyRed,
    success: palette.successGreen,
    warning: palette.rickshawOrange,
    tint: palette.ecoGreen,
    placeholder: palette.gray400,
  },
  dark: {
    primary: palette.ecoGreen,
    secondary: palette.rickshawOrange,
    background: palette.gray900,
    surface: palette.gray800,
    text: palette.warmWhite,
    textLight: palette.gray400,
    border: palette.gray700,
    card: palette.gray800,
    error: palette.safetyRed,
    success: palette.successGreen,
    warning: palette.rickshawOrange,
    tint: palette.ecoGreen,
    placeholder: palette.gray500,
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

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const roundness = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 9999,
};

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 22,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};
