import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme, spacing, typography } from '../../theme/theme';
import OtpInput from '../../components/OtpInput';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';

type OtpVerificationRouteProp = RouteProp<AuthStackParamList, 'OtpVerification'>;
type OtpVerificationNavigationProp = StackNavigationProp<AuthStackParamList, 'OtpVerification'>;

interface OtpVerificationProps {
  route: OtpVerificationRouteProp;
  navigation: OtpVerificationNavigationProp;
}

export const OtpVerification: React.FC<OtpVerificationProps> = ({ route, navigation }) => {
  const { phone, role } = route.params;
  const { theme } = useTheme();
  const { login } = useAuth();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);

  // Countdown timer for resending OTP
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    if (otp.length < 4) {
      setError('Please enter the complete 4-digit verification code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const isNewUser = await login(phone, otp, role);
      if (isNewUser) {
        navigation.replace('ProfileSetup');
      }
      // If not a new user, AuthContext will update, triggering the RootNavigator 
      // to automatically switch the user to the MainNavigator.
    } catch (err: any) {
      console.error('[Auth] Verify OTP error:', err);
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setTimer(30);
    
    try {
      const response = await apiClient.post('/api/auth/send-otp', { phone });
      if (response.data.success) {
        console.log('[Auth] Resent OTP successfully. Code:', response.data.otp);
      } else {
        setError(response.data.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (err: any) {
      console.error('[Auth] Resend OTP error:', err);
      setError(err.message || 'Failed to resend OTP. Check your network.');
    }
  };

  // Mask the phone number for display (e.g. +91 ******8899)
  const formatPhone = () => {
    if (phone.length >= 10) {
      const start = phone.substring(0, 3); // "+91"
      const end = phone.substring(phone.length - 4);
      return `${start} ******${end}`;
    }
    return phone;
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
          <Text style={[styles.title, { color: theme.text }]}>Verification Code</Text>
          <Text style={[styles.subtitle, { color: theme.textLight }]}>
            Sent to {formatPhone()}
          </Text>
        </View>

        <View style={styles.form}>
          <OtpInput length={4} onCodeChanged={(code) => {
            setError('');
            setOtp(code);
          }} />

          {error ? <Text style={[styles.error, { color: theme.error }]}>{error}</Text> : null}

          <View style={styles.timerRow}>
            {timer > 0 ? (
              <Text style={{ color: theme.textLight }}>
                Resend code in <Text style={{ color: theme.primary, fontWeight: '700' }}>{timer}s</Text>
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={[styles.resendText, { color: theme.primary }]}>Resend Code</Text>
              </TouchableOpacity>
            )}
          </View>

          <Button
            title="Verify & Continue"
            onPress={handleVerify}
            loading={loading}
            disabled={otp.length < 4}
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
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.h2,
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
    alignItems: 'center',
  },
  error: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  timerRow: {
    marginVertical: spacing.md,
    height: 24,
    justifyContent: 'center',
  },
  resendText: {
    ...typography.body,
    fontWeight: '700',
  },
  submitBtn: {
    width: '100%',
    marginTop: spacing.lg,
  },
});

export default OtpVerification;
