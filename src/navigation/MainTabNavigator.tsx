import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Colors } from '@/constants/theme';
import { MainTabParamList } from '@/types';
import { CalendarScreen } from '../screens/calendar/CalendarScreen';
import { TodayScreen } from '../screens/today/TodayScreen';
import { InsightsScreen } from '../screens/insights/InsightsScreen';
import { PremiumTabBar } from '@/components/ui/PremiumTabBar';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <PremiumTabBar {...props} />}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
    </Tab.Navigator>
  );
}
