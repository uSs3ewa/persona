import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '@/constants/theme';

interface StepShellProps {
  step: number;
  totalSteps: number;
  question: string;
  subLabel?: string;
  children: React.ReactNode;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  onSkip?: () => void;
}

export function StepShell({
  step,
  totalSteps,
  question,
  subLabel,
  children,
  onNext,
  nextDisabled = false,
  nextLabel = 'Next',
  onSkip,
}: StepShellProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressRow}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i < step && styles.progressDotFilled,
                i === step - 1 && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
        {onSkip && (
          <TouchableOpacity onPress={onSkip} hitSlop={12}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.question}>{question}</Text>
        {subLabel && <Text style={styles.subLabel}>{subLabel}</Text>}
        <View style={styles.inputArea}>{children}</View>
      </View>

      {/* CTA */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <TouchableOpacity
          style={[styles.nextBtn, nextDisabled && styles.nextBtnDisabled]}
          onPress={onNext}
          disabled={nextDisabled}
          activeOpacity={0.8}
        >
          <Text style={styles.nextLabel}>{nextLabel}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  backBtn: {
    marginRight: Spacing.md,
  },
  backArrow: {
    fontSize: 22,
    color: Colors.textSecondary,
  },
  progressRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.bgCard,
  },
  progressDotFilled: {
    backgroundColor: Colors.accentDim,
  },
  progressDotActive: {
    backgroundColor: Colors.accent,
    width: 18,
  },
  skipText: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['2xl'],
  },
  question: {
    fontSize: Typography.xl,
    fontWeight: Typography.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    lineHeight: Typography.xl * Typography.tight,
  },
  subLabel: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  inputArea: {
    marginTop: Spacing['2xl'],
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  nextBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextBtnDisabled: {
    opacity: 0.35,
  },
  nextLabel: {
    fontSize: Typography.md,
    fontWeight: Typography.semibold,
    color: '#fff',
  },
});
