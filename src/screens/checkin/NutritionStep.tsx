import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { PillSelector } from '@/components/ui/PillSelector';
import { StepShell } from '@/components/checkin/StepShell';
import { NUTRITION_OPTIONS } from '@/constants/theme';
import { CheckInParamList } from '@/navigation/CheckInNavigator';
import { useAppStore } from '@/store/useAppStore';
import { NutritionLevel } from '@/types';

export function NutritionStep() {
  const navigation = useNavigation<NativeStackNavigationProp<CheckInParamList>>();
  const { checkInDraft, setCheckInDraft } = useAppStore();

  return (
    <StepShell
      step={5}
      totalSteps={6}
      question="How was your nutrition?"
      subLabel="Yesterday's eating quality"
      onNext={() => navigation.navigate('Note')}
      nextDisabled={checkInDraft.nutrition === undefined}
    >
      <PillSelector<NutritionLevel>
        options={NUTRITION_OPTIONS}
        value={checkInDraft.nutrition}
        onChange={(val) => setCheckInDraft({ nutrition: val })}
      />
    </StepShell>
  );
}
