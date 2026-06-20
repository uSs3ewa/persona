import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing, Typography, Shadows } from '@/constants/theme';

interface MetricCardProps {
  icon: string;
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'flat';
  color: string;
  size?: 'sm' | 'md' | 'lg';
}

export function DashboardMetricCard({ icon, label, value, change, trend, color, size = 'md' }: MetricCardProps) {
  const changeColor = trend === 'up' ? Colors.success : trend === 'down' ? Colors.danger : Colors.textTertiary;
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

  if (size === 'sm') {
    return (
      <View style={[styles.cardSm, { borderColor: color + '15' }]}>
        <Text style={styles.iconSm}>{icon}</Text>
        <Text style={styles.valueSm}>{value}</Text>
        <Text style={styles.labelSm}>{label}</Text>
      </View>
    );
  }

  if (size === 'lg') {
    return (
      <View style={[styles.cardLg, { borderColor: color + '15' }, Shadows.card]}>
        <View style={styles.lgHeader}>
          <View style={[styles.iconWrapLg, { backgroundColor: color + '15' }]}>
            <Text style={styles.iconLg}>{icon}</Text>
          </View>
          <View style={styles.lgTitleWrap}>
            <Text style={styles.labelLg}>{label}</Text>
            {change && (
              <View style={[styles.changeBadge, { backgroundColor: changeColor + '18' }]}>
                <Text style={[styles.changeIcon, { color: changeColor }]}>{trendIcon}</Text>
                <Text style={[styles.changeText, { color: changeColor }]}>{change}</Text>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.valueLg}>{value}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.cardMd, { borderColor: color + '12' }]}>
      <View style={[styles.iconWrapMd, { backgroundColor: color + '15' }]}>
        <Text style={styles.iconMd}>{icon}</Text>
      </View>
      <Text style={styles.labelMd}>{label}</Text>
      <Text style={[styles.valueMd, { color }]}>{value}</Text>
      {change && (
        <Text style={[styles.changeMd, { color: changeColor }]}>{trendIcon} {change}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardMd: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    padding: Spacing.lg,
    gap: Spacing.sm,
    alignItems: 'flex-start',
    minWidth: 120,
  },
  iconWrapMd: {
    width: 30,
    height: 30,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconMd: { fontSize: 14 },
  labelMd: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    fontWeight: Typography.medium,
  },
  valueMd: {
    fontSize: Typography.xl,
    fontWeight: Typography.semibold,
    letterSpacing: -0.4,
  },
  changeMd: {
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
  },

  cardSm: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    padding: Spacing.md,
    gap: Spacing.xs,
    alignItems: 'center',
    flex: 1,
    minWidth: 80,
  },
  iconSm: { fontSize: 16 },
  valueSm: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  labelSm: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: Typography.medium,
  },

  cardLg: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius['2xl'],
    borderWidth: 0.5,
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  lgHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconWrapLg: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLg: { fontSize: 16 },
  lgTitleWrap: {
    flex: 1,
    gap: 2,
  },
  labelLg: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  changeIcon: {
    fontSize: 10,
    fontWeight: Typography.semibold,
  },
  changeText: {
    fontSize: 11,
    fontWeight: Typography.semibold,
  },
  valueLg: {
    fontSize: Typography['3xl'],
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
});
