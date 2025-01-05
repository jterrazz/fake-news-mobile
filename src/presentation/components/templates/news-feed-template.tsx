import React from 'react';
import {
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import ReAnimated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { NewsEntity } from '@/domain/news/news.entity';

import { LoadingSpinner } from '@/presentation/components/atoms/indicators/loading-spinner';
import { Container } from '@/presentation/components/atoms/layout/container';
import { SafeArea } from '@/presentation/components/atoms/layout/safe-area';
import { CelebrationParticle } from '@/presentation/components/molecules/feedback/celebration-particle';
import { NewsHeader } from '@/presentation/components/molecules/header/news-header';
import { ArticleList } from '@/presentation/components/organisms/article/article-list';
import { ExpandedArticle } from '@/presentation/components/organisms/article/expanded-article';
import { SIZES } from '@/presentation/constants/sizes';

interface NewsFeedTemplateProps {
    newsItems: NewsEntity[];
    expandedIndex: number;
    selectedAnswer: boolean | null;
    activeTab: 'latest' | 'to-read';
    isRefreshing: boolean;
    score: number;
    lastClickedPosition: { x: number; y: number };
    answer?: { wasCorrect: boolean };
    headerAnimatedStyle: any;
    titleAnimatedStyle: any;
    scrollHandler: any;
    onTabChange: (tab: 'latest' | 'to-read') => void;
    onArticleSelect: (index: number) => void;
    onAnswerClick: (selectedFake: boolean, buttonPosition: { x: number; y: number }) => void;
    onRefresh: () => Promise<void>;
    getAnimationStyles: (index: number) => any;
}

export function NewsFeedTemplate({
    newsItems,
    expandedIndex,
    selectedAnswer,
    activeTab,
    isRefreshing,
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
    getAnimationStyles,
}: NewsFeedTemplateProps) {
    const scrollViewRef = React.useRef<ReAnimated.ScrollView>(null);

    const renderExpandedContent = (
        article: NewsEntity,
        contentAnimatedStyle: any,
        scrollToArticle?: (index: number) => void,
    ) => (
        <ExpandedArticle
            article={article}
            contentAnimatedStyle={contentAnimatedStyle}
            isAnswered={selectedAnswer !== null || article.answered !== undefined}
            selectedAnswer={selectedAnswer}
            wasCorrect={answer?.wasCorrect ?? article.answered?.wasCorrect}
            onAnswerClick={onAnswerClick}
            onNextArticle={() => {
                onArticleSelect(expandedIndex + 1);
                scrollToArticle?.(expandedIndex + 1);
            }}
            showNextButton={expandedIndex < newsItems.length - 1}
        />
    );

    const renderCelebrationEffect = () => {
        if (!answer?.wasCorrect || lastClickedPosition.x === 0) return null;
        return <CelebrationParticle isVisible={answer.wasCorrect} position={lastClickedPosition} />;
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
            <SafeArea>
                <View style={styles.scrollContainer}>
                    <ReAnimated.ScrollView
                        ref={scrollViewRef}
                        style={styles.scrollView}
                        onScroll={scrollHandler}
                        scrollEventThrottle={16}
                        bounces={true}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ flexGrow: 1 }}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={onRefresh}
                                tintColor="#000000"
                                title="Pull to refresh"
                                titleColor="#999999"
                                progressViewOffset={128}
                            />
                        }
                    >
                        <Container style={styles.container} withHeaderOffset>
                            {isRefreshing ? (
                                <LoadingSpinner size="large" />
                            ) : newsItems.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyStateText}>No articles available</Text>
                                </View>
                            ) : (
                                <ArticleList
                                    articles={newsItems}
                                    expandedIndex={expandedIndex}
                                    onArticlePress={onArticleSelect}
                                    getAnimationStyles={getAnimationStyles}
                                    renderExpandedContent={renderExpandedContent}
                                    isRefreshing={isRefreshing}
                                    scrollViewRef={scrollViewRef}
                                />
                            )}
                        </Container>
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
    fadeGradient: {
        bottom: 0,
        height: 100,
        left: 0,
        position: 'absolute',
        right: 0,
        zIndex: 1,
    },
    mainContainer: {
        backgroundColor: '#FFFFFF',
        flex: 1,
    },
    scrollContainer: {
        flex: 1,
        position: 'relative',
    },
    scrollView: {
        flex: 1,
    },
}); 