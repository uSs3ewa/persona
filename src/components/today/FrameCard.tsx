import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { DailyEntry } from '@/types';

interface FrameCardProps {
  entry: DailyEntry;
}

export function FrameCard({ entry }: FrameCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>Today's Frame</Text>
      <Text style={styles.frameTitle}>{entry.generated_frame ?? '—'}</Text>
      <Text style={styles.frameSub}>{entry.generated_frame_sub}</Text>
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
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  eyebrow: {
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
});
