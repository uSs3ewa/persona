import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Typography } from '@/constants/theme';

interface MetricCardProps {
  icon: string;
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'flat';
  color: string;
}

export function MetricCard({ icon, label, value, change, trend, color }: MetricCardProps) {
  const changeColor = trend === 'up' ? '#1D9E75' : trend === 'down' ? '#E24B4A' : Colors.textTertiary;

  return (
    <View style={[styles.card, { borderColor: color + '18' }]}>
      <View style={[styles.iconWrap, { backgroundColor: color + '15' }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      {change && (
        <Text style={[styles.change, { color: changeColor }]}>{change}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 6,
    alignItems: 'flex-start',
    minWidth: 120,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 14,
  },
  label: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    fontWeight: Typography.medium,
  },
  value: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    letterSpacing: -0.3,
  },
  change: {
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
  },
});
