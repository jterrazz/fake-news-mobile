import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import type { AnimatedStyleProp } from 'react-native-reanimated';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { TFunction } from 'i18next';

import { NewsEntity } from '@/domain/news/news.entity';

import { ArticleCard } from './article-card.jsx';
import { SIZES } from '@/presentation/components/sizes';

interface ArticleListProps {
    articles: NewsEntity[];
    expandedIndex: number;
    onArticlePress: (index: number) => void;
    renderExpandedContent: (
        article: NewsEntity,
        contentAnimatedStyle?: AnimatedStyleProp<ViewStyle>,
        scrollToArticle?: (index: number) => void,
    ) => React.ReactNode;
    scrollViewRef?: React.RefObject<ScrollView>;
    suppressScroll?: boolean;
}

interface GroupedArticles {
    [key: string]: NewsEntity[];
}

function getDateLabel(date: Date, t: TFunction): string {
    if (isToday(date)) return t('common:newsFeed.dates.today');
    if (isYesterday(date)) return t('common:newsFeed.dates.yesterday');

    // Use French locale for dates when the app is in French
    const currentLanguage = t('common:language', { defaultValue: 'en' });
    const locale = currentLanguage === 'fr' ? fr : undefined;
    return format(date, 'MMMM d, yyyy', { locale });
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

function formatTimeAgo(date: string | undefined, t: TFunction): string {
    if (!date) return '';

    try {
        // Use French locale for relative time when the app is in French
        const currentLanguage = t('common:language', { defaultValue: 'en' });
        const locale = currentLanguage === 'fr' ? fr : undefined;
        const distance = formatDistanceToNow(new Date(date), { locale });

        // Add prefix/suffix based on language
        const prefix = t('common:newsFeed.dates.timeAgo.prefix');
        const suffix = t('common:newsFeed.dates.timeAgo.suffix');
        return `${prefix}${distance}${suffix}`;
    } catch (error) {
        return '';
    }
}

export function ArticleList({
    articles,
    expandedIndex,
    onArticlePress,
    renderExpandedContent,
    scrollViewRef,
    suppressScroll = false,
}: ArticleListProps) {
    const { t } = useTranslation();

    // Track article positions with a state instead of refs
    const [articlePositions, setArticlePositions] = useState<Map<number, number>>(new Map());
    const [dateHeaderPositions, setDateHeaderPositions] = useState<Map<string, number>>(new Map());

    // Clear position data when articles change or component remounts
    useEffect(() => {
        setArticlePositions(new Map());
        setDateHeaderPositions(new Map());
    }, [articles]);

    // Constants for scroll positioning
    const HEADER_HEIGHT = 0; // Match the actual header height
    const SCROLL_OFFSET = -20; // Space between header and top of expanded article
    const SCROLL_DELAY = 200; // Delay before scrolling to ensure animations have started

    // Record the position of an article when its layout changes
    const handleArticleLayout = useCallback((index: number, y: number) => {
        setArticlePositions((prev) => {
            const newMap = new Map(prev);
            newMap.set(index, y);
            return newMap;
        });
    }, []);

    // Record the position of a date header when its layout changes
    const handleDateHeaderLayout = useCallback((dateKey: string, y: number) => {
        setDateHeaderPositions((prev) => {
            const newMap = new Map(prev);
            newMap.set(dateKey, y);
            return newMap;
        });
    }, []);

    // Scroll to the expanded article when expandedIndex changes
    useEffect(() => {
        // Don't scroll if scrolling is suppressed or there's no valid scroll view or index
        if (expandedIndex === -1 || !scrollViewRef?.current || suppressScroll) return;

        // Use a longer delay to ensure the article expansion has started
        // before scrolling to its position
        const timer = setTimeout(() => {
            // Get cached position of the article if available
            const position = articlePositions.get(expandedIndex);

            if (position !== undefined) {
                // Add smooth animation properties
                scrollViewRef.current?.scrollTo({
                    animated: true,
                    y: Math.max(0, position - HEADER_HEIGHT - SCROLL_OFFSET),
                });
            } else {
                // Fallback to approximate position
                const estimatedHeight = 150; // Average article height
                const estimatedPosition = expandedIndex * estimatedHeight;

                scrollViewRef.current?.scrollTo({
                    animated: true,
                    y: Math.max(0, estimatedPosition - HEADER_HEIGHT),
                });
            }
        }, SCROLL_DELAY);

        return () => clearTimeout(timer);
    }, [expandedIndex, scrollViewRef, articlePositions, suppressScroll]);

    const groupedArticles = groupArticlesByDate(articles);
    const sortedDates = Object.entries(groupedArticles).sort(([dateA], [dateB]) =>
        dateB.localeCompare(dateA),
    );

    // Function to manually scroll to an article (used for the "Next" button)
    const scrollToArticle = useCallback(
        (index: number) => {
            if (index < 0 || index >= articles.length || !scrollViewRef?.current) return;

            // Get cached position if available
            const position = articlePositions.get(index);

            if (position !== undefined) {
                // Smooth scrolling with a slightly longer animation duration
                scrollViewRef.current.scrollTo({
                    animated: true,
                    y: Math.max(0, position - HEADER_HEIGHT - SCROLL_OFFSET),
                });
            } else {
                // Fallback to approximate position
                const estimatedHeight = 150; // Average article height
                const estimatedPosition = index * estimatedHeight;

                scrollViewRef.current.scrollTo({
                    animated: true,
                    y: Math.max(0, estimatedPosition - HEADER_HEIGHT),
                });
            }
        },
        [articles.length, scrollViewRef, articlePositions],
    );

    let globalIndex = 0;

    return (
        <View style={styles.container}>
            {sortedDates.map(([dateKey, dateArticles], dateIndex) => (
                <View
                    key={dateKey}
                    onLayout={(e) => handleDateHeaderLayout(dateKey, e.nativeEvent.layout.y)}
                >
                    <Text style={[styles.dateHeader, dateIndex === 0 && styles.firstDateHeader]}>
                        {getDateLabel(new Date(dateKey), t)}
                    </Text>
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

                                return (
                                    <View
                                        key={article.id}
                                        onLayout={(e) =>
                                            handleArticleLayout(
                                                currentIndex,
                                                e.nativeEvent.layout.y,
                                            )
                                        }
                                    >
                                        <ArticleCard
                                            headline={article.headline}
                                            category={article.category}
                                            timeAgo={formatTimeAgo(article.answered?.answeredAt, t)}
                                            isAnswered={!!article.answered}
                                            isCorrect={article.answered?.wasCorrect}
                                            isFake={article.isFake}
                                            isExpanded={isExpanded}
                                            onPress={() => {
                                                console.log(
                                                    `Pressing article ${currentIndex}`,
                                                    article.headline,
                                                );
                                                onArticlePress(currentIndex);
                                            }}
                                            expandedContent={
                                                isExpanded
                                                    ? renderExpandedContent(
                                                          article,
                                                          undefined,
                                                          scrollToArticle,
                                                      )
                                                    : undefined
                                            }
                                        />
                                    </View>
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
        paddingTop: 8,
    },
    dateHeader: {
        color: '#000000',
        fontFamily: 'System',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1.5,
        marginBottom: SIZES.sm,
        marginLeft: SIZES.lg + SIZES['2xs'],
        marginTop: SIZES.md,
        textTransform: 'uppercase',
    },
    firstDateHeader: {
        marginTop: 16,
    },
});
