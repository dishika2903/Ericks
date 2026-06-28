import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, spacing, typography } from '../theme/theme';

export const SavedPlacesScreen: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Saved Places</Text>
      <Text style={[styles.subtitle, { color: theme.textLight }]}>
        Your favorite destinations
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  title: {
    ...typography.h2,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.body,
    marginTop: spacing.xs,
  },
});

export default SavedPlacesScreen;
