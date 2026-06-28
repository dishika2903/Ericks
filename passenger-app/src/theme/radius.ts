export const radius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

// Legacy roundness object mapping for backward compatibility
export const roundness = {
  sm: radius.sm,
  md: radius.md,
  lg: radius.lg,
  xl: radius.xl,
  xxl: radius.xxl,
  round: radius.full,
};

export default radius;
