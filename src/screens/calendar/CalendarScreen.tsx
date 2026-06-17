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
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { RootStackParamList } from '@/types';
import { scoreToColor, todayISO } from '@/utils/stateScore';
import { useAppStore } from '@/store/useAppStore';

const DAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function CalendarScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const entries = useAppStore((s) => s.entries);
  const startEditingEntry = useAppStore((s) => s.startEditingEntry);
  const today = todayISO();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Days of the month
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Leading empty cells (Mon = 0)
  const startPadding = (getDay(monthStart) + 6) % 7; // shift so Mon=0

  const entryMap = Object.fromEntries(entries.map((e) => [e.entry_date, e]));
  const selectedEntry = selectedDate ? entryMap[selectedDate] : undefined;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
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
            <Text style={styles.navArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{format(currentMonth, 'MMMM yyyy')}</Text>
          <TouchableOpacity onPress={() => setCurrentMonth((m) => addMonths(m, 1))} hitSlop={12}>
            <Text style={styles.navArrow}>→</Text>
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

        {hasHydrated && selectedDate && (
          <View style={styles.actionCard}>
            <Text style={styles.actionTitle}>{selectedDate === today ? 'Today' : selectedDate}</Text>
            {selectedEntry ? (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => navigation.navigate('DayDetail', { date: selectedDate })}
                  activeOpacity={0.85}
                >
                  <Text style={styles.actionBtnText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnPrimary]}
                  onPress={() => {
                    startEditingEntry(selectedEntry);
                    navigation.navigate('CheckIn');
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.actionBtnText, styles.actionBtnTextPrimary]}>Edit</Text>
                </TouchableOpacity>
              </View>
            ) : selectedDate === today ? (
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnPrimary]}
                onPress={() => navigation.navigate('CheckIn')}
                activeOpacity={0.85}
              >
                <Text style={[styles.actionBtnText, styles.actionBtnTextPrimary]}>Add check-in</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.actionHint}>No entry for this day.</Text>
            )}
          </View>
        )}

        {/* Day headers */}
        <View style={styles.grid}>
          {DAY_HEADERS.map((d, i) => (
            <Text key={i} style={styles.dayHeader}>{d}</Text>
          ))}

          {/* Leading padding */}
          {Array.from({ length: startPadding }).map((_, i) => (
            <View key={`pad-${i}`} style={styles.cell} />
          ))}

          {/* Days */}
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const entry = entryMap[dateStr];
            const isToday = dateStr === today;
            const hasFuture = dateStr > today;
            const isSelected = selectedDate === dateStr;

            return (
              <TouchableOpacity
                key={dateStr}
                style={styles.cell}
                onPress={() => {
                  setSelectedDate(dateStr);
                  if (entry) navigation.navigate('DayDetail', { date: dateStr });
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.dayCircle,
                    isToday && styles.dayCircleToday,
                    isSelected && styles.dayCircleSelected,
                    entry && !isToday && {
                      backgroundColor: scoreToColor(entry.state_score ?? 0),
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayNum,
                      isToday && styles.dayNumToday,
                      hasFuture && styles.dayNumFuture,
                      entry && !isToday && styles.dayNumEntry,
                    ]}
                  >
                    {format(day, 'd')}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Energy overview</Text>
          <Text style={styles.legendSub}>Higher intensity means better energy and balance.</Text>
          <View style={styles.legendBar}>
            {[Colors.stateLow, Colors.stateMid, Colors.stateHigh].map((c, i) => (
              <View key={i} style={[styles.legendSegment, { backgroundColor: c }]} />
            ))}
          </View>
          <View style={styles.legendLabels}>
            <Text style={styles.legendLabel}>Low</Text>
            <Text style={styles.legendLabel}>High</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg },
  loadingWrap: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  skeleton: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    opacity: 0.6,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  navArrow: {
    fontSize: 20,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.sm,
  },
  monthLabel: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  actionTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  actionHint: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sm * Typography.normal,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionBtnPrimary: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  actionBtnText: {
    fontSize: Typography.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.medium,
  },
  actionBtnTextPrimary: {
    color: '#fff',
    fontWeight: Typography.semibold,
  },
  emptyWrap: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
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
  dayHeader: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    fontWeight: Typography.medium,
    paddingBottom: Spacing.sm,
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
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
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  dayCircleSelected: {
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
  },
  dayNum: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  dayNumToday: {
    color: Colors.accent,
    fontWeight: Typography.semibold,
  },
  dayNumFuture: {
    color: Colors.textTertiary,
  },
  dayNumEntry: {
    color: Colors.textPrimary,
    fontWeight: Typography.medium,
  },
  legend: {
    marginTop: Spacing['2xl'],
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  legendTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.medium,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  legendSub: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  legendBar: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    gap: 2,
  },
  legendSegment: {
    flex: 1,
    borderRadius: 3,
  },
  legendLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  legendLabel: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
  },
});
