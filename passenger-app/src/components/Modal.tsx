import React from 'react';
import { Modal as RNModal, View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { useTheme, roundness, spacing, typography } from '../theme/theme';
import Button from './Button';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmText?: string;
  onConfirm?: () => void;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  description,
  confirmText = 'OK',
  onConfirm,
}) => {
  const { theme } = useTheme();

  return (
    <RNModal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        <View style={[styles.dialog, { backgroundColor: theme.surface }]}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.description, { color: theme.textLight }]}>
            {description}
          </Text>
          <View style={styles.buttonRow}>
            {onConfirm && (
              <Button
                title="Cancel"
                variant="outline"
                onPress={onClose}
                style={styles.btn}
              />
            )}
            <Button
              title={confirmText}
              onPress={onConfirm || onClose}
              style={styles.btn}
            />
          </View>
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  dialog: {
    width: '100%',
    borderRadius: roundness.lg,
    padding: spacing.lg,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  title: {
    ...typography.h3,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  btn: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});
export default Modal;
