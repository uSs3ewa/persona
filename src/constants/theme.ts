import { Platform, ViewStyle } from 'react-native';

export const Colors = {
  // Backgrounds
  bg: '#0E0D1A',
  bgElevated: '#18172A',
  bgCard: '#1E1D30',
  bgCardElevated: '#242340',
  bgInput: '#211F35',

  // Accent
  accent: '#7C6AF6',
  accentDim: '#534AB7',
  accentSubtle: '#2A2550',
  accentGlow: '#7C6AF630',

  // Gradient stops
  gradientStart: '#7C6AF6',
  gradientMid: '#9B7FFF',
  gradientEnd: '#B89FFF',

  // Text
  textPrimary: '#EEEAF8',
  textSecondary: '#8B89A0',
  textTertiary: '#5A5870',

  // Borders
  border: '#2A2840',
  borderStrong: '#3D3A5C',

  // State colors (for calendar dots)
  stateHigh: '#7C6AF6',
  stateMid: '#4A4870',
  stateLow: '#2B293F',
  stateEmpty: '#1E1D2A',

  // Semantic
  success: '#1D9E75',
  warning: '#EF9F27',
  danger: '#E24B4A',

  // Metric colors
  metricEnergy: '#EF9F27',
  metricMood: '#7C6AF6',
  metricSleep: '#5DCAA5',
  metricTraining: '#E24B4A',
  metricNutrition: '#1D9E75',
} as const;

export const Typography = {
  // Sizes
  xs: 11,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 22,
  '2xl': 28,
  '3xl': 34,
  '4xl': 42,

  // Weights
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,

  // Line heights
  tight: 1.3,
  normal: 1.6,
  relaxed: 1.8,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export const Shadows = {
  card: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 4,
    },
    android: {
      elevation: 4,
    },
  }) as ViewStyle,
  cardElevated: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 8,
    },
    android: {
      elevation: 8,
    },
  }) as ViewStyle,
  glow: (color: string) =>
    Platform.select({
      ios: {
        shadowColor: color,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 6,
      },
      android: {
        elevation: 6,
      },
    }) as ViewStyle,
  float: Platform.select({
    ios: {
      shadowColor: Colors.accent,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 24,
      elevation: 12,
    },
    android: {
      elevation: 12,
    },
  }) as ViewStyle,
} as const;

export const AnimConfig = {
  spring: { damping: 18, stiffness: 120, mass: 1 },
  springSoft: { damping: 22, stiffness: 100, mass: 1 },
  springBouncy: { damping: 12, stiffness: 150, mass: 0.8 },
  duration: { fast: 200, normal: 300, slow: 500 },
} as const;

export const CardStyles = {
  base: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 0.5,
    borderColor: Colors.border,
  } as ViewStyle,
  elevated: {
    backgroundColor: Colors.bgCardElevated,
    borderRadius: Radius.xl,
    borderWidth: 0.5,
    borderColor: Colors.borderStrong,
  } as ViewStyle,
  accent: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius['2xl'],
    borderWidth: 0.5,
    borderColor: Colors.accent + '28',
  } as ViewStyle,
} as const;

export const MOOD_LABELS: Record<number, string> = {
  1: 'Rough',
  2: 'Low',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
};

export const MOOD_EMOJI: Record<number, string> = {
  1: '😞',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😊',
};

export const ACTIVITY_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
] as const;

export const NUTRITION_OPTIONS = [
  { value: 'poor', label: 'Poor' },
  { value: 'ok', label: 'On plan' },
  { value: 'good', label: 'Ideal' },
] as const;
