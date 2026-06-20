import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Typography } from '@/constants/theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  rightLabel?: string;
  onRightPress?: () => void;
}

export function SectionHeader({ title, subtitle, rightLabel, onRightPress }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {rightLabel && (
        <Text
          style={styles.right}
          onPress={onRightPress}
        >
          {rightLabel}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
    paddingBottom: 10,
  },
  left: {
    gap: 2,
  },
  title: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
  },
  right: {
    fontSize: Typography.sm,
    color: Colors.accent,
    fontWeight: Typography.medium,
  },
});
