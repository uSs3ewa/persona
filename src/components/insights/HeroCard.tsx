import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { FeedCard } from '@/types';

interface HeroCardProps {
  card: FeedCard;
  onPress?: () => void;
}

export function HeroCard({ card, onPress }: HeroCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.card, { backgroundColor: card.accentColor + '12', borderColor: card.accentColor + '25' }]}
    >
      <View style={styles.topRow}>
        <View style={[styles.badge, { backgroundColor: card.accentColor + '20' }]}>
          <Text style={[styles.badgeText, { color: card.accentColor }]}>
            {card.category || 'Discovery'}
          </Text>
        </View>
        <Text style={styles.icon}>{card.icon}</Text>
      </View>

      <Text style={styles.hook}>{card.hook}</Text>

      <View style={styles.bottomRow}>
        <Text style={[styles.readMore, { color: card.accentColor }]}>
          Read more →
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    gap: 16,
    minHeight: 200,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  icon: {
    fontSize: 24,
  },
  hook: {
    fontSize: Typography.xl,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: Typography.xl * 1.3,
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  readMore: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
});
