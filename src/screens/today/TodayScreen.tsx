import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { InsightCard } from '@/components/today/InsightCard';
import { FrameCard } from '@/components/today/FrameCard';
import { WeekTimeline } from '@/components/today/WeekTimeline';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { DailyEntry, RootStackParamList } from '@/types';
import { useAppStore } from '@/store/useAppStore';

export function TodayScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const getTodayEntry = useAppStore((s) => s.getTodayEntry);
  const loadMockData = useAppStore((s) => s.loadMockData);
  const entries = useAppStore((s) => s.entries);
  const startEditingEntry = useAppStore((s) => s.startEditingEntry);
  const todayEntry = hasHydrated ? getTodayEntry() : undefined;

  // Load mock data on first run (dev convenience)
  useEffect(() => {
    if (!hasHydrated) return;
    if (__DEV__ && entries.length === 0) loadMockData();
  }, [hasHydrated]);

  const hasCheckedIn = todayEntry !== undefined;
  const insights = todayEntry?.generated_insights ?? [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logoText}>FRAME</Text>
      </View>

      {/* Week timeline */}
      <WeekTimeline />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {!hasHydrated ? (
          <LoadingToday />
        ) : hasCheckedIn ? (
          <>
            {/* Frame card */}
            <FrameCard entry={todayEntry} />

            {/* Check-in summary */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Today's Check-in</Text>
                <TouchableOpacity
                  onPress={() => {
                    if (!todayEntry) return;
                    startEditingEntry(todayEntry);
                    navigation.navigate('CheckIn');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.editBtn}>Edit</Text>
                </TouchableOpacity>
              </View>
              <CheckInSummary entry={todayEntry} />
            </View>

            {/* Insights feed */}
            {insights.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Insights for you</Text>
                {insights.map((insight, i) => (
                  <InsightCard key={i} insight={insight} />
                ))}
              </View>
            )}
          </>
        ) : (
          <EmptyToday onStartCheckIn={() => navigation.navigate('CheckIn')} />
        )}
      </ScrollView>
    </View>
  );
}

function LoadingToday() {
  return (
    <View style={styles.loadingWrap}>
      <View style={[styles.skeleton, { width: '40%', height: 18 }]} />
      <View style={[styles.skeleton, { width: '100%', height: 120 }]} />
      <View style={[styles.skeleton, { width: '100%', height: 90 }]} />
      <View style={[styles.skeleton, { width: '100%', height: 90 }]} />
    </View>
  );
}

function CheckInSummary({ entry }: { entry: DailyEntry }) {
  const rows = [
    { label: 'Mood', value: ['😞', '😕', '😐', '🙂', '😊'][entry.mood - 1] },
    { label: 'Energy', value: `${entry.energy} / 10` },
    { label: 'Activity', value: entry.activity },
    { label: 'Nutrition', value: entry.nutrition === 'ok' ? 'On plan' : entry.nutrition },
  ];
  return (
    <View style={styles.summaryCard}>
      {rows.map((r) => (
        <View key={r.label} style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{r.label}</Text>
          <Text style={styles.summaryValue}>{r.value}</Text>
        </View>
      ))}
    </View>
  );
}

function EmptyToday({ onStartCheckIn }: { onStartCheckIn: () => void }) {
  return (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyTitle}>Good morning.</Text>
      <Text style={styles.emptyBody}>
        Take 60 seconds to check in. Understand your state before you decide your day.
      </Text>
      <TouchableOpacity style={styles.checkInBtn} onPress={onStartCheckIn} activeOpacity={0.85}>
        <Text style={styles.checkInBtnLabel}>Start check-in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  logoText: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.accent,
    letterSpacing: 3,
  },
  scroll: { flex: 1 },
  scrollContent: { gap: Spacing.lg, paddingTop: Spacing.sm },
  loadingWrap: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  skeleton: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Colors.border,
    opacity: 0.65,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    fontWeight: Typography.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.1,
  },
  editBtn: {
    fontSize: Typography.sm,
    color: Colors.accent,
  },
  summaryCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  summaryLabel: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.textPrimary,
    textTransform: 'capitalize',
  },
  emptyWrap: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['3xl'],
    gap: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  emptyBody: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    lineHeight: Typography.base * Typography.normal,
  },
  checkInBtn: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkInBtnLabel: {
    fontSize: Typography.md,
    fontWeight: Typography.semibold,
    color: '#fff',
  },
});
