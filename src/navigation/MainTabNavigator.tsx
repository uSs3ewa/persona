import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { MainTabParamList } from '@/types';
import { CalendarScreen } from '../screens/calendar/CalendarScreen';
import { TodayScreen } from '../screens/today/TodayScreen';
import { InsightsScreen } from '../screens/insights/InsightsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ label, active }: { label: string; active: boolean }) {
  return <Text style={[styles.tabIcon, active && styles.tabIconActive]}>{label}</Text>;
}

export function MainTabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.bgElevated,
          borderTopColor: Colors.border,
          borderTopWidth: 0.5,
          height: 58 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 6,
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
      }}
    >
      <Tab.Screen
        name="Today"
        component={TodayScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="⌂" active={focused} />,
          tabBarLabel: 'Today',
        }}
      />

      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="✦" active={focused} />,
          tabBarLabel: 'Insights',
        }}
      />

      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="▦" active={focused} />,
          tabBarLabel: 'Calendar',
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIcon: { fontSize: 18, color: Colors.textTertiary, lineHeight: 22 },
  tabIconActive: { color: Colors.accent },
});
