import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme, spacing, roundness, typography } from '../theme/theme';
import Button from './Button';

// 1. LOADING SKELETON
interface LoadingSkeletonProps {
  height?: number;
  width?: string | number;
  borderRadius?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  height = 50,
  width = '100%',
  borderRadius = roundness.md,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.skeleton,
        {
          height,
          width: width as any,
          borderRadius,
          backgroundColor: theme.border,
        },
      ]}
    >
      <ActivityIndicator size="small" color={theme.textLight} />
    </View>
  );
};

// 2. EMPTY STATE
interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.centerContainer}>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.description, { color: theme.textLight }]}>
        {description}
      </Text>
      {actionText && onAction && (
        <Button title={actionText} onPress={onAction} style={styles.actionBtn} />
      )}
    </View>
  );
};

// 3. ERROR STATE
interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.centerContainer}>
      <Text style={[styles.title, { color: theme.error }]}>Oops!</Text>
      <Text style={[styles.description, { color: theme.textLight }]}>{message}</Text>
      <Button title="Retry" onPress={onRetry} style={styles.actionBtn} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  centerContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    ...typography.h3,
    fontWeight: '700',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  actionBtn: {
    width: '60%',
    height: 44,
  },
});
export default LoadingSkeleton;
