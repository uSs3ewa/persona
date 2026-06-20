import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography } from '@/constants/theme';
import { FeedCardView } from '@/components/insights/FeedCard';
import { HeroCard } from '@/components/insights/HeroCard';
import { InsightCard } from '@/components/insights/InsightCard';
import { MetricCard } from '@/components/insights/MetricCard';
import { SectionHeader } from '@/components/insights/SectionHeader';
import { HorizontalCarousel } from '@/components/insights/HorizontalCarousel';
import { generateFeedSections, generateTrendMetrics } from '@/lib/feedGenerator';
import { useAppStore } from '@/store/useAppStore';
import { RootStackParamList } from '@/types';

const CARD_WIDTH = 160;
const COMPACT_CARD_WIDTH = 140;
const METRIC_CARD_WIDTH = 130;

export function InsightsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const entries = useAppStore((s) => s.entries);
  const getTodayEntry = useAppStore((s) => s.getTodayEntry);
  const todayEntry = getTodayEntry();

  const sections = useMemo(() => generateFeedSections(entries), [entries.length]);
  const trendMetrics = useMemo(() => generateTrendMetrics(entries), [entries.length]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleCardPress = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Insights</Text>
        <Text style={styles.headerSub}>Patterns, observations and coaching</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {todayEntry && (
          <View style={styles.frameCard}>
            <Text style={styles.frameEyebrow}>Today's Frame</Text>
            <Text style={styles.frameTitle}>{todayEntry.generated_frame ?? 'Your Frame'}</Text>
            {todayEntry.generated_frame_sub && (
              <Text style={styles.frameSub}>{todayEntry.generated_frame_sub}</Text>
            )}
          </View>
        )}

        {!todayEntry && (
          <TouchableOpacity
            style={styles.checkInCta}
            onPress={() => navigation.navigate('CheckIn')}
            activeOpacity={0.85}
          >
            <Text style={styles.checkInCtaText}>Start your day — check in</Text>
          </TouchableOpacity>
        )}

        {sections.map((section) => {
          if (section.key === 'hero') {
            const heroCard = section.cards[0];
            return (
              <View key={section.key} style={{ paddingHorizontal: 20 }}>
                <HeroCard
                  card={heroCard}
                  onPress={() => handleCardPress(heroCard.id)}
                />
              </View>
            );
          }

          if (section.key === 'trending' && trendMetrics.length > 0) {
            return (
              <View key={section.key} style={{ paddingHorizontal: 20 }}>
                <SectionHeader title={section.title} />
                <HorizontalCarousel cardWidth={METRIC_CARD_WIDTH} gap={10}>
                  {trendMetrics.map((m, i) => (
                    <MetricCard key={i} {...m} />
                  ))}
                </HorizontalCarousel>
              </View>
            );
          }

          if (section.cards.length === 0) return null;

          const expandedCard = section.cards.find((c) => expandedId === c.id);
          const carouselCards = section.cards.filter((c) => expandedId !== c.id);

          return (
            <View key={section.key}>
              {carouselCards.length > 0 && (
                <View style={{ paddingHorizontal: 20 }}>
                  <SectionHeader title={section.title} subtitle={section.subtitle} />
                  <HorizontalCarousel
                    cardWidth={section.layout === 'horizontal-compact' ? COMPACT_CARD_WIDTH : CARD_WIDTH}
                    gap={12}
                  >
                    {carouselCards.map((card) => (
                      <InsightCard
                        key={card.id}
                        card={card}
                        variant={section.layout === 'horizontal-compact' ? 'compact' : 'standard'}
                        onPress={() => handleCardPress(card.id)}
                      />
                    ))}
                  </HorizontalCarousel>
                </View>
              )}
              {expandedCard && (
                <View style={styles.expandedCardWrap}>
                  <SectionHeader title={section.title} subtitle={section.subtitle} />
                  <FeedCardView
                    card={expandedCard}
                    isExpanded={true}
                    onToggle={() => handleCardPress(expandedCard.id)}
                  />
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 6,
    gap: 4,
  },
  headerTitle: {
    fontSize: Typography['3xl'],
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    letterSpacing: -0.8,
  },
  headerSub: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
    letterSpacing: 0.1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 20,
    gap: 28,
  },
  frameCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.accent + '28',
    padding: 24,
    gap: 8,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  frameEyebrow: {
    fontSize: Typography.xs,
    color: Colors.accent,
    fontWeight: Typography.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  frameTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    letterSpacing: -0.4,
    lineHeight: Typography.xl * 1.3,
  },
  frameSub: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sm * Typography.normal,
    marginTop: 2,
  },
  checkInCta: {
    marginHorizontal: 20,
    backgroundColor: Colors.accent,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  checkInCtaText: {
    fontSize: Typography.md,
    fontWeight: Typography.semibold,
    color: '#fff',
  },
  expandedCardWrap: {
    paddingHorizontal: 20,
    gap: 10,
  },
});
