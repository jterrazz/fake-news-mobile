import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CategoryLabel } from '@/presentation/components/atoms/typography/category-label';
import { SIZES } from '@/presentation/constants/sizes';

interface ArticleMetaProps {
  publisher?: string;
  category: string;
  timeAgo: string;
}

export function ArticleMeta({ publisher = 'AI BREAKING NEWS', category, timeAgo }: ArticleMetaProps) {
  return (
    <View style={styles.metaContainer}>
      <Text style={styles.publisher}>
        {publisher}
      </Text>
      <Text style={styles.dot}>•</Text>
      <CategoryLabel>{category}</CategoryLabel>
      <Text style={styles.dot}>•</Text>
      <Text style={styles.time}>{timeAgo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    color: '#999999',
    fontSize: 10,
    lineHeight: 10,
  },
  metaContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SIZES.xs,
  },
  publisher: {
    color: '#666666',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  time: {
    color: '#999999',
    fontSize: 11,
    fontWeight: '500',
  },
}); 