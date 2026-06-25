import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme, spacing, roundness, typography } from '../../theme/theme';
import Button from '../../components/Button';

type LangScreenProps = {
  navigation: StackNavigationProp<AuthStackParamList, 'LanguageSelection'>;
};

interface LanguageOption {
  code: 'en' | 'hi' | 'or' | 'ben';
  label: string;
  nativeLabel: string;
}

const languages: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'or', label: 'Odia', nativeLabel: 'ଓଡ଼ିଆ' },
  { code: 'ben', label: 'Bengali', nativeLabel: 'বাংলা' },
];

export const LanguageSelection: React.FC<LangScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [selectedLang, setSelectedLang] = useState<'en' | 'hi' | 'or' | 'ben'>('en');

  const handleNext = () => {
    navigation.navigate('Onboarding');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={styles.icon}>🌐</Text>
      <Text style={[styles.title, { color: theme.text }]}>Choose Language</Text>
      <Text style={[styles.subtitle, { color: theme.textLight }]}>
        अपना पसंदीदा भाषा चुनें
      </Text>

      <View style={styles.grid}>
        {languages.map((lang) => {
          const isSelected = selectedLang === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              activeOpacity={0.8}
              onPress={() => setSelectedLang(lang.code)}
              style={[
                styles.card,
                {
                  borderColor: isSelected ? theme.primary : theme.border,
                  backgroundColor: theme.surface,
                },
              ]}
            >
              <Text style={[styles.langNative, { color: isSelected ? theme.primary : theme.text }]}>
                {lang.nativeLabel}
              </Text>
              <Text style={[styles.langText, { color: theme.textLight }]}>{lang.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Button title="Continue" onPress={handleNext} style={styles.btn} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  icon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    fontWeight: '800',
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xxl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.xxxl,
  },
  card: {
    width: '47%',
    height: 100,
    borderWidth: 2,
    borderRadius: roundness.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    elevation: 1,
  },
  langNative: {
    ...typography.bodyLarge,
    fontWeight: '700',
  },
  langText: {
    ...typography.caption,
    marginTop: 2,
  },
  btn: {
    marginTop: spacing.lg,
  },
});
export default LanguageSelection;
