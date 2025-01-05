import React, { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View, ViewStyle } from 'react-native';
import ReAnimated, { AnimatedStyleProp } from 'react-native-reanimated';
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
    renderExpandedContent: (params: {
        article: Article;
        contentAnimatedStyle: AnimatedStyleProp<ViewStyle>;
        scrollToNextArticle: () => void;
    }) => React.ReactNode;
    isRefreshing?: boolean;
    scrollViewRef: React.RefObject<ReAnimated.ScrollView>;
}

interface ArticleHeights {
    [key: string]: number;
}

export function ArticleList({
    articles,
    expandedIndex,
    onArticlePress,
    getAnimationStyles,
    renderExpandedContent,
    isRefreshing,
    scrollViewRef,
}: ArticleListProps) {
    const [articleHeights] = useState<ArticleHeights>({});
    const [expandedHeights] = useState<ArticleHeights>({});

    const handleArticleLayout = (event: LayoutChangeEvent, index: number, isExpanded: boolean) => {
        if (isExpanded) {
            expandedHeights[index] = event.nativeEvent.layout.height;
        } else {
            articleHeights[index] = event.nativeEvent.layout.height;
        }
    };

    const scrollToArticle = (index: number) => {
        setTimeout(() => {
            const scrollPosition = articles.slice(0, index).reduce((total, _, i) => {
                const height = articleHeights[i] || 100;
                return total + height;
            }, 0);

            scrollViewRef.current?.scrollTo({
                animated: true,
                y: scrollPosition,
            });
        }, 100);
    };

    const handleArticlePress = (index: number) => {
        onArticlePress(index);
        scrollToArticle(index);
    };

    const renderExpandedContentWithScroll = (
        article: Article,
        contentAnimatedStyle: AnimatedStyleProp<ViewStyle>,
    ) => {
        const scrollToNextArticle = () => {
            const nextIndex = expandedIndex + 1;
            if (nextIndex < articles.length) {
                scrollToArticle(nextIndex);
            }
        };

        return renderExpandedContent({
            article,
            contentAnimatedStyle,
            scrollToNextArticle,
        });
    };

    if (isRefreshing) return null;

    return (
        <>
            <Text style={styles.date}>{format(new Date(), 'MMMM d, yyyy')}</Text>
            <View style={styles.articlesList}>
                {articles.map((article, index) => {
                    const { containerAnimatedStyle, previewAnimatedStyle, contentAnimatedStyle } =
                        getAnimationStyles(index);
                    const isExpanded = index === expandedIndex;

                    return (
                        <View
                            key={article.id}
                            onLayout={(event) => handleArticleLayout(event, index, isExpanded)}
                        >
                            <ArticleCard
                                headline={article.headline}
                                category={article.category}
                                timeAgo="2h ago"
                                isAnswered={!!article.answered}
                                isCorrect={article.answered?.wasCorrect}
                                isFake={article.isFake}
                                isExpanded={isExpanded}
                                onPress={() => handleArticlePress(index)}
                                previewAnimatedStyle={previewAnimatedStyle}
                                containerAnimatedStyle={containerAnimatedStyle}
                                expandedContent={renderExpandedContentWithScroll(
                                    article,
                                    contentAnimatedStyle,
                                )}
                            />
                        </View>
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
