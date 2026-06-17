import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StepShell } from '@/components/checkin/StepShell';
import { Colors, MOOD_LABELS, Spacing, Typography } from '@/constants/theme';
import { CheckInParamList } from '@/navigation/CheckInNavigator';
import { useAppStore } from '@/store/useAppStore';
import { MoodLevel } from '@/types';

const MOOD_FACES: Record<number, string> = {
  1: '😞',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😊',
};

const MOOD_COLORS: Record<number, string> = {
  1: '#E24B4A',
  2: '#EF9F27',
  3: Colors.textTertiary,
  4: '#1D9E75',
  5: Colors.accent,
};

export function MoodStep() {
  const navigation = useNavigation<NativeStackNavigationProp<CheckInParamList>>();
  const { checkInDraft, setCheckInDraft } = useAppStore();
  const mood = checkInDraft.mood;

  const select = (val: MoodLevel) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCheckInDraft({ mood: val });
  };

  return (
    <StepShell
      step={2}
      totalSteps={6}
      question="How are you feeling?"
      subLabel="Your overall mood right now"
      onNext={() => navigation.navigate('Energy')}
      nextDisabled={mood === undefined}
    >
      <View style={styles.row}>
        {([1, 2, 3, 4, 5] as MoodLevel[]).map((level) => {
          const selected = mood === level;
          const color = MOOD_COLORS[level];
          return (
            <TouchableOpacity
              key={level}
              onPress={() => select(level)}
              activeOpacity={0.7}
              style={styles.itemWrap}
            >
              <View
                style={[
                  styles.circle,
                  selected && { borderColor: color, borderWidth: 2, backgroundColor: color + '22' },
                ]}
              >
                <Text style={[styles.face, selected && styles.faceSelected]}>
                  {MOOD_FACES[level]}
                </Text>
              </View>
              <Text style={[styles.label, selected && { color }]}>
                {MOOD_LABELS[level]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </StepShell>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
  },
  itemWrap: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  face: {
    fontSize: 26,
  },
  faceSelected: {
    transform: [{ scale: 1.1 }],
  },
  label: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    fontWeight: Typography.medium,
  },
});
