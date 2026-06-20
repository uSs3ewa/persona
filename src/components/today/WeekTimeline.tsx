import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { addDays, format, startOfWeek } from 'date-fns';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius, Spacing, Typography, Shadows } from '@/constants/theme';
import { RootStackParamList } from '@/types';
import { scoreToColor, todayISO } from '@/utils/stateScore';
import { useAppStore } from '@/store/useAppStore';

export function WeekTimeline() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const entries = useAppStore((s) => s.entries);
  const today = todayISO();
  const [weekOffset, setWeekOffset] = useState(0);

  const baseWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekStart = addDays(baseWeekStart, weekOffset * 7);
  const isCurrentWeek = weekOffset === 0;

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const entry = entries.find((e) => e.entry_date === dateStr);
    return {
      dateStr,
      label: format(date, 'EEE')[0],
      dayNum: format(date, 'd'),
      isToday: dateStr === today,
      hasEntry: !!entry,
      score: entry?.state_score,
    };
  });

  return (
    <View style={[styles.card, Shadows.card]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setWeekOffset((o) => o - 1)}
          hitSlop={10}
          style={styles.navBtn}
          activeOpacity={0.6}
        >
          <Text style={styles.navArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>
            {isCurrentWeek ? 'This Week' : format(weekStart, 'MMM d') + ' — ' + format(addDays(weekStart, 6), 'MMM d')}
          </Text>
          <Text style={styles.subtitle}>{format(weekStart, 'MMM d')} — {format(addDays(weekStart, 6), 'MMM d')}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setWeekOffset((o) => o + 1)}
          hitSlop={10}
          style={styles.navBtn}
          activeOpacity={0.6}
          disabled={weekOffset >= 0}
        >
          <Text style={[styles.navArrow, weekOffset >= 0 && styles.navArrowDisabled]}>›</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        {days.map((day) => (
          <TouchableOpacity
            key={day.dateStr}
            style={styles.dayCol}
            onPress={() => {
              navigation.navigate('DayDetail', { date: day.dateStr });
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.dayLabel}>{day.label}</Text>
            <View style={[
              styles.dayNum,
              day.isToday && styles.dayNumToday,
              day.hasEntry && !day.isToday && styles.dayNumHasEntry,
            ]}>
              <Text style={[
                styles.dayNumText,
                day.isToday && styles.dayNumTextToday,
                day.hasEntry && !day.isToday && styles.dayNumTextHasEntry,
              ]}>
                {day.dayNum}
              </Text>
            </View>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor:
                    day.score !== undefined ? scoreToColor(day.score) : Colors.stateEmpty,
                },
                day.score !== undefined && styles.dotActive,
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.xl,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  navBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  navArrow: {
    fontSize: 22,
    color: Colors.textSecondary,
    fontWeight: Typography.semibold,
  },
  navArrowDisabled: {
    color: Colors.textTertiary,
    opacity: 0.3,
  },
  title: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    alignItems: 'center',
    gap: 4,
  },
  dayLabel: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    fontWeight: Typography.medium,
  },
  dayNum: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumToday: {
    backgroundColor: Colors.accent,
  },
  dayNumHasEntry: {
    backgroundColor: Colors.bgCardElevated,
  },
  dayNumText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },
  dayNumTextToday: {
    color: '#fff',
    fontWeight: Typography.semibold,
  },
  dayNumTextHasEntry: {
    color: Colors.textPrimary,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dotActive: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
