import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme, spacing, roundness, typography } from '../theme/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const { theme } = useTheme();

  const getButtonStyle = () => {
    const baseStyle: ViewStyle[] = [styles.button];

    switch (variant) {
      case 'primary':
        baseStyle.push({ backgroundColor: theme.primary });
        break;
      case 'secondary':
        baseStyle.push({ backgroundColor: theme.secondary });
        break;
      case 'danger':
        baseStyle.push({ backgroundColor: theme.error });
        break;
      case 'outline':
        baseStyle.push({
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.primary,
        });
        break;
    }

    if (disabled || loading) {
      baseStyle.push({ opacity: 0.6 });
    }

    return baseStyle;
  };

  const getTextColor = () => {
    if (variant === 'outline') return theme.primary;
    return '#FFFFFF';
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[getButtonStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: roundness.lg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
  },
  text: {
    ...typography.button,
  },
});
export default Button;
