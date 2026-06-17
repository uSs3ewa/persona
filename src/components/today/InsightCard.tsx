import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { Insight, InsightType } from '@/types';

const TYPE_ICON: Record<InsightType, string> = {
  recovery: '◎',
  focus: '◈',
  energy: '⚡',
  nutrition: '○',
  pattern: '≋',
};

const TYPE_COLOR: Record<InsightType, string> = {
  recovery: '#1D9E75',
  focus: Colors.accent,
  energy: '#EF9F27',
  nutrition: '#5DCAA5',
  pattern: Colors.textSecondary,
};

interface InsightCardProps {
  insight: Insight;
}

export function InsightCard({ insight }: InsightCardProps) {
  const color = TYPE_COLOR[insight.type];
  const icon = TYPE_ICON[insight.type];

  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: color + '18' }]}>
        <Text style={[styles.icon, { color }]}>{icon}</Text>
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>{insight.title}</Text>
        <Text style={styles.body}>{insight.body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  icon: {
    fontSize: 15,
  },
  text: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: Typography.base,
    fontWeight: Typography.medium,
    color: Colors.textPrimary,
    lineHeight: Typography.base * Typography.tight,
  },
  body: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sm * Typography.normal,
  },
});
