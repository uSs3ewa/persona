import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { RootStackParamList } from '@/types';
import { InsightCard } from '@/components/today/InsightCard';

type FrameRevealRouteProp = RouteProp<RootStackParamList, 'FrameReveal'>;

export function FrameRevealScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<FrameRevealRouteProp>();
  const entry = params?.entry;
  const insets = useSafeAreaInsets();

  // Fade-in animation
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (!entry) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.fallbackWrap}>
          <Text style={styles.fallbackTitle}>Nothing to show</Text>
          <Text style={styles.fallbackBody}>
            Your frame could not be loaded. Return to Today and try generating again.
          </Text>
          <TouchableOpacity
            style={styles.cta}
            onPress={() => navigation.replace('Main')}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaLabel}>Back to Today</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Animated.ScrollView
        style={{ opacity }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ transform: [{ translateY }] }}>
          <Text style={styles.eyebrow}>Today's Frame</Text>
          <Text style={styles.frameTitle}>{entry.generated_frame ?? 'Your Frame'}</Text>
          <Text style={styles.frameSub}>{entry.generated_frame_sub}</Text>

          {(entry.generated_insights ?? []).length > 0 && (
            <View style={styles.insightsSection}>
              <Text style={styles.insightsLabel}>Insights</Text>
              {(entry.generated_insights ?? []).map((insight, i) => (
                <InsightCard key={i} insight={insight} />
              ))}
            </View>
          )}
        </Animated.View>
      </Animated.ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <TouchableOpacity
          style={styles.cta}
          onPress={() => navigation.replace('Main')}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaLabel}>Start my day</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  fallbackWrap: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['3xl'],
    gap: Spacing.lg,
  },
  fallbackTitle: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  fallbackBody: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    lineHeight: Typography.base * Typography.normal,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['3xl'],
    paddingBottom: 120,
  },
  eyebrow: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.accent,
    letterSpacing: 0.1,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  frameTitle: {
    fontSize: 38,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    letterSpacing: -1,
    marginBottom: Spacing.lg,
    lineHeight: 44,
  },
  frameSub: {
    fontSize: Typography.md,
    color: Colors.textSecondary,
    lineHeight: Typography.md * Typography.normal,
    marginBottom: Spacing['2xl'],
  },
  insightsSection: {
    marginTop: Spacing.lg,
  },
  insightsLabel: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
    fontWeight: Typography.medium,
    letterSpacing: 0.08,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    backgroundColor: Colors.bg,
  },
  cta: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaLabel: {
    fontSize: Typography.md,
    fontWeight: Typography.semibold,
    color: '#fff',
  },
});
