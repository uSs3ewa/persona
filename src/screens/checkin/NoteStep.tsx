import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { StepShell } from '@/components/checkin/StepShell';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { generateFrame, generateInsights } from '@/lib/aiService';
import { RootStackParamList } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { computeStateScore, todayISO } from '@/utils/stateScore';
import { DailyEntry } from '@/types';

export function NoteStep() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    checkInDraft,
    setCheckInDraft,
    addEntry,
    updateEntry,
    entries,
    user,
    resetCheckInDraft,
    editingEntryId,
    stopEditingEntry,
  } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const submit = async () => {
    if (loading) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const frameResult = await generateFrame(checkInDraft, entries.slice(0, 5));

      const entry_date = editingEntryId
        ? (entries.find((e) => e.id === editingEntryId)?.entry_date ?? todayISO())
        : todayISO();

      const base: DailyEntry = {
        id: editingEntryId ?? Date.now().toString(),
        user_id: user?.id ?? 'local',
        entry_date,
        sleep_hours: checkInDraft.sleep_hours,
        sleep_bedtime: checkInDraft.sleep_bedtime,
        mood: checkInDraft.mood ?? 3,
        energy: checkInDraft.energy ?? 5,
        activity: checkInDraft.activity ?? 'none',
        nutrition: checkInDraft.nutrition ?? 'ok',
        note: checkInDraft.note,
        generated_frame: frameResult.frame_title,
        generated_frame_sub: frameResult.frame_sub,
        generated_insights: [],
        state_score: computeStateScore(checkInDraft),
        created_at: new Date().toISOString(),
      };

      if (editingEntryId) {
        updateEntry(editingEntryId, base);
        stopEditingEntry();
      } else {
        addEntry(base);
      }
      resetCheckInDraft();
      navigation.replace('FrameReveal', { entry: base });

      generateInsights(base, entries.slice(0, 30)).then((insights) => {
        if (insights.length > 0) {
          updateEntry(base.id, { generated_insights: insights });
        }
      });
    } catch (e) {
      setErrorMsg('Could not generate your frame. Please try again.');
      setLoading(false);
    }
  };

  return (
    <StepShell
      step={6}
      totalSteps={6}
      question="Any thoughts about the day?"
      subLabel="Optional — add context for better insights"
      onNext={submit}
      onSkip={submit}
      nextLabel={loading ? 'Generating...' : 'Generate Frame'}
      nextDisabled={loading}
    >
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={Colors.accent} size="large" />
          <Text style={styles.loadingText}>Interpreting your state...</Text>
        </View>
      ) : (
        <View>
          {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
          <TextInput
            style={styles.input}
            value={checkInDraft.note ?? ''}
            onChangeText={(t) => setCheckInDraft({ note: t })}
            placeholder="e.g. Busy day ahead. Head feels clear."
            placeholderTextColor={Colors.textTertiary}
            multiline
            maxLength={300}
            textAlignVertical="top"
            autoFocus={false}
          />
          <Text style={styles.charCount}>{(checkInDraft.note ?? '').length} / 300</Text>
        </View>
      )}
    </StepShell>
  );
}

const styles = StyleSheet.create({
  errorText: {
    fontSize: Typography.sm,
    color: Colors.danger,
    marginBottom: Spacing.md,
    lineHeight: Typography.sm * Typography.normal,
  },
  input: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.lg,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    minHeight: 120,
    lineHeight: Typography.base * Typography.normal,
  },
  charCount: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginTop: Spacing.sm,
  },
  loadingWrap: {
    alignItems: 'center',
    gap: Spacing.lg,
    paddingTop: Spacing['2xl'],
  },
  loadingText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
  },
});
