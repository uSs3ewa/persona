import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StepShell } from '@/components/checkin/StepShell';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { CheckInParamList } from '@/navigation/CheckInNavigator';
import { useAppStore } from '@/store/useAppStore';
import { EnergyLevel } from '@/types';

// Custom energy slider using tap targets (no native Slider needed)
const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as EnergyLevel[];

function energyLabel(e: EnergyLevel): string {
  if (e <= 2) return 'Drained';
  if (e <= 4) return 'Low';
  if (e <= 6) return 'Moderate';
  if (e <= 8) return 'Good';
  return 'High';
}

export function EnergyStep() {
  const navigation = useNavigation<NativeStackNavigationProp<CheckInParamList>>();
  const { checkInDraft, setCheckInDraft } = useAppStore();
  const energy = checkInDraft.energy;
  const lastHaptic = useRef<EnergyLevel | undefined>(undefined);

  const select = (val: EnergyLevel) => {
    if (energy === val) return;
    if (lastHaptic.current !== val) {
      lastHaptic.current = val;
      Haptics.selectionAsync();
    }
    setCheckInDraft({ energy: val });
  };

  return (
    <StepShell
      step={3}
      totalSteps={6}
      question="How much energy do you have?"
      subLabel="Your physical and mental fuel right now"
      onNext={() => navigation.navigate('Activity')}
      nextDisabled={energy === undefined}
    >
      {energy !== undefined && (
        <View style={styles.readout}>
          <Text style={styles.readoutNum}>{energy}</Text>
          <Text style={styles.readoutOf}>/10</Text>
          <Text style={styles.readoutLabel}>{energyLabel(energy)}</Text>
        </View>
      )}

      <View style={styles.track}>
        <View style={styles.columns}>
          {LEVELS.map((level) => {
            const filled = energy !== undefined && level <= energy;
            const active = energy === level;
            return (
              <Pressable
                key={level}
                style={styles.column}
                onPress={() => select(level)}
              >
                <View style={styles.barWrap}>
                  <View
                    style={[
                      styles.bar,
                      { height: 24 + level * 4 },
                      filled && styles.barFilled,
                      active && styles.barActive,
                    ]}
                  />
                </View>
                <Text style={[styles.tapTarget, active && styles.tapTargetActive]}>
                  {level}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </StepShell>
  );
}

const styles = StyleSheet.create({
  readout: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: Spacing['2xl'],
  },
  readoutNum: {
    fontSize: 48,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  readoutOf: {
    fontSize: Typography.lg,
    color: Colors.textTertiary,
  },
  readoutLabel: {
    fontSize: Typography.base,
    color: Colors.accent,
    fontWeight: Typography.medium,
    marginLeft: Spacing.sm,
  },
  track: {
    paddingVertical: Spacing.md,
  },
  columns: {
    flexDirection: 'row',
    gap: 6,
  },
  column: {
    flex: 1,
  },
  barWrap: {
    height: 80,
    justifyContent: 'flex-end',
  },
  bar: {
    borderRadius: 4,
    backgroundColor: Colors.bgCard,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  barFilled: {
    backgroundColor: Colors.accentDim,
    borderColor: Colors.accentDim,
  },
  barActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  tapTarget: {
    textAlign: 'center',
    fontSize: Typography.sm,
    color: Colors.textTertiary,
    paddingVertical: Spacing.sm,
  },
  tapTargetActive: {
    color: Colors.accent,
    fontWeight: Typography.semibold,
  },
});
