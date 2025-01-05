import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { AnimatedStyleProp, ViewStyle } from 'react-native-reanimated';
import { format, isToday, isYesterday } from 'date-fns';

import { NewsEntity } from '@/domain/news/news.entity';

import { formatTimeAgo } from '@/presentation/utils/date';

import { ArticleCard } from './article-card.jsx';
import { SIZES } from '@/presentation/constants/sizes';

interface ArticleListProps {
    articles: NewsEntity[];
    expandedIndex: number;
    onArticlePress: (index: number) => void;
    getAnimationStyles: (index: number) => any;
    renderExpandedContent: (
        article: NewsEntity,
        contentAnimatedStyle: AnimatedStyleProp<ViewStyle>,
        scrollToArticle?: (index: number) => void,
    ) => React.ReactNode;
    isRefreshing: boolean;
    scrollViewRef: any;
}

interface GroupedArticles {
    [key: string]: NewsEntity[];
}

function getDateLabel(date: Date): string {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
}

function groupArticlesByDate(articles: NewsEntity[]): GroupedArticles {
    return articles.reduce((groups, article) => {
        const date = new Date(article.createdAt);
        date.setHours(0, 0, 0, 0);
        const dateKey = format(date, 'yyyy-MM-dd');

        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }

        groups[dateKey].push(article);
        return groups;
    }, {} as GroupedArticles);
}

export function ArticleList({
    articles,
    expandedIndex,
    onArticlePress,
    getAnimationStyles,
    renderExpandedContent,
    scrollViewRef,
}: ArticleListProps) {
    const scrollToArticle = (index: number) => {
        scrollViewRef.current?.scrollTo({
            animated: true,
            y: index * 150,
        });
    };

    const groupedArticles = groupArticlesByDate(articles);

    let globalIndex = 0;

    return (
        <View style={styles.container}>
            {Object.entries(groupedArticles)
                .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
                .map(([dateKey, dateArticles]) => (
                    <View key={dateKey}>
                        <Text style={styles.dateHeader}>{getDateLabel(new Date(dateKey))}</Text>
                        <View style={styles.articleGroup}>
                            {dateArticles
                                .sort(
                                    (a, b) =>
                                        new Date(b.createdAt).getTime() -
                                        new Date(a.createdAt).getTime(),
                                )
                                .map((article) => {
                                    const currentIndex = globalIndex++;
                                    const isExpanded = currentIndex === expandedIndex;
                                    const {
                                        containerAnimatedStyle,
                                        contentAnimatedStyle,
                                        previewAnimatedStyle,
                                    } = getAnimationStyles(currentIndex);

                                    return (
                                        <ArticleCard
                                            key={article.id}
                                            headline={article.headline}
                                            category={article.category}
                                            timeAgo={formatTimeAgo(article.answered?.answeredAt)}
                                            isAnswered={!!article.answered}
                                            isCorrect={article.answered?.wasCorrect}
                                            isFake={article.isFake}
                                            isExpanded={isExpanded}
                                            onPress={() => onArticlePress(currentIndex)}
                                            containerAnimatedStyle={containerAnimatedStyle}
                                            previewAnimatedStyle={previewAnimatedStyle}
                                            expandedContent={
                                                isExpanded
                                                    ? renderExpandedContent(
                                                          article,
                                                          contentAnimatedStyle,
                                                          scrollToArticle,
                                                      )
                                                    : undefined
                                            }
                                        />
                                    );
                                })}
                        </View>
                    </View>
                ))}
        </View>
    );
}

const styles = StyleSheet.create({
    articleGroup: {
        gap: SIZES.xs,
        marginBottom: SIZES.lg,
    },
    container: {
        flex: 1,
        paddingBottom: 100,
    },
    dateHeader: {
        color: '#000000',
        fontFamily: 'System',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1.5,
        marginBottom: SIZES.sm,
        marginTop: SIZES.md,
        textTransform: 'uppercase',
    },
});
