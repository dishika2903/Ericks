import React from 'react';
import { Modal, View, StyleSheet, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { useTheme, roundness, spacing } from '../theme/theme';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const BottomSheet: React.FC<BottomSheetProps> = ({ visible, onClose, children }) => {
  const { theme } = useTheme();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        <View style={[styles.sheet, { backgroundColor: theme.surface }]}>
          <View style={[styles.handle, { backgroundColor: theme.border }]} />
          <View style={styles.content}>{children}</View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    borderTopLeftRadius: roundness.xl,
    borderTopRightRadius: roundness.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    maxHeight: SCREEN_HEIGHT * 0.75,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: roundness.round,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
});
export default BottomSheet;
