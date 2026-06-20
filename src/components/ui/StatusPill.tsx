import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing, Typography, Shadows, CardStyles } from '@/constants/theme';

interface StatusPillProps {
  label: string;
  color?: string;
  size?: 'sm' | 'md';
  icon?: string;
}

export function StatusPill({ label, color = Colors.accent, size = 'md', icon }: StatusPillProps) {
  const isSm = size === 'sm';
  return (
    <View style={[styles.pill, isSm && styles.pillSm, { backgroundColor: color + '18' }]}>
      {icon && <Text style={[styles.icon, isSm && styles.iconSm]}>{icon}</Text>}
      <Text style={[styles.label, isSm && styles.labelSm, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  pillSm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    gap: 3,
  },
  icon: {
    fontSize: Typography.xs,
  },
  iconSm: {
    fontSize: 9,
  },
  label: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    letterSpacing: 0.3,
  },
  labelSm: {
    fontSize: 9,
    letterSpacing: 0.2,
  },
});
