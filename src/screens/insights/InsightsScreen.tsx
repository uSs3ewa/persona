import React, { useMemo } from 'react';
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
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { FeedCardView } from '@/components/insights/FeedCard';
import { generateFeedCards } from '@/lib/feedGenerator';
import { useAppStore } from '@/store/useAppStore';
import { RootStackParamList } from '@/types';

export function InsightsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const entries = useAppStore((s) => s.entries);
  const getTodayEntry = useAppStore((s) => s.getTodayEntry);
  const todayEntry = getTodayEntry();

  const cards = useMemo(() => generateFeedCards(entries), [entries.length]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Insights</Text>
        <Text style={styles.headerSub}>Patterns, observations and coaching</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Today's Frame at top */}
        {todayEntry && (
          <View style={styles.frameCard}>
            <Text style={styles.frameEyebrow}>Today's Frame</Text>
            <Text style={styles.frameTitle}>{todayEntry.generated_frame ?? 'Your Frame'}</Text>
            <Text style={styles.frameSub}>{todayEntry.generated_frame_sub}</Text>
          </View>
        )}

        {/* Check-in summary if exists */}
        {todayEntry && (
          <View style={styles.summaryRow}>
            <SummaryPill label="Sleep" value={`${todayEntry.sleep_hours}h`} />
            <SummaryPill label="Mood" value={['😞', '😕', '😐', '🙂', '😊'][todayEntry.mood - 1]} />
            <SummaryPill label="Energy" value={`${todayEntry.energy}/10`} />
            <SummaryPill label="Activity" value={todayEntry.activity} />
          </View>
        )}

        {/* Check-in CTA if no entry */}
        {!todayEntry && (
          <TouchableOpacity
            style={styles.checkInCta}
            onPress={() => navigation.navigate('CheckIn')}
            activeOpacity={0.85}
          >
            <Text style={styles.checkInCtaText}>Start your day — check in</Text>
          </TouchableOpacity>
        )}

        {/* Feed */}
        {cards.map((card) => (
          <FeedCardView key={card.id} card={card} />
        ))}
      </ScrollView>
    </View>
  );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillLabel}>{label}</Text>
      <Text style={styles.pillValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: 4,
  },
  headerTitle: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  frameCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  frameEyebrow: {
    fontSize: Typography.xs,
    color: Colors.accent,
    fontWeight: Typography.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.1,
  },
  frameTitle: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: Typography['2xl'] * Typography.tight,
  },
  frameSub: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sm * Typography.normal,
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  pill: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  pillLabel: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    fontWeight: Typography.medium,
  },
  pillValue: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    textTransform: 'capitalize',
  },
  checkInCta: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkInCtaText: {
    fontSize: Typography.md,
    fontWeight: Typography.semibold,
    color: '#fff',
  },
});
