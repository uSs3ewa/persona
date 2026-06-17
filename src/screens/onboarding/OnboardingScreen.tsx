import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { RootStackParamList } from '@/types';
import { useAppStore } from '@/store/useAppStore';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    label: 'State first',
    title: 'Before you plan,\nunderstand your state.',
    body: 'Most productivity tools assume you should perform consistently. Persona assumes performance should adapt to where you actually are.',
    symbol: '◎',
  },
  {
    id: '2',
    label: 'The Frame',
    title: "A lens for the day,\nnot a to-do list.",
    body: 'Each morning you check in. Persona interprets your state and gives you a "Frame" — a grounded starting point for your day.',
    symbol: '◈',
  },
  {
    id: '3',
    label: 'Your choice',
    title: 'Persona sets a\nreference point.',
    body: "It doesn't tell you what to do. It helps close the gap between intention and actual capacity. The decision is always yours.",
    symbol: '⊞',
  },
];

export function OnboardingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const setOnboarded = useAppStore((s) => s.setOnboarded);
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef<FlatList<(typeof SLIDES)[number]>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      listRef.current?.scrollToIndex({ index: next, animated: true });
    } else {
      setOnboarded();
      navigation.replace('Main');
    }
  };

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Animated.FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        onScrollToIndexFailed={(info) => {
          // Retry after layout; prevents dead "Continue" on some Android devices
          setTimeout(() => {
            listRef.current?.scrollToIndex({ index: info.index, animated: true });
          }, 50);
        }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.symbolWrap}>
              <Text style={styles.symbol}>{item.symbol}</Text>
            </View>
            <Text style={styles.slideLabel}>{item.label}</Text>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideBody}>{item.body}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => {
          const opacity = scrollX.interpolate({
            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          const w = scrollX.interpolate({
            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
            outputRange: [6, 18, 6],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View key={i} style={[styles.dot, { opacity, width: w }]} />
          );
        })}
      </View>

      {/* CTA */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextBtn} onPress={goNext} activeOpacity={0.85}>
          <Text style={styles.nextLabel}>{isLast ? 'Get started' : 'Continue'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  slide: {
    width,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['3xl'],
    gap: Spacing.lg,
  },
  symbolWrap: {
    width: 64,
    height: 64,
    borderRadius: Radius.md,
    backgroundColor: Colors.accentSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  symbol: {
    fontSize: 28,
    color: Colors.accent,
  },
  slideLabel: {
    fontSize: Typography.sm,
    color: Colors.accent,
    fontWeight: Typography.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.1,
  },
  slideTitle: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: Typography['2xl'] * Typography.tight,
  },
  slideBody: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    lineHeight: Typography.base * Typography.normal,
    marginTop: Spacing.sm,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.xl,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  nextBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextLabel: {
    fontSize: Typography.md,
    fontWeight: Typography.semibold,
    color: '#fff',
  },
});
