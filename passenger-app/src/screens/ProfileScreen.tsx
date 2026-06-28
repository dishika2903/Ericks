import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, spacing, typography } from '../theme/theme';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

export const ProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <Text style={styles.avatarText}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <Text style={[styles.name, { color: theme.text }]}>{user?.name || 'Guest User'}</Text>
        <Text style={[styles.phone, { color: theme.textLight }]}>{user?.phone || 'No phone number'}</Text>
        <Text style={[styles.email, { color: theme.textLight }]}>{user?.email || 'No email set'}</Text>
      </View>

      <View style={styles.actions}>
        <Button
          title="Sign Out"
          onPress={logout}
          variant="danger"
          style={styles.logoutBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    ...typography.h2,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  name: {
    ...typography.h2,
    fontWeight: '700',
  },
  phone: {
    ...typography.body,
    marginTop: spacing.xs,
  },
  email: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  actions: {
    width: '100%',
  },
  logoutBtn: {
    width: '100%',
  },
});

export default ProfileScreen;
