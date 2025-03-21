import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    NativeScrollEvent,
    NativeSyntheticEvent,
    RefreshControl,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from 'react-native';
import ReAnimated, { AnimatedStyleProp, useAnimatedScrollHandler } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { NewsEntity } from '@/domain/news/news.entity';

import { LoadingSpinner } from '@/presentation/components/atoms/indicators/loading-spinner';
import { SafeArea } from '@/presentation/components/atoms/layout/safe-area';
import { CelebrationParticle } from '@/presentation/components/molecules/feedback/celebration-particle';
import { NewsHeader } from '@/presentation/components/molecules/header/news-header';
import { ArticleList } from '@/presentation/components/organisms/article/article-list';
import { ExpandedArticle } from '@/presentation/components/organisms/article/expanded-article';
import { SIZES } from '@/presentation/components/sizes';

interface NewsFeedTemplateProps {
    newsItems: NewsEntity[];
    expandedIndex: number;
    selectedAnswer: boolean | null;
    activeTab: 'latest' | 'to-read';
    isRefreshing: boolean;
    isLoadingMore: boolean;
    hasNextPage: boolean;
    score: { score: number; streak: number };
    lastClickedPosition: { x: number; y: number };
    answer?: { wasCorrect: boolean };
    headerAnimatedStyle: AnimatedStyleProp<ViewStyle>;
    titleAnimatedStyle: AnimatedStyleProp<ViewStyle>;
    scrollHandler: (event: { nativeEvent: { contentOffset: { y: number } } }) => void;
    onTabChange: (tab: 'latest' | 'to-read') => void;
    onArticleSelect: (index: number) => void;
    onAnswerClick: (selectedFake: boolean, buttonPosition: { x: number; y: number }) => void;
    onRefresh: () => Promise<void>;
    onEndReached: () => void;
    suppressScroll?: boolean;
}

export function NewsFeedTemplate({
    newsItems,
    expandedIndex,
    selectedAnswer,
    activeTab,
    isRefreshing,
    isLoadingMore,
    hasNextPage,
    score,
    lastClickedPosition,
    answer,
    headerAnimatedStyle,
    titleAnimatedStyle,
    scrollHandler,
    onTabChange,
    onArticleSelect,
    onAnswerClick,
    onRefresh,
    onEndReached,
    suppressScroll,
}: NewsFeedTemplateProps) {
    const { t } = useTranslation();
    const scrollViewRef = React.useRef<ReAnimated.ScrollView>(null);

    // Reset scroll position when the component mounts or when activeTab changes
    React.useEffect(() => {
        // Small timeout to ensure the component is fully rendered
        const timeout = setTimeout(() => {
            if (scrollViewRef.current) {
                // Force an immediate hard reset of the scroll position
                scrollViewRef.current.scrollTo({ animated: false, y: 0 });
            }
        }, 50);

        return () => clearTimeout(timeout);
    }, [activeTab, newsItems.length]);

    const handleScroll = React.useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
            const paddingToBottom = 20;
            const isCloseToBottom =
                layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

            if (isCloseToBottom && !isLoadingMore && hasNextPage) {
                onEndReached();
            }
        },
        [isLoadingMore, hasNextPage, onEndReached],
    );

    const combinedScrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            'worklet';
            scrollHandler({ nativeEvent: { contentOffset: { y: event.contentOffset.y } } });
        },
    });

    const renderExpandedContent = (
        article: NewsEntity,
        contentAnimatedStyle: AnimatedStyleProp<ViewStyle>,
        scrollToArticle?: (index: number) => void,
    ) => {
        const shouldShowNextButton = expandedIndex < newsItems.length - 1;
        const isArticleAnswered = selectedAnswer !== null || article.answered !== undefined;

        // Force selectedAnswer to be a boolean if the article is already answered but selectedAnswer is null
        const effectiveSelectedAnswer =
            selectedAnswer !== null
                ? selectedAnswer
                : article.answered
                  ? article.answered.wasCorrect === article.isFake // If wasCorrect is true and article is fake, the user selected "fake"
                  : null;

        console.log(
            `Rendering article ${expandedIndex}, should show next button: ${shouldShowNextButton}`,
        );
        console.log(
            `Article answered status: isAnswered=${isArticleAnswered}, effectiveSelectedAnswer=${effectiveSelectedAnswer}`,
        );

        return (
            <ExpandedArticle
                article={article}
                contentAnimatedStyle={contentAnimatedStyle}
                isAnswered={isArticleAnswered}
                selectedAnswer={effectiveSelectedAnswer}
                wasCorrect={answer?.wasCorrect ?? article.answered?.wasCorrect}
                onAnswerClick={onAnswerClick}
                onNextArticle={() => {
                    console.log('Next article button pressed');
                    const nextIndex = expandedIndex + 1;
                    if (nextIndex >= newsItems.length) return;

                    // First select the article to start expansion animation
                    onArticleSelect(nextIndex);

                    // Then use the scrollToArticle with a slight delay to let expansion begin
                    if (scrollToArticle) {
                        // Short delay to let the expansion animation start first
                        setTimeout(() => {
                            scrollToArticle(nextIndex);
                        }, 100);
                    }
                }}
                showNextButton={shouldShowNextButton}
            />
        );
    };

    const renderCelebrationEffect = () => {
        if (!answer?.wasCorrect || lastClickedPosition.x === 0) return null;
        return <CelebrationParticle isVisible={answer.wasCorrect} position={lastClickedPosition} />;
    };

    const renderFooter = () => {
        if (isLoadingMore) {
            return (
                <View style={styles.loadingMore}>
                    <ActivityIndicator size="small" color="#000000" />
                </View>
            );
        }

        if (!hasNextPage && newsItems.length > 0) {
            return (
                <View style={styles.endMessage}>
                    <Text style={styles.endMessageText}>{t('common:newsFeed.noMoreArticles')}</Text>
                </View>
            );
        }

        return null;
    };

    return (
        <View style={styles.mainContainer}>
            <NewsHeader
                activeTab={activeTab}
                onTabChange={onTabChange}
                score={score}
                headerAnimatedStyle={headerAnimatedStyle}
                titleAnimatedStyle={titleAnimatedStyle}
            />
            <SafeArea style={styles.safeArea}>
                <View style={styles.scrollContainer}>
                    <ReAnimated.ScrollView
                        ref={scrollViewRef}
                        style={styles.scrollView}
                        onScroll={combinedScrollHandler}
                        scrollEventThrottle={16}
                        bounces={true}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ flexGrow: 1 }}
                        onMomentumScrollEnd={handleScroll}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={onRefresh}
                                tintColor="#000000"
                                title={t('common:newsFeed.retry')}
                                titleColor="#999999"
                                progressViewOffset={48}
                            />
                        }
                    >
                        <View style={styles.container}>
                            {isRefreshing ? (
                                <LoadingSpinner size="large" />
                            ) : newsItems.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyStateText}>
                                        {t('common:newsFeed.noArticles')}
                                    </Text>
                                </View>
                            ) : (
                                <>
                                    <ArticleList
                                        articles={newsItems}
                                        expandedIndex={expandedIndex}
                                        onArticlePress={onArticleSelect}
                                        renderExpandedContent={renderExpandedContent}
                                        scrollViewRef={scrollViewRef}
                                        suppressScroll={suppressScroll}
                                    />
                                    {renderFooter()}
                                </>
                            )}
                        </View>
                    </ReAnimated.ScrollView>
                    <LinearGradient
                        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
                        style={styles.fadeGradient}
                        pointerEvents="none"
                    />
                </View>
                {renderCelebrationEffect()}
            </SafeArea>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: SIZES.sm,
    },
    emptyState: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyStateText: {
        color: '#666666',
        fontSize: 16,
        textAlign: 'center',
    },
    endMessage: {
        alignItems: 'center',
        paddingBottom: SIZES['3xl'] * 3,
        paddingVertical: SIZES.xs,
    },
    endMessageText: {
        color: '#BBBBBB',
        fontSize: 14,
        textAlign: 'center',
    },
    fadeGradient: {
        bottom: 0,
        height: 100,
        left: 0,
        position: 'absolute',
        right: 0,
        zIndex: 1,
    },
    loadingMore: {
        alignItems: 'center',
        paddingBottom: SIZES['3xl'] * 4,
        paddingVertical: SIZES.md,
    },
    mainContainer: {
        backgroundColor: '#FFFFFF',
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    scrollContainer: {
        flex: 1,
        paddingTop: 96,
        position: 'relative',
    },
    scrollView: {
        flex: 1,
    },
});
