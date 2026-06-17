import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StepShell } from '@/components/checkin/StepShell';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { CheckInParamList } from '@/navigation/CheckInNavigator';
import { useAppStore } from '@/store/useAppStore';

const QUICK = [4, 5, 6, 7, 8, 9] as const;

export default function SleepStep() {
  const navigation = useNavigation<NativeStackNavigationProp<CheckInParamList>>();
  const { checkInDraft, setCheckInDraft } = useAppStore();

  const sleepHours = checkInDraft.sleep_hours;
  const valueLabel = useMemo(() => `${sleepHours.toFixed(1)}h`, [sleepHours]);

  const setHours = (val: number) => {
    const next = Math.min(12, Math.max(0, Math.round(val * 2) / 2));
    Haptics.selectionAsync();
    setCheckInDraft({ sleep_hours: next });
  };

  return (
    <StepShell
      step={1}
      totalSteps={6}
      question="How did you sleep?"
      subLabel="Hours slept last night"
      onNext={() => navigation.navigate('Mood')}
    >
      <View style={styles.wrap}>
        <Text style={styles.value}>{valueLabel}</Text>

        <View style={styles.controls}>
          <TouchableOpacity
            onPress={() => setHours(sleepHours - 0.5)}
            activeOpacity={0.75}
            style={styles.controlBtn}
          >
            <Text style={styles.controlLabel}>−</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setHours(sleepHours + 0.5)}
            activeOpacity={0.75}
            style={styles.controlBtn}
          >
            <Text style={styles.controlLabel}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickRow}>
          {QUICK.map((h) => {
            const selected = Math.abs(sleepHours - h) < 0.25;
            return (
              <TouchableOpacity
                key={h}
                onPress={() => setHours(h)}
                activeOpacity={0.75}
                style={[styles.quickPill, selected && styles.quickPillSelected]}
              >
                <Text style={[styles.quickText, selected && styles.quickTextSelected]}>{h}h</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </StepShell>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: Spacing['2xl'],
    paddingTop: Spacing.xl,
  },
  value: {
    fontSize: 56,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    letterSpacing: -1.5,
  },
  controls: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.bgCard,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlLabel: {
    fontSize: 28,
    color: Colors.textPrimary,
    marginTop: -2,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  quickPill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgCard,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  quickPillSelected: {
    backgroundColor: Colors.accentSubtle,
    borderColor: Colors.accentDim,
  },
  quickText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },
  quickTextSelected: {
    color: Colors.accent,
    fontWeight: Typography.semibold,
  },
});
