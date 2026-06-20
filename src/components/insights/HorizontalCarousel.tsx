import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

interface HorizontalCarouselProps {
  children: React.ReactNode[];
  cardWidth: number;
  gap?: number;
}

export function HorizontalCarousel({ children, cardWidth, gap = 12 }: HorizontalCarouselProps) {
  return (
    <FlatList
      data={children}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 4, gap }}
      snapToInterval={cardWidth + gap}
      decelerationRate="fast"
      keyExtractor={(_, i) => String(i)}
      renderItem={({ item }) => (
        <View style={{ width: cardWidth }}>
          {item}
        </View>
      )}
    />
  );
}
