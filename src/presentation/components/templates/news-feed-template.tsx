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
} from 'react-native';
import ReAnimated, {
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { NewsEntity } from '@/domain/news/news.entity';

import { NewsFeed } from '../organisms/article/news-feed.jsx';

import { LoadingSpinner } from '@/presentation/components/atoms/indicators/loading-spinner';
import { CelebrationParticle } from '@/presentation/components/molecules/feedback/celebration-particle';
import { NewsHeader } from '@/presentation/components/molecules/header/news-header';
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
    onTabChange,
    onArticleSelect,
    onAnswerClick,
    onRefresh,
    onEndReached,
}: NewsFeedTemplateProps) {
    const { t } = useTranslation();
    const scrollViewRef = React.useRef<ReAnimated.ScrollView>(null);
    const scrollY = useSharedValue(0);

    // Only reset scroll position when tab changes
    React.useEffect(() => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ animated: false, y: 0 });
        }
    }, [activeTab]);

    const handleScroll = React.useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
            const paddingToBottom = 50;
            const isCloseToBottom =
                layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

            if (isCloseToBottom && !isLoadingMore && hasNextPage) {
                requestAnimationFrame(() => {
                    onEndReached();
                });
            }
        },
        [isLoadingMore, hasNextPage, onEndReached],
    );

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            'worklet';
            scrollY.value = event.contentOffset.y;
        },
    });

    const headerAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: 0 }],
        };
    });

    const titleAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: 0 }],
        };
    });

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
    const SCREEN_HEIGHT = Dimensions.get('window').height;
    const FIXED_HEADER_HEIGHT = Platform.OS === 'ios' ? 110 : 90;

    let content;
    if (isRefreshing) {
        content = <LoadingSpinner size="large" />;
    } else if (newsItems.length === 0) {
        content = (
            <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>{t('common:newsFeed.noArticles')}</Text>
            </View>
        );
    } else {
        content = (
            <>
                <NewsFeed articles={newsItems} onAnswerClick={onAnswerClick} />
                {renderFooter()}
            </>
        );
    }

    return (
        <View style={styles.mainContainer}>
            <View style={{ height: FIXED_HEADER_HEIGHT, zIndex: 10 }}>
                <NewsHeader
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                    score={score}
                    headerAnimatedStyle={headerAnimatedStyle}
                    titleAnimatedStyle={titleAnimatedStyle}
                    scrollY={scrollY}
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
                    onScroll={scrollHandler}
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
                    <View style={styles.container}>{content}</View>
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
