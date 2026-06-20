import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Typography } from '@/constants/theme';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
}

export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 6,
  color = Colors.accent,
  trackColor = Colors.border,
  label,
  sublabel,
}: ProgressRingProps) {

  return (
    <View style={[styles.ringContainer, { width: size, height: size }]}>
      <View style={styles.svgWrapper}>
        <View
          style={[
            styles.ringTrack,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: trackColor,
            },
          ]}
        />
        <View
          style={[
            styles.ringFill,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: color,
              borderTopColor: 'transparent',
              borderRightColor: progress < 0.75 ? 'transparent' : color,
              borderBottomColor: progress < 0.5 ? 'transparent' : color,
              borderLeftColor: progress < 0.25 ? 'transparent' : color,
              transform: [{ rotate: '-45deg' }],
            },
          ]}
        />
      </View>
      {(label || sublabel) && (
        <View style={styles.ringLabels}>
          {label && <Text style={[styles.ringLabel, { fontSize: size > 60 ? Typography.lg : Typography.base }]}>{label}</Text>}
          {sublabel && <Text style={[styles.ringSublabel, { fontSize: size > 60 ? Typography.xs : 9 }]}>{sublabel}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgWrapper: {
    position: 'absolute',
  },
  ringTrack: {
    position: 'absolute',
  },
  ringFill: {
    position: 'absolute',
  },
  ringLabels: {
    alignItems: 'center',
    gap: 1,
  },
  ringLabel: {
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  ringSublabel: {
    color: Colors.textTertiary,
    fontWeight: Typography.medium,
  },
});
