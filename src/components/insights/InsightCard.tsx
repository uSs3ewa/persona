import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { FeedCard } from '@/types';

const STYLE_BG: Record<string, string> = {
  sleep: '#0F1A2E',
  recovery: '#0F1F1A',
  burnout: '#1F0F0F',
  warning: '#1F0F0F',
  training: '#1A1508',
  nutrition: '#0F1A15',
  hydration: '#0F1A15',
  pattern: Colors.accentSubtle + '40',
  trend: Colors.accentSubtle + '40',
  psychology: Colors.accentSubtle + '40',
  neuroscience: Colors.accentSubtle + '40',
  coach: '#1A1508',
  reflection: Colors.accentSubtle + '30',
  habit: '#0F1F1A',
  prediction: Colors.accentSubtle + '40',
  challenge: Colors.accentSubtle + '40',
};

interface InsightCardProps {
  card: FeedCard;
  variant?: 'standard' | 'compact';
  onPress?: () => void;
}

export function InsightCard({ card, variant = 'standard', onPress }: InsightCardProps) {
  const bg = STYLE_BG[card.style] || Colors.bgCard;

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[styles.compactCard, { backgroundColor: bg, borderColor: card.accentColor + '18' }]}
      >
        <Text style={styles.compactIcon}>{card.icon}</Text>
        <Text style={[styles.compactCategory, { color: card.accentColor }]}>
          {(card.category || '').toUpperCase()}
        </Text>
        <Text style={styles.compactHook} numberOfLines={3}>{card.hook}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.card, { backgroundColor: bg, borderColor: card.accentColor + '18' }]}
    >
      <Text style={styles.icon}>{card.icon}</Text>
      <Text style={[styles.category, { color: card.accentColor }]}>
        {(card.category || '').toUpperCase()}
      </Text>
      <Text style={styles.hook} numberOfLines={3}>{card.hook}</Text>
      <View style={styles.bottomRow}>
        <Text style={[styles.tapPrompt, { color: card.accentColor + 'BB' }]}>
          Tap to explore →
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 10,
    minHeight: 180,
    justifyContent: 'flex-start',
  },
  icon: {
    fontSize: 20,
  },
  category: {
    fontSize: 10,
    fontWeight: Typography.semibold,
    letterSpacing: 1,
  },
  hook: {
    fontSize: Typography.md,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    lineHeight: Typography.md * 1.35,
    flex: 1,
  },
  bottomRow: {
    marginTop: 4,
  },
  tapPrompt: {
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
  },
  compactCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 6,
    minHeight: 130,
    justifyContent: 'flex-start',
  },
  compactIcon: {
    fontSize: 16,
  },
  compactCategory: {
    fontSize: 9,
    fontWeight: Typography.semibold,
    letterSpacing: 0.8,
  },
  compactHook: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    lineHeight: Typography.sm * 1.4,
    flex: 1,
  },
});
