import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { useTheme, spacing, roundness, typography } from '../theme/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  ...props
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, { color: theme.text }]}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error
              ? theme.error
              : isFocused
              ? theme.primary
              : theme.border,
            backgroundColor: theme.surface,
          },
          inputStyle,
        ]}
      >
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholderTextColor={theme.placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </View>
      {error && <Text style={[styles.error, { color: theme.error }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    width: '100%',
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    height: 50,
    borderWidth: 1,
    borderRadius: roundness.md,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  input: {
    ...typography.bodyLarge,
    flex: 1,
    paddingVertical: 0,
  },
  error: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
});
export default Input;
