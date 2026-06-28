import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme, spacing, typography, roundness } from '../../theme/theme';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';

type ProfileSetupNavigationProp = StackNavigationProp<AuthStackParamList, 'ProfileSetup'>;

interface ProfileSetupProps {
  navigation: ProfileSetupNavigationProp;
}

interface LanguageOption {
  code: string;
  label: string;
}

const languages: LanguageOption[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'or', label: 'ଓଡ଼ିଆ (Odia)' },
  { code: 'ben', label: 'বাংলা (Bengali)' },
];

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { registerProfile } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedLang, setSelectedLang] = useState('en');
  const [errors, setErrors] = useState<{ name?: string; email?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) {
      newErrors.name = 'Full Name is required.';
    }
    
    // Basic email format check if entered
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await registerProfile(name.trim(), email.trim(), selectedLang);
      // Once registerProfile completes, the AuthContext state updates,
      // which will cause the RootNavigator to switch dynamically to the MainNavigator.
    } catch (err: any) {
      console.error('[Auth] Register Profile error:', err);
      setErrors({ general: err.message || 'Failed to set up profile. Please try again.' });
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
          <Text style={[styles.title, { color: theme.text }]}>Create Profile</Text>
          <Text style={[styles.subtitle, { color: theme.textLight }]}>
            Set up your details to get riding with E-Ricks
          </Text>
        </View>

        <View style={styles.form}>
          {errors.general ? (
            <Text style={[styles.errorText, { color: theme.error, marginBottom: spacing.md }]}>
              {errors.general}
            </Text>
          ) : null}

          <Input
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChangeText={(text) => {
              setErrors(prev => ({ ...prev, name: undefined }));
              setName(text);
            }}
            error={errors.name}
          />

          <Input
            label="Email Address (Optional)"
            placeholder="johndoe@example.com"
            value={email}
            onChangeText={(text) => {
              setErrors(prev => ({ ...prev, email: undefined }));
              setEmail(text);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Text style={[styles.sectionLabel, { color: theme.text }]}>Preferred Language</Text>
          <View style={styles.langList}>
            {languages.map((lang) => {
              const isSelected = selectedLang === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  activeOpacity={0.8}
                  onPress={() => setSelectedLang(lang.code)}
                  style={[
                    styles.langCard,
                    {
                      borderColor: isSelected ? theme.primary : theme.border,
                      backgroundColor: theme.surface,
                    },
                  ]}
                >
                  <Text style={[styles.langText, { color: isSelected ? theme.primary : theme.text }]}>
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            title="Complete Registration"
            onPress={handleRegister}
            loading={loading}
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
  },
  sectionLabel: {
    ...typography.caption,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.sm,
  },
  langList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  langCard: {
    width: '48%',
    height: 48,
    borderWidth: 1.5,
    borderRadius: roundness.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  langText: {
    ...typography.body,
    fontWeight: '600',
  },
  errorText: {
    ...typography.caption,
    textAlign: 'center',
  },
  submitBtn: {
    marginTop: spacing.md,
  },
});

export default ProfileSetup;
