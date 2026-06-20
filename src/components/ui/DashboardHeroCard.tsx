import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing, Typography, Shadows } from '@/constants/theme';

interface HeroCardProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  icon?: string;
  accentColor?: string;
  children?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export function DashboardHeroCard({
  eyebrow,
  title,
  subtitle,
  icon,
  accentColor = Colors.accent,
  children,
  rightAction,
}: HeroCardProps) {
  return (
    <View style={[styles.card, { borderColor: accentColor + '20' }, Shadows.glow(accentColor)]}>
      {eyebrow && (
        <View style={styles.eyebrowRow}>
          <Text style={[styles.eyebrow, { color: accentColor }]}>{eyebrow}</Text>
          {rightAction}
        </View>
      )}
      <View style={styles.titleRow}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text style={styles.title}>{title}</Text>
      </View>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius['2xl'],
    borderWidth: 0.5,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  eyebrowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  icon: {
    fontSize: 22,
  },
  title: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    flex: 1,
  },
  subtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sm * Typography.normal,
  },
});
