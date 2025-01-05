import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnimatedStyleProp, ViewStyle } from 'react-native-reanimated';
import { format } from 'date-fns';

import { ArticleCard } from './article-card.jsx';
import { SIZES } from '@/presentation/constants/sizes';

interface Article {
  id: string;
  headline: string;
  category: string;
  article: string;
  isFake: boolean;
  answered?: {
    answeredAt: Date;
    id: string;
    wasCorrect: boolean;
  };
}

interface ArticleListProps {
  articles: Article[];
  expandedIndex: number;
  onArticlePress: (index: number) => void;
  getAnimationStyles: (index: number) => {
    containerAnimatedStyle: AnimatedStyleProp<ViewStyle>;
    previewAnimatedStyle: AnimatedStyleProp<ViewStyle>;
    contentAnimatedStyle: AnimatedStyleProp<ViewStyle>;
  };
  renderExpandedContent: (article: Article, contentAnimatedStyle: AnimatedStyleProp<ViewStyle>) => React.ReactNode;
  isRefreshing?: boolean;
}

export function ArticleList({
  articles,
  expandedIndex,
  onArticlePress,
  getAnimationStyles,
  renderExpandedContent,
  isRefreshing,
}: ArticleListProps) {
  if (isRefreshing) return null;

  return (
    <>
      <Text style={styles.date}>
        {format(new Date(), 'MMMM d, yyyy')}
      </Text>
      <View style={styles.articlesList}>
        {articles.map((article, index) => {
          const { containerAnimatedStyle, previewAnimatedStyle, contentAnimatedStyle } = 
            getAnimationStyles(index);
          const isExpanded = index === expandedIndex;

          return (
            <ArticleCard
              key={article.id}
              headline={article.headline}
              category={article.category}
              timeAgo="2h ago"
              isAnswered={!!article.answered}
              isCorrect={article.answered?.wasCorrect}
              isFake={article.isFake}
              isExpanded={isExpanded}
              onPress={() => onArticlePress(index)}
              previewAnimatedStyle={previewAnimatedStyle}
              containerAnimatedStyle={containerAnimatedStyle}
              expandedContent={renderExpandedContent(article, contentAnimatedStyle)}
            />
          );
        })}
      </View>
      <View style={styles.bottomSpacer} />
    </>
  );
}

const styles = StyleSheet.create({
  articlesList: {
    paddingTop: 8,
  },
  bottomSpacer: {
    height: 100,
  },
  date: {
    color: '#000000',
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: SIZES.xs,
    marginLeft: SIZES.lg + SIZES['2xs'],
    marginTop: SIZES.xl,
    textTransform: 'uppercase',
  },
}); 