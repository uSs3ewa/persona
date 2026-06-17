import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { PillSelector } from '@/components/ui/PillSelector';
import { StepShell } from '@/components/checkin/StepShell';
import { ACTIVITY_OPTIONS } from '@/constants/theme';
import { CheckInParamList } from '@/navigation/CheckInNavigator';
import { useAppStore } from '@/store/useAppStore';
import { ActivityLevel } from '@/types';

export function ActivityStep() {
  const navigation = useNavigation<NativeStackNavigationProp<CheckInParamList>>();
  const { checkInDraft, setCheckInDraft } = useAppStore();

  return (
    <StepShell
      step={4}
      totalSteps={6}
      question="How intense was your workout?"
      subLabel="Yesterday's physical activity"
      onNext={() => navigation.navigate('Nutrition')}
      nextDisabled={checkInDraft.activity === undefined}
    >
      <PillSelector<ActivityLevel>
        options={ACTIVITY_OPTIONS}
        value={checkInDraft.activity}
        onChange={(val) => setCheckInDraft({ activity: val })}
      />
    </StepShell>
  );
}
