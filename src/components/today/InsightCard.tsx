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
  confidence?: number;
  priority?: 'high' | 'medium' | 'low';
}

export function InsightCard({ insight, confidence, priority }: InsightCardProps) {
  const color = TYPE_COLOR[insight.type];
  const icon = TYPE_ICON[insight.type];

  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: color + '18' }]}>
        <Text style={[styles.icon, { color }]}>{icon}</Text>
      </View>
      <View style={styles.text}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{insight.title}</Text>
          {priority === 'high' && (
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityText}>!</Text>
            </View>
          )}
        </View>
        <Text style={styles.body}>{insight.body}</Text>
        {confidence !== undefined && confidence > 0 && (
          <Text style={styles.confidence}>
            {Math.round(confidence * 100)}% confidence
          </Text>
        )}
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: Typography.base,
    fontWeight: Typography.medium,
    color: Colors.textPrimary,
    lineHeight: Typography.base * Typography.tight,
  },
  priorityBadge: {
    backgroundColor: Colors.danger + '20',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: Typography.semibold,
    color: Colors.danger,
  },
  body: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sm * Typography.normal,
  },
  confidence: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
});
