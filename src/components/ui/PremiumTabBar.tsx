import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Shadows, AnimConfig } from '@/constants/theme';

interface TabBarProps {
  state: any;
  navigation: any;
  descriptors: any;
}

const TAB_ICONS: Record<string, string> = {
  Today: '⌂',
  Insights: '✦',
  Calendar: '▦',
};

function TabItem({
  route,
  isActive,
  onPress,
  isCenter,
}: {
  route: string;
  isActive: boolean;
  onPress: () => void;
  isCenter: boolean;
}) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withSpring(isActive ? 1 : 0.9, AnimConfig.springSoft);
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (isCenter) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.centerWrap}>
        <Animated.View
          style={[
            styles.centerButton,
            isActive && styles.centerButtonActive,
            Shadows.float,
            animatedStyle,
          ]}
        >
          <Text style={[styles.centerIcon, isActive && styles.centerIconActive]}>{TAB_ICONS[route]}</Text>
        </Animated.View>
        <Text style={[styles.centerLabel, isActive && styles.centerLabelActive]}>{route}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.sideTab}>
      <Animated.View style={[styles.sideIconWrap, animatedStyle]}>
        <Text style={[styles.sideIcon, isActive && styles.sideIconActive]}>{TAB_ICONS[route]}</Text>
      </Animated.View>
      <Text style={[styles.sideLabel, isActive && styles.sideLabelActive]}>{route}</Text>
    </TouchableOpacity>
  );
}

export function PremiumTabBar({ state, navigation, descriptors }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const { routes, index: activeIndex } = state;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabBar}>
        <View style={styles.tabsRow}>
          {routes.map((route: any, i: number) => {
            const isCenter = route.name === 'Insights';
            return (
              <TabItem
                key={route.name}
                route={route.name}
                isActive={i === activeIndex}
                onPress={() => {
                  if (i !== activeIndex) {
                    navigation.navigate(route.name);
                  }
                }}
                isCenter={isCenter}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  tabBar: {
    backgroundColor: Colors.bgElevated + 'F0',
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },

  // Side tabs
  sideTab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingBottom: Spacing.sm,
  },
  sideIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideIcon: {
    fontSize: 18,
    color: Colors.textTertiary,
  },
  sideIconActive: {
    color: Colors.accent,
  },
  sideLabel: {
    fontSize: 10,
    fontWeight: Typography.medium,
    color: Colors.textTertiary,
  },
  sideLabelActive: {
    color: Colors.accent,
  },

  // Center button
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingBottom: Spacing.sm,
    marginTop: -18,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
  },
  centerButtonActive: {
    backgroundColor: Colors.gradientMid,
  },
  centerIcon: {
    fontSize: 22,
    color: '#FFFFFF',
  },
  centerIconActive: {
    fontSize: 24,
  },
  centerLabel: {
    fontSize: 10,
    fontWeight: Typography.semibold,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  centerLabelActive: {
    color: Colors.accent,
  },
});
