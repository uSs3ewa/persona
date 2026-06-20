import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { FeedCard as FeedCardType, FeedCardStyle } from '@/types';

const STYLE_CONFIG: Record<FeedCardStyle, { bg: string; border: string }> = {
  observation: { bg: Colors.bgCard, border: Colors.border },
  pattern: { bg: Colors.accentSubtle + '25', border: Colors.accent + '25' },
  trend: { bg: Colors.bgCard, border: Colors.border },
  recovery: { bg: '#1D9E75' + '10', border: '#1D9E75' + '25' },
  sleep: { bg: '#5DCAA5' + '10', border: '#5DCAA5' + '25' },
  mood: { bg: Colors.bgCard, border: Colors.border },
  productivity: { bg: Colors.bgCard, border: Colors.border },
  nutrition: { bg: '#5DCAA5' + '10', border: '#5DCAA5' + '25' },
  training: { bg: '#EF9F27' + '10', border: '#EF9F27' + '25' },
  focus: { bg: Colors.accentSubtle + '25', border: Colors.accent + '25' },
  stress: { bg: '#E24B4A' + '10', border: '#E24B4A' + '25' },
  burnout: { bg: '#E24B4A' + '12', border: '#E24B4A' + '30' },
  hydration: { bg: '#5DCAA5' + '10', border: '#5DCAA5' + '25' },
  psychology: { bg: Colors.accentSubtle + '25', border: Colors.accent + '25' },
  neuroscience: { bg: Colors.accentSubtle + '25', border: Colors.accent + '25' },
  habit: { bg: '#5DCAA5' + '10', border: '#5DCAA5' + '25' },
  motivation: { bg: Colors.bgCard, border: Colors.border },
  weekly: { bg: Colors.accentSubtle + '30', border: Colors.accent + '30' },
  monthly: { bg: Colors.accentSubtle + '30', border: Colors.accent + '30' },
  coach: { bg: '#EF9F27' + '10', border: '#EF9F27' + '25' },
  fact: { bg: Colors.bgCard, border: Colors.border },
  didyouknow: { bg: Colors.bgCard, border: Colors.border },
  experiment: { bg: '#5DCAA5' + '10', border: '#5DCAA5' + '25' },
  challenge: { bg: Colors.accentSubtle + '25', border: Colors.accent + '25' },
  achievement: { bg: '#1D9E75' + '12', border: '#1D9E75' + '30' },
  reflection: { bg: Colors.accentSubtle + '20', border: Colors.accent + '20' },
  prediction: { bg: Colors.accentSubtle + '25', border: Colors.accent + '25' },
  warning: { bg: '#E24B4A' + '12', border: '#E24B4A' + '25' },
};

interface FeedCardProps {
  card: FeedCardType;
}

export function FeedCardView({ card }: FeedCardProps) {
  const config = STYLE_CONFIG[card.style] ?? { bg: Colors.bgCard, border: Colors.border };

  return (
    <View style={[styles.card, { backgroundColor: config.bg, borderColor: config.border }]}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: card.accentColor + '18' }]}>
          <Text style={styles.icon}>{card.icon}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: card.accentColor }]}>{card.title}</Text>
          {card.subtitle && (
            <Text style={styles.subtitle}>{card.subtitle}</Text>
          )}
        </View>
        {card.badge && (
          <View style={[styles.badge, { backgroundColor: card.accentColor + '20' }]}>
            <Text style={[styles.badgeText, { color: card.accentColor }]}>{card.badge}</Text>
          </View>
        )}
      </View>
      <Text style={styles.body}>{card.body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: {
    fontSize: 16,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    lineHeight: Typography.base * Typography.tight,
  },
  subtitle: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    lineHeight: Typography.xs * Typography.normal,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    flexShrink: 0,
  },
  badgeText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
  },
  body: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sm * Typography.normal,
  },
});
