import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface PillSelectorProps<T extends string> {
  options: readonly Option<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
}

export function PillSelector<T extends string>({
  options,
  value,
  onChange,
}: PillSelectorProps<T>) {
  return (
    <View style={styles.row}>
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[styles.pill, selected && styles.pillSelected]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onChange(opt.value);
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: 'transparent',
  },
  pillSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  label: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },
  labelSelected: {
    color: '#fff',
  },
});
