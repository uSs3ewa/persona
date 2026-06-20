import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WeekTimeline } from '@/components/today/WeekTimeline';
import { Colors, Spacing, Typography, Radius, Shadows, MOOD_EMOJI } from '@/constants/theme';
import { RootStackParamList } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { DashboardHeroCard } from '@/components/ui/DashboardHeroCard';
import { StatusPill } from '@/components/ui/StatusPill';
import { EmptyState } from '@/components/ui/EmptyState';
import { scoreToColor, todayISO } from '@/utils/stateScore';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getScoreLabel(score: number): string {
  if (score >= 8) return 'Excellent';
  if (score >= 6) return 'Great';
  if (score >= 4) return 'Good';
  if (score >= 2) return 'Fair';
  return 'Low';
}

function getEnergyLabel(energy: number): string {
  if (energy >= 8) return 'High';
  if (energy >= 5) return 'Good';
  if (energy >= 3) return 'Moderate';
  return 'Low';
}

function getMoodLabel(mood: number): string {
  return ['Rough', 'Low', 'Okay', 'Good', 'Great'][mood - 1] ?? '—';
}

function getSleepLabel(hours: number): string {
  if (hours >= 8) return 'Great';
  if (hours >= 7) return 'Good';
  if (hours >= 6) return 'Fair';
  return 'Poor';
}

export function TodayScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const getTodayEntry = useAppStore((s) => s.getTodayEntry);
  const loadMockData = useAppStore((s) => s.loadMockData);
  const entries = useAppStore((s) => s.entries);
  const startEditingEntry = useAppStore((s) => s.startEditingEntry);
  const todayEntry = hasHydrated ? getTodayEntry() : undefined;
  const yesterdayEntry = useMemo(() => {
    if (entries.length === 0) return undefined;
    const today = todayISO();
    return entries.find((e) => e.entry_date !== today);
  }, [entries]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (__DEV__ && entries.length === 0) loadMockData();
  }, [hasHydrated]);

  const hasCheckedIn = todayEntry !== undefined;
  const streak = useMemo(() => {
    let count = 0;
    const today = todayISO();
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      if (entries.some((e) => e.entry_date === dateStr)) {
        count++;
      } else if (dateStr !== today) break;
    }
    return count;
  }, [entries]);

  const today = todayISO();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.headerSub}>Here's your day so far</Text>
        </View>
        {streak > 0 && (
          <StatusPill label={`${streak} day streak`} icon="🔥" color={Colors.warning} size="sm" />
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {!hasHydrated ? (
          <LoadingToday />
        ) : hasCheckedIn ? (
          <>
            <WeekTimeline />

            <View style={styles.statusRow}>
              <StatusPill
                label={todayEntry.mood <= 2 ? 'Low energy' : todayEntry.mood >= 4 ? 'Great mood' : 'Steady'}
                icon={MOOD_EMOJI[todayEntry.mood]}
                color={todayEntry.mood >= 4 ? Colors.success : todayEntry.mood <= 2 ? Colors.danger : Colors.accent}
                size="sm"
              />
              <StatusPill
                label={todayEntry.activity === 'hard' ? 'Hard training' : todayEntry.activity === 'none' ? 'Rest day' : 'Active'}
                color={todayEntry.activity === 'hard' ? Colors.metricTraining : todayEntry.activity === 'none' ? Colors.textTertiary : Colors.metricNutrition}
                size="sm"
              />
            </View>

            <View style={styles.frameCardWrap}>
              <DashboardHeroCard
                eyebrow="Today's Frame"
                title={todayEntry.generated_frame ?? 'Your Frame'}
                subtitle={todayEntry.generated_frame_sub}
                accentColor={Colors.accent}
                rightAction={
                  <TouchableOpacity onPress={() => {
                    startEditingEntry(todayEntry);
                    navigation.navigate('CheckIn');
                  }} activeOpacity={0.8}>
                    <Text style={styles.editBtn}>Edit</Text>
                  </TouchableOpacity>
                }
              />
            </View>

            <View style={[styles.dayDetailCard, Shadows.card]}>
              <View style={styles.dayDetailHeader}>
                <View style={styles.dayDetailTitleRow}>
                  <Text style={styles.dayDetailIcon}>✦</Text>
                  <Text style={styles.dayDetailTitle}>Today</Text>
                  {(todayEntry.state_score ?? 0) >= 8 && (
                    <StatusPill label="Best day" size="sm" color={Colors.metricMood} />
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('DayDetail', { date: today })}
                  activeOpacity={0.8}
                >
                  <Text style={styles.viewFullDay}>View full day →</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dayDetailMetrics}>
                <View style={styles.readinessSection}>
                  <Text style={styles.readinessLabel}>Readiness</Text>
                  <View style={styles.readinessRing}>
                    <View style={[styles.ringOuter, { borderColor: scoreToColor(todayEntry.state_score ?? 0) }]}>
                      <Text style={styles.readinessValue}>
                        {Math.round((todayEntry.state_score ?? 0) * 10)}
                      </Text>
                      <Text style={styles.readinessSub}>{getScoreLabel(todayEntry.state_score ?? 0)}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.dayMetricsGrid}>
                  <View style={styles.dayMetricItem}>
                    <Text style={styles.dayMetricIcon}>🌙</Text>
                    <Text style={styles.dayMetricLabel}>Sleep</Text>
                    <Text style={styles.dayMetricValue}>{todayEntry.sleep_hours}h</Text>
                    <Text style={styles.dayMetricSub}>{getSleepLabel(todayEntry.sleep_hours)}</Text>
                  </View>
                  <View style={styles.dayMetricItem}>
                    <Text style={styles.dayMetricIcon}>😊</Text>
                    <Text style={styles.dayMetricLabel}>Mood</Text>
                    <Text style={styles.dayMetricValue}>{getMoodLabel(todayEntry.mood)}</Text>
                    <Text style={styles.dayMetricSub}>Stable</Text>
                  </View>
                  <View style={styles.dayMetricItem}>
                    <Text style={styles.dayMetricIcon}>⚡</Text>
                    <Text style={styles.dayMetricLabel}>Energy</Text>
                    <Text style={styles.dayMetricValue}>{getEnergyLabel(todayEntry.energy)}</Text>
                    <Text style={[styles.dayMetricSub, { color: Colors.success }]}>+{todayEntry.energy}%</Text>
                  </View>
                </View>
              </View>

              <View style={styles.dayDetailSections}>
                <View style={styles.dayDetailSection}>
                  <Text style={styles.dayDetailSectionTitle}>What happened</Text>
                  <View style={styles.timelineItem}>
                    <Text style={styles.timelineIcon}>
                      {todayEntry.activity === 'hard' ? '🔥' : todayEntry.activity === 'medium' ? '💪' : '🚶'}
                    </Text>
                    <Text style={styles.timelineText}>{todayEntry.activity} activity</Text>
                    <Text style={styles.timelineTime}>Today</Text>
                  </View>
                  <View style={styles.timelineItem}>
                    <Text style={styles.timelineIcon}>🍎</Text>
                    <Text style={styles.timelineText}>{todayEntry.nutrition === 'good' ? 'Good nutrition' : todayEntry.nutrition === 'ok' ? 'On plan' : 'Poor nutrition'}</Text>
                    <Text style={styles.timelineTime}>All day</Text>
                  </View>
                  <View style={styles.timelineItem}>
                    <Text style={styles.timelineIcon}>🌙</Text>
                    <Text style={styles.timelineText}>{todayEntry.sleep_hours}h sleep</Text>
                    <Text style={styles.timelineTime}>Last night</Text>
                  </View>
                </View>

                {todayEntry.generated_insights && todayEntry.generated_insights.length > 0 && (
                  <View style={styles.dayDetailSection}>
                    <Text style={styles.dayDetailSectionTitle}>Top Insight</Text>
                    <Text style={styles.dayInsightText}>{todayEntry.generated_insights[0].title}</Text>
                  </View>
                )}

                {todayEntry.note && (
                  <View style={styles.dayDetailSection}>
                    <View style={styles.notesHeader}>
                      <Text style={styles.dayDetailSectionTitle}>Notes</Text>
                      <TouchableOpacity
                        onPress={() => {
                          startEditingEntry(todayEntry);
                          navigation.navigate('CheckIn');
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.notesEditIcon}>✎</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.notesText}>{todayEntry.note}</Text>
                  </View>
                )}
              </View>
            </View>

            {yesterdayEntry && (
              <View style={styles.yesterdayCard}>
                <Text style={styles.sectionEyebrow}>Continue Yesterday</Text>
                <View style={styles.yesterdayRow}>
                  <View style={styles.yesterdayCol}>
                    <Text style={styles.yesterdayLabel}>Frame</Text>
                    <Text style={styles.yesterdayValue}>{yesterdayEntry.generated_frame ?? '—'}</Text>
                  </View>
                  <View style={styles.yesterdayDivider} />
                  <View style={styles.yesterdayCol}>
                    <Text style={styles.yesterdayLabel}>Score</Text>
                    <Text style={[styles.yesterdayValue, { color: Colors.accent }]}>
                      {(yesterdayEntry.state_score ?? 0).toFixed(1)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <WeekTimeline />
            <EmptyState
              icon="✦"
              title="Ready to begin?"
              body="Take 60 seconds to check in. Understand your state before you decide your day."
              action={
                <TouchableOpacity style={styles.checkInBtn} onPress={() => navigation.navigate('CheckIn')} activeOpacity={0.85}>
                  <Text style={styles.checkInBtnLabel}>Start check-in</Text>
                </TouchableOpacity>
              }
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function LoadingToday() {
  return (
    <View style={styles.loadingWrap}>
      <View style={[styles.skeleton, { width: '100%', height: 140 }]} />
      <View style={styles.skeletonRow}>
        <View style={[styles.skeleton, { flex: 1, height: 80 }]} />
        <View style={[styles.skeleton, { flex: 1, height: 80 }]} />
        <View style={[styles.skeleton, { flex: 1, height: 80 }]} />
      </View>
      <View style={[styles.skeleton, { width: '100%', height: 100 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  greeting: {
    fontSize: Typography['3xl'],
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    letterSpacing: -0.8,
  },
  headerSub: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  editBtn: {
    fontSize: Typography.sm,
    color: Colors.accent,
    fontWeight: Typography.medium,
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
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    opacity: 0.65,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  frameCardWrap: {
    marginHorizontal: Spacing.xl,
  },
  emptyContainer: {
    gap: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  checkInBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  checkInBtnLabel: {
    fontSize: Typography.md,
    fontWeight: Typography.semibold,
    color: '#fff',
  },

  // Day detail card
  dayDetailCard: {
    marginHorizontal: Spacing.xl,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius['2xl'],
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  dayDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayDetailTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  dayDetailIcon: {
    fontSize: 16,
    color: Colors.metricMood,
  },
  dayDetailTitle: {
    fontSize: Typography.md,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  viewFullDay: {
    fontSize: Typography.sm,
    color: Colors.accent,
    fontWeight: Typography.medium,
  },

  // Readiness
  dayDetailMetrics: {
    flexDirection: 'row',
    gap: Spacing.lg,
    alignItems: 'center',
  },
  readinessSection: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  readinessLabel: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    fontWeight: Typography.medium,
  },
  readinessRing: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readinessValue: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  readinessSub: {
    fontSize: 10,
    color: Colors.textTertiary,
  },

  dayMetricsGrid: {
    flex: 1,
    gap: Spacing.sm,
  },
  dayMetricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    padding: Spacing.sm + 2,
  },
  dayMetricIcon: { fontSize: 14 },
  dayMetricLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    width: 42,
  },
  dayMetricValue: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    flex: 1,
  },
  dayMetricSub: {
    fontSize: 11,
    color: Colors.textTertiary,
  },

  // Day detail sections
  dayDetailSections: {
    gap: Spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    paddingTop: Spacing.lg,
  },
  dayDetailSection: {
    gap: Spacing.sm,
  },
  dayDetailSectionTitle: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.accent,
    letterSpacing: 0.3,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 3,
  },
  timelineIcon: { fontSize: 14 },
  timelineText: {
    fontSize: Typography.sm,
    color: Colors.textPrimary,
    flex: 1,
  },
  timelineTime: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
  },
  dayInsightText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sm * Typography.normal,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notesEditIcon: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  notesText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sm * Typography.normal,
  },

  // Yesterday
  yesterdayCard: {
    marginHorizontal: Spacing.xl,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  sectionEyebrow: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    fontWeight: Typography.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  yesterdayRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yesterdayCol: {
    flex: 1,
    gap: 4,
  },
  yesterdayDivider: {
    width: 0.5,
    height: 30,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.lg,
  },
  yesterdayLabel: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    fontWeight: Typography.medium,
  },
  yesterdayValue: {
    fontSize: Typography.md,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
});
