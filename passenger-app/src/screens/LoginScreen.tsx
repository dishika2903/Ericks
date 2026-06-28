import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/types';
import { useTheme, spacing, typography } from '../theme/theme';
import Input from '../components/Input';
import Button from '../components/Button';
import apiClient from '../services/api';
import BrandLogo from '../components/BrandLogo';

type LoginScreenProps = {
  navigation: StackNavigationProp<AuthStackParamList, 'Login'>;
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    setError('');
    
    // Simple 10 digit check
    const cleanPhone = phone.trim();
    if (!/^\d{10}$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    const fullPhone = `+91${cleanPhone}`;

    try {
      const response = await apiClient.post('/api/auth/send-otp', { phone: fullPhone });
      if (response.data.success) {
        // Simulated OTP is returned in the response for development/testing
        console.log('[Auth] OTP sent successfully. Code:', response.data.otp);
        navigation.navigate('OtpVerification', { phone: fullPhone, role: 'passenger' });
      } else {
        setError(response.data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err: any) {
      console.error('[Auth] Send OTP error:', err);
      setError(err.message || 'Something went wrong. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <BrandLogo size={90} primaryColor={theme.primary} accentColor={theme.secondary} />
          <Text style={[styles.title, { color: theme.text }]}>Enter Mobile Number</Text>
          <Text style={[styles.subtitle, { color: theme.textLight }]}>
            We'll send a 4-digit code to verify your account
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Text style={[styles.prefix, { color: theme.text }]}>+91</Text>
            <Input
              placeholder="99999 99999"
              value={phone}
              onChangeText={(text) => {
                setError('');
                // Only allow digits, max 10
                setPhone(text.replace(/\D/g, '').substring(0, 10));
              }}
              keyboardType="phone-pad"
              maxLength={10}
              error={error}
              containerStyle={styles.inputContainer}
            />
          </View>

          <Button
            title="Send Verification Code"
            onPress={handleSendOtp}
            loading={loading}
            disabled={phone.length < 10}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  title: {
    ...typography.h2,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  form: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  prefix: {
    ...typography.bodyLarge,
    fontWeight: '700',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 14,
    marginRight: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1', // standard divider
  },
  inputContainer: {
    flex: 1,
  },
  submitBtn: {
    marginTop: spacing.lg,
  },
});

export default LoginScreen;
