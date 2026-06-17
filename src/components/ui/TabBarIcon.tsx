import React from 'react';
import { Text } from 'react-native';

const ICONS: Record<string, string> = {
  home: '⌂',
  calendar: '▦',
  plus: '+',
  insights: '⊞',
  profile: '◯',
};

interface TabBarIconProps {
  name: string;
  color: string;
  size?: number;
}

export function TabBarIcon({ name, color, size = 20 }: TabBarIconProps) {
  return (
    <Text style={{ fontSize: size, color, lineHeight: size + 4 }}>
      {ICONS[name] ?? '·'}
    </Text>
  );
}
