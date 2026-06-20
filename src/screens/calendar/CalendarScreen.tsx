import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  startOfMonth,
  subMonths,
} from 'date-fns';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing, Typography, Shadows } from '@/constants/theme';
import { RootStackParamList } from '@/types';
import { scoreToColor, todayISO } from '@/utils/stateScore';
import { useAppStore } from '@/store/useAppStore';
import { StatusPill } from '@/components/ui/StatusPill';

const DAY_HEADERS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function avg(entries: any[], field: string): number {
  if (entries.length === 0) return 0;
  return entries.reduce((s: number, e: any) => s + ((e[field] as number) ?? 0), 0) / entries.length;
}

function getScoreRingColor(score: number): string {
  if (score >= 7) return Colors.metricSleep;
  if (score >= 5) return Colors.metricEnergy;
  if (score >= 3) return '#EF9F27';
  return Colors.textTertiary;
}

function getActivityEmoji(activity: string): string | null {
  if (activity === 'hard') return '🔥';
  if (activity === 'medium') return '💪';
  return null;
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

export function CalendarScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const entries = useAppStore((s) => s.entries);
  const startEditingEntry = useAppStore((s) => s.startEditingEntry);
  const today = todayISO();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(today);
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = (getDay(monthStart) + 6) % 7;

  const entryMap = Object.fromEntries(entries.map((e) => [e.entry_date, e]));
  const selectedEntry = selectedDate ? entryMap[selectedDate] : undefined;

  // Monthly stats
  const monthEntries = useMemo(() => {
    const monthStr = format(currentMonth, 'yyyy-MM');
    return entries.filter((e) => e.entry_date.startsWith(monthStr));
  }, [entries, currentMonth]);

  const monthStats = useMemo(() => {
    if (monthEntries.length === 0) return null;
    const avgEnergy = avg(monthEntries, 'energy');
    const avgMood = avg(monthEntries, 'mood');
    const avgSleep = avg(monthEntries, 'sleep_hours');
    const avgScore = avg(monthEntries, 'state_score');

    // Previous month for comparison
    const prevMonth = subMonths(currentMonth, 1);
    const prevMonthStr = format(prevMonth, 'yyyy-MM');
    const prevEntries = entries.filter((e) => e.entry_date.startsWith(prevMonthStr));
    const prevEnergy = avg(prevEntries, 'energy');
    const prevMood = avg(prevEntries, 'mood');
    const prevSleep = avg(prevEntries, 'sleep_hours');

    const energyChange = prevEnergy > 0 ? ((avgEnergy - prevEnergy) / prevEnergy) * 100 : 0;
    const moodChange = prevMood > 0 ? ((avgMood - prevMood) / prevMood) * 100 : 0;
    const sleepChange = prevSleep > 0 ? ((avgSleep - prevSleep) / prevSleep) * 100 : 0;

    // Best day
    const bestDay = monthEntries.reduce((best, e) =>
      (e.state_score ?? 0) > (best.state_score ?? 0) ? e : best, monthEntries[0]);

    return {
      avgEnergy,
      avgMood,
      avgSleep,
      avgScore,
      daysLogged: monthEntries.length,
      energyChange,
      moodChange,
      sleepChange,
      bestDay: bestDay?.entry_date,
      bestDayScore: bestDay?.state_score,
    };
  }, [monthEntries, entries, currentMonth]);

  // Streak
  const streak = useMemo(() => {
    let count = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      if (entries.some((e) => e.entry_date === dateStr)) {
        count++;
      } else if (dateStr !== today) break;
    }
    return count;
  }, [entries]);

  const changeIcon = (change: number) => change > 0 ? '↑' : change < 0 ? '↓' : '→';
  const changeColor = (change: number) => change > 0 ? Colors.success : change < 0 ? Colors.danger : Colors.textTertiary;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Calendar</Text>
          <Text style={styles.headerSub}>Your journey over time.</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {!hasHydrated ? (
          <View style={styles.loadingWrap}>
            <View style={[styles.skeleton, { height: 24, width: '60%' }]} />
            <View style={[styles.skeleton, { height: 280, width: '100%' }]} />
          </View>
        ) : null}

        {/* Month nav */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={() => setCurrentMonth((m) => subMonths(m, 1))} hitSlop={12}>
            <Text style={styles.navArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{format(currentMonth, 'MMMM yyyy')}</Text>
          <TouchableOpacity onPress={() => setCurrentMonth((m) => addMonths(m, 1))} hitSlop={12}>
            <Text style={styles.navArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {hasHydrated && entries.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>No entries yet</Text>
            <Text style={styles.emptyBody}>
              Do your first morning check-in to see your calendar fill with state intensity.
            </Text>
          </View>
        )}

        {/* Calendar Grid */}
        <View style={[styles.calendarCard, Shadows.card]}>
          <View style={styles.grid}>
            {DAY_HEADERS.map((d, i) => (
              <Text key={i} style={styles.dayHeader}>{d}</Text>
            ))}

            {Array.from({ length: startPadding }).map((_, i) => (
              <View key={`pad-${i}`} style={styles.cell} />
            ))}

            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const entry = entryMap[dateStr];
              const isToday = dateStr === today;
              const hasFuture = dateStr > today;
              const isSelected = selectedDate === dateStr;
              const ringColor = entry ? getScoreRingColor(entry.state_score ?? 0) : undefined;
              const activityEmoji = entry ? getActivityEmoji(entry.activity) : null;

              return (
                <TouchableOpacity
                  key={dateStr}
                  style={styles.cell}
                  onPress={() => {
                    if (entry) {
                      navigation.navigate('DayDetail', { date: dateStr });
                    } else {
                      setSelectedDate(dateStr);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.dayCircle,
                      isToday && styles.dayCircleToday,
                      isSelected && !isToday && styles.dayCircleSelected,
                      entry && !isToday && {
                        borderWidth: 2,
                        borderColor: ringColor,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayNum,
                        isToday && styles.dayNumToday,
                        hasFuture && styles.dayNumFuture,
                        entry && !isToday && styles.dayNumEntry,
                        isToday && styles.dayNumTodayBold,
                      ]}
                    >
                      {format(day, 'd')}
                    </Text>
                  </View>
                  {activityEmoji && (
                    <Text style={styles.activityBadge}>{activityEmoji}</Text>
                  )}
                  {isToday && (
                    <Text style={styles.todayBadge}>✦</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Monthly Overview Card */}
        {hasHydrated && monthStats && (
          <View style={[styles.monthOverviewCard, Shadows.card]}>
            <View style={styles.monthOverviewLeft}>
              <Text style={styles.monthOverviewTitle}>{format(currentMonth, 'MMMM yyyy')}</Text>
              <Text style={styles.monthOverviewDesc}>
                {monthStats.daysLogged > 10
                  ? 'You were consistent and your body responded.'
                  : monthStats.daysLogged > 0
                  ? `${monthStats.daysLogged} days tracked this month.`
                  : 'Start tracking to see your monthly story.'}
              </Text>
              <TouchableOpacity
                style={styles.monthSummaryBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.monthSummaryBtnText}>Monthly Summary →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.monthOverviewMetrics}>
              {[
                { icon: '⚡', label: 'Energy', value: `${monthStats.energyChange > 0 ? '+' : ''}${monthStats.energyChange.toFixed(0)}%`, color: Colors.metricEnergy, change: monthStats.energyChange },
                { icon: '😊', label: 'Mood', value: `${monthStats.moodChange > 0 ? '+' : ''}${monthStats.moodChange.toFixed(0)}%`, color: Colors.metricMood, change: monthStats.moodChange },
                { icon: '🌙', label: 'Sleep', value: `${monthStats.sleepChange > 0 ? '+' : ''}${monthStats.sleepChange.toFixed(0)}%`, color: Colors.metricSleep, change: monthStats.sleepChange },
              ].map((m) => (
                <View key={m.label} style={styles.miniMetric}>
                  <View style={styles.miniMetricHeader}>
                    <Text style={styles.miniMetricIcon}>{m.icon}</Text>
                    <Text style={styles.miniMetricLabel}>{m.label}</Text>
                  </View>
                  <Text style={[styles.miniMetricValue, { color: m.color }]}>{m.value}</Text>
                </View>
              ))}
            </View>
            <View style={styles.monthOverviewBottom}>
              <View style={styles.monthStat}>
                <Text style={styles.monthStatIcon}>🔥</Text>
                <Text style={styles.monthStatLabel}>Longest streak</Text>
                <Text style={styles.monthStatValue}>{streak} days</Text>
              </View>
              {monthStats.bestDay && (
                <View style={styles.monthStat}>
                  <Text style={styles.monthStatIcon}>✦</Text>
                  <Text style={styles.monthStatLabel}>Best day</Text>
                  <Text style={styles.monthStatValue}>{format(new Date(monthStats.bestDay + 'T00:00:00'), 'MMM d')}</Text>
                </View>
              )}
              <View style={styles.monthStat}>
                <Text style={styles.monthStatIcon}>◎</Text>
                <Text style={styles.monthStatLabel}>Avg. readiness</Text>
                <Text style={styles.monthStatValue}>{(monthStats.avgScore * 10).toFixed(0)}%</Text>
              </View>
            </View>
          </View>
        )}

        {/* Trends This Month */}
        {hasHydrated && monthStats && monthEntries.length > 0 && (
          <View style={[styles.trendsCard, Shadows.card]}>
            <View style={styles.trendsHeader}>
              <Text style={styles.trendsTitle}>Trends This Month</Text>
              <TouchableOpacity activeOpacity={0.8}>
                <Text style={styles.seeAllInsights}>See all insights →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.trendsLegend}>
              {[
                { label: 'Energy', color: Colors.metricEnergy },
                { label: 'Mood', color: Colors.metricMood },
                { label: 'Sleep', color: Colors.metricSleep },
                { label: 'Recovery', color: Colors.success },
              ].map((l) => (
                <View key={l.label} style={styles.legendDot}>
                  <View style={[styles.legendDotCircle, { backgroundColor: l.color }]} />
                  <Text style={styles.legendDotLabel}>{l.label}</Text>
                </View>
              ))}
            </View>

            {/* Sparkline-style chart placeholder */}
            <View style={styles.chartArea}>
              <View style={styles.chartLine}>
                {[40, 55, 45, 60, 50, 65, 70, 60, 75, 80, 70, 85].map((h, i) => (
                  <View
                    key={i}
                    style={[
                      styles.chartDot,
                      {
                        bottom: `${h}%`,
                        left: `${(i / 11) * 100}%`,
                        backgroundColor: i === 5 ? Colors.metricMood : Colors.accent + '40',
                      },
                    ]}
                  />
                ))}
                <View style={[styles.chartLinePath, { backgroundColor: Colors.accent + '30' }]} />
              </View>
            </View>

            <View style={styles.trendsStats}>
              {[
                { label: 'Energy', value: `${(monthStats.avgEnergy * 10).toFixed(0)}`, change: monthStats.energyChange, color: Colors.metricEnergy },
                { label: 'Mood', value: getMoodLabel(Math.round(monthStats.avgMood)), change: monthStats.moodChange, color: Colors.metricMood },
                { label: 'Sleep', value: `${monthStats.avgSleep.toFixed(0)}h ${((monthStats.avgSleep % 1) * 60).toFixed(0)}m`, change: monthStats.sleepChange, color: Colors.metricSleep },
                { label: 'Recovery', value: `${(monthStats.avgScore * 10).toFixed(0)}%`, change: monthStats.energyChange, color: Colors.success },
              ].map((s) => (
                <View key={s.label} style={styles.trendStatRow}>
                  <Text style={[styles.trendStatLabel, { color: s.color }]}>{s.label}</Text>
                  <Text style={[styles.trendStatValue, { color: s.color }]}>{s.value}</Text>
                  <Text style={[styles.trendStatChange, { color: changeColor(s.change) }]}>
                    {changeIcon(s.change)}{s.change > 0 ? '+' : ''}{s.change.toFixed(0)}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
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
  headerTitle: {
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
  content: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg },
  loadingWrap: { gap: Spacing.md, marginBottom: Spacing.xl },
  skeleton: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    opacity: 0.6,
  },

  // Monthly Overview
  monthOverviewCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius['2xl'],
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.xl,
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  monthOverviewLeft: {
    gap: Spacing.sm,
  },
  monthOverviewTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.semibold,
    color: Colors.accent,
    letterSpacing: -0.3,
  },
  monthOverviewDesc: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    lineHeight: Typography.base * Typography.normal,
  },
  monthSummaryBtn: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accent + '15',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.full,
    marginTop: Spacing.xs,
  },
  monthSummaryBtnText: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.accent,
  },
  monthOverviewMetrics: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  miniMetric: {
    flex: 1,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  miniMetricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniMetricIcon: { fontSize: 12 },
  miniMetricLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: Typography.medium,
  },
  miniMetricValue: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
  monthOverviewBottom: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  monthStat: {
    alignItems: 'center',
    gap: 3,
  },
  monthStatIcon: { fontSize: 14 },
  monthStatLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  monthStatValue: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },

  // Month nav
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  navArrow: {
    fontSize: 24,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.sm,
  },
  monthLabel: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    minWidth: 160,
    textAlign: 'center',
  },

  // Calendar card
  calendarCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius['2xl'],
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayHeader: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: Typography.semibold,
    paddingBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  dayCircleToday: {
    backgroundColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  dayCircleSelected: {
    borderWidth: 2,
    borderColor: Colors.borderStrong,
  },
  dayNum: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  dayNumToday: {
    color: '#fff',
    fontWeight: Typography.semibold,
  },
  dayNumTodayBold: {
    fontSize: Typography.base,
  },
  dayNumFuture: {
    color: Colors.textTertiary,
  },
  dayNumEntry: {
    color: Colors.textPrimary,
    fontWeight: Typography.medium,
  },
  activityBadge: {
    position: 'absolute',
    top: 2,
    right: 6,
    fontSize: 8,
  },
  todayBadge: {
    position: 'absolute',
    top: 2,
    right: 6,
    fontSize: 8,
    color: Colors.metricMood,
  },

  // Day detail
  dayDetailCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius['2xl'],
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.xl,
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
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
  insightText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sm * Typography.normal,
  },
  seeInsight: {
    fontSize: Typography.sm,
    color: Colors.accent,
    fontWeight: Typography.medium,
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
  noEntryHint: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sm * Typography.normal,
  },
  checkInBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  checkInBtnText: {
    fontSize: Typography.md,
    fontWeight: Typography.semibold,
    color: '#fff',
  },

  // Empty
  emptyWrap: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  emptyBody: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sm * Typography.normal,
  },

  // Trends
  trendsCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius['2xl'],
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  trendsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendsTitle: {
    fontSize: Typography.md,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  seeAllInsights: {
    fontSize: Typography.sm,
    color: Colors.accent,
    fontWeight: Typography.medium,
  },
  trendsLegend: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  legendDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDotCircle: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendDotLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  chartArea: {
    height: 80,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  chartLine: {
    flex: 1,
    position: 'relative',
  },
  chartDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chartLinePath: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '40%',
    height: 1,
    borderRadius: 0.5,
  },
  trendsStats: {
    gap: Spacing.sm,
  },
  trendStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  trendStatLabel: {
    fontSize: Typography.sm,
    width: 60,
    fontWeight: Typography.medium,
  },
  trendStatValue: {
    fontSize: Typography.md,
    fontWeight: Typography.semibold,
    flex: 1,
  },
  trendStatChange: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
});
