export const Colors = {
  // Backgrounds
  bg: '#0E0D1A',
  bgElevated: '#18172A',
  bgCard: '#1E1D30',
  bgInput: '#211F35',

  // Accent
  accent: '#7C6AF6',
  accentDim: '#534AB7',
  accentSubtle: '#2A2550',

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

  // Weights
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,

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
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const MOOD_LABELS: Record<number, string> = {
  1: 'Rough',
  2: 'Low',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
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
