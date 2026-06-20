import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Colors, Typography } from '@/constants/theme';
import { FeedCard as FeedCardType, FeedCardStyle } from '@/types';

const STYLE_CONFIG: Record<FeedCardStyle, { bg: string; border: string; glow: string }> = {
  observation:   { bg: Colors.bgCard,   border: Colors.border,      glow: Colors.accent + '08' },
  pattern:       { bg: Colors.bgCard,   border: Colors.accent + '20', glow: Colors.accent + '0C' },
  trend:         { bg: Colors.bgCard,   border: Colors.border,      glow: Colors.accent + '08' },
  recovery:      { bg: '#1A2B26',       border: '#1D9E75' + '20',   glow: '#1D9E75' + '10' },
  sleep:         { bg: '#1A2B26',       border: '#5DCAA5' + '20',   glow: '#5DCAA5' + '10' },
  mood:          { bg: Colors.bgCard,   border: Colors.border,      glow: Colors.accent + '08' },
  productivity:  { bg: Colors.bgCard,   border: Colors.border,      glow: Colors.accent + '08' },
  nutrition:     { bg: '#1A2B26',       border: '#5DCAA5' + '20',   glow: '#5DCAA5' + '10' },
  training:      { bg: '#2B2218',       border: '#EF9F27' + '20',   glow: '#EF9F27' + '10' },
  focus:         { bg: Colors.bgCard,   border: Colors.accent + '20', glow: Colors.accent + '0C' },
  stress:        { bg: '#2B1A1A',       border: '#E24B4A' + '20',   glow: '#E24B4A' + '10' },
  burnout:       { bg: '#2B1A1A',       border: '#E24B4A' + '28',   glow: '#E24B4A' + '12' },
  hydration:     { bg: '#1A2B26',       border: '#5DCAA5' + '20',   glow: '#5DCAA5' + '10' },
  psychology:    { bg: Colors.bgCard,   border: Colors.accent + '20', glow: Colors.accent + '0C' },
  neuroscience:  { bg: Colors.bgCard,   border: Colors.accent + '20', glow: Colors.accent + '0C' },
  habit:         { bg: '#1A2B26',       border: '#5DCAA5' + '20',   glow: '#5DCAA5' + '10' },
  motivation:    { bg: Colors.bgCard,   border: Colors.border,      glow: Colors.accent + '08' },
  weekly:        { bg: Colors.bgCard,   border: Colors.accent + '28', glow: Colors.accent + '10' },
  monthly:       { bg: Colors.bgCard,   border: Colors.accent + '28', glow: Colors.accent + '10' },
  coach:         { bg: '#2B2218',       border: '#EF9F27' + '20',   glow: '#EF9F27' + '10' },
  fact:          { bg: Colors.bgCard,   border: Colors.border,      glow: Colors.accent + '08' },
  didyouknow:    { bg: Colors.bgCard,   border: Colors.border,      glow: Colors.accent + '08' },
  experiment:    { bg: '#1A2B26',       border: '#5DCAA5' + '20',   glow: '#5DCAA5' + '10' },
  challenge:     { bg: Colors.bgCard,   border: Colors.accent + '20', glow: Colors.accent + '0C' },
  achievement:   { bg: '#1A2B26',       border: '#1D9E75' + '28',   glow: '#1D9E75' + '12' },
  reflection:    { bg: Colors.bgCard,   border: Colors.accent + '18', glow: Colors.accent + '0A' },
  prediction:    { bg: Colors.bgCard,   border: Colors.accent + '20', glow: Colors.accent + '0C' },
  warning:       { bg: '#2B1A1A',       border: '#E24B4A' + '28',   glow: '#E24B4A' + '12' },
};

const SPRING_CONFIG = {
  damping: 22,
  stiffness: 120,
  mass: 1,
};

interface FeedCardProps {
  card: FeedCardType;
  isExpanded: boolean;
  onToggle: () => void;
}

export function FeedCardView({ card, isExpanded, onToggle }: FeedCardProps) {
  const config = STYLE_CONFIG[card.style] ?? { bg: Colors.bgCard, border: Colors.border, glow: Colors.accent + '08' };
  const expansion = useSharedValue(0);

  useEffect(() => {
    expansion.value = withSpring(isExpanded ? 1 : 0, SPRING_CONFIG);
  }, [isExpanded]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    borderBottomLeftRadius: interpolate(expansion.value, [0, 1], [20, 0], Extrapolation.CLAMP),
    borderBottomRightRadius: interpolate(expansion.value, [0, 1], [20, 0], Extrapolation.CLAMP),
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expansion.value, [0, 0.3, 1], [0, 0, 1], Extrapolation.CLAMP),
    maxHeight: interpolate(expansion.value, [0, 1], [0, 600], Extrapolation.CLAMP),
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(expansion.value, [0, 1], [0, 90], Extrapolation.CLAMP)}deg` }],
    opacity: interpolate(expansion.value, [0, 0.5, 1], [0.5, 0.3, 0.8], Extrapolation.CLAMP),
  }));

  const accentBorderStyle = useAnimatedStyle(() => ({
    borderLeftWidth: interpolate(expansion.value, [0, 1], [0, 3], Extrapolation.CLAMP),
    borderLeftColor: card.accentColor + '60',
  }));

  const shadowStyle = isExpanded
    ? {
        shadowColor: config.glow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 8,
      }
    : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
      };

  return (
    <Animated.View
      style={[
        styles.cardOuter,
        { backgroundColor: isExpanded ? config.bg : config.bg, borderColor: config.border },
        animatedCardStyle,
        accentBorderStyle,
        shadowStyle,
      ]}
    >
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.7}
        style={styles.touchable}
      >
        <View style={styles.hookRow}>
          <View style={[styles.iconWrap, { backgroundColor: card.accentColor + '14' }]}>
            <Text style={styles.icon}>{card.icon}</Text>
          </View>
          <View style={styles.hookTextWrap}>
            {card.category && (
              <Text style={[styles.category, { color: card.accentColor + 'AA' }]}>{card.category}</Text>
            )}
            <Text style={styles.hook}>{card.hook}</Text>
          </View>
          <Animated.View style={chevronStyle}>
            <Text style={[styles.chevron, { color: card.accentColor + '80' }]}>›</Text>
          </Animated.View>
        </View>
      </TouchableOpacity>

      <Animated.View style={[styles.expandedWrap, animatedContentStyle]}>
        <View style={[styles.divider, { backgroundColor: card.accentColor + '18' }]} />
        <View style={styles.expandedInner}>
          <Text style={styles.expandedContent}>{card.expandedContent}</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardOuter: {
    borderRadius: 20,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  touchable: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
  },
  hookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: {
    fontSize: 15,
  },
  hookTextWrap: {
    flex: 1,
    gap: 3,
  },
  category: {
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  hook: {
    fontSize: Typography.md,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    lineHeight: Typography.md * 1.35,
  },
  chevron: {
    fontSize: 22,
    fontWeight: Typography.regular,
    flexShrink: 0,
    width: 20,
    textAlign: 'center',
  },
  expandedWrap: {
    overflow: 'hidden',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 20,
  },
  expandedInner: {
    padding: 20,
    paddingTop: 16,
  },
  expandedContent: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sm * Typography.relaxed,
  },
});
