import React, { useEffect } from 'react';
import { StyleSheet, Text, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme, spacing, typography } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../../components/BrandLogo';

type SplashScreenProps = {
  navigation: StackNavigationProp<AuthStackParamList, 'Splash'>;
};

export const Splash: React.FC<SplashScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { isLoading, userToken, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // Small timeout to simulate branding splash experience
      const timer = setTimeout(() => {
        if (userToken) {
          if (user?.name) {
            // Already registered - direct to main app (AppNavigator takes over at Root level)
          } else {
            navigation.replace('ProfileSetup');
          }
        } else {
          navigation.replace('LanguageSelection');
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, userToken, user, navigation]);

  return (
    <LinearGradient
      colors={['#16A34A', '#0F5132']} // Premium rich green gradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <BrandLogo size={140} primaryColor="#FFFFFF" accentColor="#0EA5E9" />
      <Text style={styles.logoText}>E-Ricks</Text>
      <Text style={styles.tagline}>Ride Electric. Ride Smarter.</Text>
      <ActivityIndicator color="#FFFFFF" size="large" style={styles.loader} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    ...typography.h1,
    fontSize: 48,
    color: '#FFFFFF',
    marginTop: spacing.md,
    letterSpacing: 1.5,
  },
  tagline: {
    ...typography.bodyLarge,
    fontFamily: 'Inter_500Medium', // EV startup elegant tagline font
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: spacing.sm,
    letterSpacing: 0.5,
  },
  loader: {
    marginTop: spacing.xxxl,
  },
});

export default Splash;
