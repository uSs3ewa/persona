import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { addDays, format, startOfWeek } from 'date-fns';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { RootStackParamList } from '@/types';
import { scoreToColor, todayISO } from '@/utils/stateScore';
import { useAppStore } from '@/store/useAppStore';

export function WeekTimeline() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const entries = useAppStore((s) => s.entries);
  const today = todayISO();

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Mon
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const entry = entries.find((e) => e.entry_date === dateStr);
    return {
      dateStr,
      label: format(date, 'EEE')[0], // M T W T F S S
      dayNum: format(date, 'd'),
      isToday: dateStr === today,
      score: entry?.state_score,
    };
  });

  return (
    <View style={styles.row}>
      {days.map((day) => (
        <TouchableOpacity
          key={day.dateStr}
          style={styles.dayCol}
          onPress={() => {
            if (day.score !== undefined) {
              navigation.navigate('DayDetail', { date: day.dateStr });
            }
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.dayLabel}>{day.label}</Text>
          <View style={[styles.dayNum, day.isToday && styles.dayNumToday]}>
            <Text style={[styles.dayNumText, day.isToday && styles.dayNumTextToday]}>
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
            ]}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
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
  dayNumText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },
  dayNumTextToday: {
    color: '#fff',
    fontWeight: Typography.semibold,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
