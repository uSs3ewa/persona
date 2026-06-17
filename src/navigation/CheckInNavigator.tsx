import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SleepStep from '../screens/checkin/SleepStep';
import { MoodStep } from '../screens/checkin/MoodStep';
import { EnergyStep } from '../screens/checkin/EnergyStep';
import { ActivityStep } from '../screens/checkin/ActivityStep';
import { NutritionStep } from '../screens/checkin/NutritionStep';
import { NoteStep } from '../screens/checkin/NoteStep';

export type CheckInParamList = {
  Sleep: undefined;
  Mood: undefined;
  Energy: undefined;
  Activity: undefined;
  Nutrition: undefined;
  Note: undefined;
};

const Stack = createNativeStackNavigator<CheckInParamList>();

export function CheckInNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Sleep" component={SleepStep} />
      <Stack.Screen name="Mood" component={MoodStep} />
      <Stack.Screen name="Energy" component={EnergyStep} />
      <Stack.Screen name="Activity" component={ActivityStep} />
      <Stack.Screen name="Nutrition" component={NutritionStep} />
      <Stack.Screen name="Note" component={NoteStep} />
    </Stack.Navigator>
  );
}
