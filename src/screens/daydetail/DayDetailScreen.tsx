import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { InsightCard } from '@/components/today/InsightCard';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { RootStackParamList } from '@/types';
import { formatDate } from '@/utils/stateScore';
import { useAppStore } from '@/store/useAppStore';

type DayDetailRouteProp = RouteProp<RootStackParamList, 'DayDetail'>;

const MOOD_FACE = ['😞', '😕', '😐', '🙂', '😊'];
const MOOD_LABEL = ['Rough', 'Low', 'Okay', 'Good', 'Great'];

export function DayDetailScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<DayDetailRouteProp>();
  const insets = useSafeAreaInsets();
  const getEntryByDate = useAppStore((s) => s.getEntryByDate);
  const entry = getEntryByDate(params.date);

  if (!entry) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + Spacing.lg }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.notFound}>No entry found for this day.</Text>
      </View>
    );
  }

  const moodIdx = entry.mood - 1;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Handle + close */}
      <View style={styles.topRow}>
        <View style={styles.handle} />
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closePill} hitSlop={10}>
          <Text style={styles.closePillText}>Close</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Date */}
        <Text style={styles.dateLabel}>{formatDate(entry.entry_date)}</Text>

        {/* Frame */}
        {entry.generated_frame && (
          <View style={styles.frameBlock}>
            <Text style={styles.frameEyebrow}>Frame</Text>
            <Text style={styles.frameTitle}>{entry.generated_frame}</Text>
            <Text style={styles.frameSub}>{entry.generated_frame_sub}</Text>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatCell label="Sleep" value={`${entry.sleep_hours}h`} />
          <StatCell
            label="Mood"
            value={`${MOOD_FACE[moodIdx]} ${MOOD_LABEL[moodIdx]}`}
          />
          <StatCell label="Energy" value={`${entry.energy}/10`} />
          <StatCell
            label="Activity"
            value={entry.activity.charAt(0).toUpperCase() + entry.activity.slice(1)}
          />
          <StatCell
            label="Nutrition"
            value={entry.nutrition === 'ok' ? 'On plan' : entry.nutrition.charAt(0).toUpperCase() + entry.nutrition.slice(1)}
          />
          {entry.note && (
            <StatCell label="Note" value={entry.note} wide />
          )}
        </View>

        {/* Insights */}
        {(entry.generated_insights ?? []).length > 0 && (
          <View style={styles.insightsSection}>
            <Text style={styles.sectionLabel}>Insights</Text>
            {(entry.generated_insights ?? []).map((insight, i) => (
              <InsightCard key={i} insight={insight} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function StatCell({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <View style={[styles.statCell, wide && styles.statCellWide]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgElevated,
  },
  topRow: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
  },
  closePill: {
    position: 'absolute',
    right: Spacing.xl,
    top: Spacing.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgCard,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  closePillText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },
  closeBtn: {
    marginLeft: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  closeBtnText: {
    fontSize: Typography.lg,
    color: Colors.textSecondary,
  },
  notFound: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: 60,
    fontSize: Typography.base,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xl,
  },
  dateLabel: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
    fontWeight: Typography.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.1,
  },
  frameBlock: {
    gap: Spacing.sm,
  },
  frameEyebrow: {
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
  },
  frameSub: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sm * 1.6,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statCell: {
    width: '47%',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: 4,
  },
  statCellWide: {
    width: '100%',
  },
  statLabel: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    fontWeight: Typography.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.05,
  },
  statValue: {
    fontSize: Typography.md,
    fontWeight: Typography.medium,
    color: Colors.textPrimary,
  },
  insightsSection: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    fontWeight: Typography.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.1,
  },
});
