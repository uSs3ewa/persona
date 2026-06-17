import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { RootStackParamList } from '@/types';
import { CheckInNavigator } from './CheckInNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { DayDetailScreen } from '../screens/daydetail/DayDetailScreen';
import { FrameRevealScreen } from '../screens/frame/FrameRevealScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false, animation: 'fade' }}
        initialRouteName={hasCompletedOnboarding ? 'Main' : 'Onboarding'}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen
          name="CheckIn"
          component={CheckInNavigator}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="FrameReveal"
          component={FrameRevealScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="DayDetail"
          component={DayDetailScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
