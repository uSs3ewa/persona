import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { MainTabParamList, RootStackParamList } from '@/types';
import { CalendarScreen } from '../screens/calendar/CalendarScreen';
import { TodayScreen } from '../screens/today/TodayScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ label, active }: { label: string; active: boolean }) {
  return <Text style={[styles.tabIcon, active && styles.tabIconActive]}>{label}</Text>;
}

function AddButton() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('CheckIn')}
      activeOpacity={0.85}
      style={styles.fabWrap}
    >
      <View style={styles.fab}>
        <Text style={styles.fabPlus}>+</Text>
      </View>
    </TouchableOpacity>
  );
}

function NullScreen() {
  return <View style={{ flex: 1, backgroundColor: Colors.bg }} />;
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
        name="Add"
        component={NullScreen}
        options={{
          tabBarLabel: '',
          tabBarButton: () => <AddButton />,
        }}
        listeners={{ tabPress: (e) => e.preventDefault() }}
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
  fabWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  fab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  fabPlus: { fontSize: 26, color: '#fff', lineHeight: 30, fontWeight: '400', marginTop: -2 },
});
