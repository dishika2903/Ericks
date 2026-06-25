import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme, spacing, typography } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';

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
    <View style={[styles.container, { backgroundColor: theme.primary }]}>
      <Text style={styles.logoIcon}>🛺</Text>
      <Text style={styles.logoText}>E-Ricks</Text>
      <Text style={styles.tagline}>Electric, Efficient, Local</Text>
      <ActivityIndicator color="#FFFFFF" size="large" style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 90,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: spacing.sm,
  },
  tagline: {
    ...typography.bodyLarge,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
  },
  loader: {
    marginTop: spacing.xxxl,
  },
});
export default Splash;
