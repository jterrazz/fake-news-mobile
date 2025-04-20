import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Dimensions,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from 'react-native';
import ReAnimated, { AnimatedStyleProp, useAnimatedScrollHandler } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { NewsEntity } from '@/domain/news/news.entity';

import { NewsFeed } from '../organisms/article/news-feed.jsx';

import { LoadingSpinner } from '@/presentation/components/atoms/indicators/loading-spinner';
import { CelebrationParticle } from '@/presentation/components/molecules/feedback/celebration-particle';
import { NewsHeader } from '@/presentation/components/molecules/header/news-header';
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
    onAnswerClick: (selectedFake: boolean, articleId: string, wasCorrect: boolean) => void;
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
    const { top } = useSafeAreaInsets();

    // Only reset scroll position when tab changes, not when new articles are loaded
    React.useEffect(() => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ animated: false, y: 0 });
        }
    }, [activeTab]);

    const handleScroll = React.useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
            const paddingToBottom = 50; // Increased threshold for earlier loading
            const isCloseToBottom =
                layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

            if (isCloseToBottom && !isLoadingMore && hasNextPage) {
                // Debounce the onEndReached call to prevent multiple triggers
                requestAnimationFrame(() => {
                    onEndReached();
                });
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

    // COMPONENT LAYOUT ARCHITECTURE
    // Use a fixed pixel-based approach that won't reflow or recalculate on navigation
    const SCREEN_HEIGHT = Dimensions.get('window').height;
    const FIXED_HEADER_HEIGHT = Platform.OS === 'ios' ? 110 : 90;

    return (
        <View style={styles.mainContainer}>
            <View style={{ height: FIXED_HEADER_HEIGHT, zIndex: 10 }}>
                <NewsHeader
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                    score={score}
                    headerAnimatedStyle={headerAnimatedStyle}
                    titleAnimatedStyle={titleAnimatedStyle}
                />
            </View>

            <View
                style={{
                    flex: 1,
                    height: SCREEN_HEIGHT - FIXED_HEADER_HEIGHT,
                    marginTop: 0,
                    overflow: 'hidden',
                    paddingTop: 0,
                    position: 'relative',
                }}
            >
                <ReAnimated.ScrollView
                    ref={scrollViewRef}
                    style={styles.scrollView}
                    onScroll={combinedScrollHandler}
                    scrollEventThrottle={16}
                    bounces={true}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingTop: Platform.OS === 'ios' ? 30 : 20,
                    }}
                    onMomentumScrollEnd={handleScroll}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            tintColor="#000000"
                            title={t('common:newsFeed.retry')}
                            titleColor="#999999"
                            progressViewOffset={100}
                        />
                    }
                    maintainVisibleContentPosition={{
                        autoscrollToTopThreshold: 10,
                        minIndexForVisible: 0,
                    }}
                    removeClippedSubviews={true}
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
                                {/* <ArticleList
                                    articles={newsItems}
                                    expandedIndex={expandedIndex}
                                    onArticlePress={onArticleSelect}
                                    renderExpandedContent={renderExpandedContent}
                                    scrollViewRef={scrollViewRef}
                                    suppressScroll={suppressScroll}
                                /> */}

                                <NewsFeed articles={newsItems} onAnswerClick={onAnswerClick} />
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
    emptyState: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    emptyStateText: {
        color: '#999999',
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
        height: 80,
        left: 0,
        position: 'absolute',
        right: 0,
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
        position: 'relative',
    },
    scrollView: {
        flex: 1,
        paddingTop: 64,
    },
});
