import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Platform } from 'react-native';

import { StatusIndicator } from '../../atoms/indicators/status-indicator.jsx';

import { ArticleMeta } from './article-meta.jsx';
import { SIZES } from '@/presentation/constants/sizes';

interface ArticlePreviewProps {
  headline: string;
  category: string;
  timeAgo: string;
  isAnswered?: boolean;
  isCorrect?: boolean;
  isFake?: boolean;
}

export function ArticlePreview({ 
  headline, 
  category, 
  timeAgo,
  isAnswered,
  isCorrect,
  isFake,
}: ArticlePreviewProps) {
  return (
    <View style={styles.previewContent}>
      <View style={styles.previewLeftColumn}>
        <View style={styles.previewIconContainer}>
          <Image
            source={require('../../../../../assets/icon.png')}
            style={styles.previewIcon}
            resizeMode="cover"
          />
          {isAnswered && (
            <StatusIndicator
              isCorrect={isCorrect}
              isFake={isFake}
            />
          )}
        </View>
      </View>

      <View style={styles.previewTextContainer}>
        <Text style={styles.previewHeadline} numberOfLines={2}>
          {headline}
        </Text>
        <ArticleMeta 
          category={category}
          timeAgo={timeAgo}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  previewContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SIZES.xs * 3,
    padding: SIZES.md,
    paddingVertical: SIZES.sm + SIZES['2xs'],
  },
  previewHeadline: {
    color: '#1A1A1A',
    fontFamily: Platform.OS === 'ios' ? 'New York' : 'serif',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
    lineHeight: 19,
  },
  previewIcon: {
    borderRadius: 8,
    height: '100%',
    width: '100%',
  },
  previewIconContainer: {
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 12,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    overflow: 'visible',
    position: 'relative',
    width: 36,
  },
  previewLeftColumn: {
    alignItems: 'center',
    position: 'relative',
    width: 40,
  },
  previewTextContainer: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
    paddingRight: 8,
  },
}); 