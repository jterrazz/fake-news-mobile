import React, { useEffect, useRef, useState } from 'react';
import {
    LayoutAnimation,
    Platform,
    RefreshControl,
    StyleSheet,
    UIManager,
    View,
    ViewStyle,
} from 'react-native';
import ReAnimated, {
    AnimatedStyleProp,
    Extrapolate,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { useNewsStore } from '@/application/store/news.store';

import { NewsEntity } from '@/domain/news/news.entity';

import { FONT_SIZES, SIZES } from '../constants/sizes.js';

import { LoadingSpinner } from './atoms/indicators/loading-spinner.jsx';
import { Container } from './atoms/layout/container.jsx';
import { SafeArea } from './atoms/layout/safe-area.jsx';
import { CelebrationParticle } from './molecules/feedback/celebration-particle.js';
import { NewsHeader } from './molecules/header/news-header.jsx';
import { ArticleList } from './organisms/article/article-list.jsx';
import { ExpandedArticle } from './organisms/article/expanded-article.jsx';

import { useNewsArticles } from '@/presentation/hooks/use-news-articles';
import { useNewsQuestion } from '@/presentation/hooks/use-news-question';

interface NewsQuestionProps {
    onAnswer?: (isCorrect: boolean) => void;
}

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

type TabType = 'latest' | 'to-read';

interface ButtonPosition {
    x: number;
    y: number;
}

const LETTER_ANIMATION_INTERVAL = 3000; // 3 seconds between animations
const LETTER_ANIMATION_DURATION = 300; // 300ms for each animation
const GLITCH_OFFSET = 2; // Maximum pixel offset for glitch
const GLITCH_DURATION = 50; // Duration of each glitch movement

export function NewsQuestion({ onAnswer }: NewsQuestionProps) {
    const { data: newsItems, refetch } = useNewsArticles();

    const { answers } = useNewsStore();

    const newsItemsWithAnswers = newsItems.map((item) => ({
        ...item,
        answered: answers[item.id]
            ? {
                  answeredAt: answers[item.id].answeredAt,
                  id: answers[item.id].id,
                  wasCorrect: answers[item.id].wasCorrect,
              }
            : undefined,
    }));

    const [expandedIndex, setExpandedIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('latest');
    const [lastClickedPosition, setLastClickedPosition] = useState<ButtonPosition>({ x: 0, y: 0 });
    const [isRefreshing, setIsRefreshing] = useState(false);

    const currentNewsItem = newsItemsWithAnswers[expandedIndex];
    const { answer, handleAnswer, score } = useNewsQuestion({
        newsItem: currentNewsItem,
        onAnswer,
    });

    const scrollY = useSharedValue(0);
    const lastScrollY = useSharedValue(0);
    const headerHeight = useSharedValue(180); // Adjust this value based on your full header height

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            // Don't compress when scrolling past the top
            if (event.contentOffset.y < 0) {
                headerHeight.value = 180; // Maximum height
                lastScrollY.value = 0;
                scrollY.value = 0;
                return;
            }

            const delta = event.contentOffset.y - lastScrollY.value;
            headerHeight.value = Math.max(
                70, // Minimum header height
                Math.min(180, headerHeight.value - delta), // Maximum header height
            );
            lastScrollY.value = event.contentOffset.y;
            scrollY.value = event.contentOffset.y;
        },
    });

    const headerAnimatedStyle = useAnimatedStyle(() => {
        return {
            paddingBottom: 0,
            paddingTop: interpolate(headerHeight.value, [70, 180], [12, 64], Extrapolate.CLAMP),
        };
    });

    const titleAnimatedStyle = useAnimatedStyle(() => {
        const fontSize = interpolate(headerHeight.value, [70, 180], [32, 42], Extrapolate.CLAMP);
        const marginBottom = interpolate(
            headerHeight.value,
            [70, 180],
            [16, 40],
            Extrapolate.CLAMP,
        );
        const marginTop = interpolate(headerHeight.value, [70, 180], [8, 24], Extrapolate.CLAMP);
        const scale = interpolate(headerHeight.value, [70, 180], [0.8, 1], Extrapolate.CLAMP);

        return {
            fontSize,
            marginBottom,
            marginTop,
            transform: [{ scale }],
        };
    });

    const handleArticleSelect = (index: number) => {
        // Configure the animation
        LayoutAnimation.configureNext(
            LayoutAnimation.create(
                200,
                LayoutAnimation.Types.easeInEaseOut,
                LayoutAnimation.Properties.opacity,
            ),
        );

        setExpandedIndex(index);
        setSelectedAnswer(null);
        setLastClickedPosition({ x: 0, y: 0 });
    };

    const handleAnswerClick = async (selectedFake: boolean, buttonPosition: ButtonPosition) => {
        setSelectedAnswer(selectedFake);
        setLastClickedPosition(buttonPosition);
        await handleAnswer(selectedFake);
    };

    const getAnimationStyles = (index: number) => {
        const isExpanded = index === expandedIndex;
        const expandAnimation = useSharedValue(0);

        useEffect(() => {
            expandAnimation.value = withSpring(isExpanded ? 1 : 0, {
                damping: isExpanded ? 15 : 20,
                mass: isExpanded ? 0.8 : 1,
                stiffness: isExpanded ? 100 : 120,
                velocity: isExpanded ? 0 : -1,
            });
        }, [isExpanded]);

        return {
            containerAnimatedStyle: useAnimatedStyle(() => ({
                borderRadius: interpolate(expandAnimation.value, [0, 1], [12, 16]),
                borderWidth: 1,
            })),
            contentAnimatedStyle: useAnimatedStyle(() => ({
                opacity: interpolate(expandAnimation.value, [0.3, 0.7], [0, 1], {
                    extrapolateRight: Extrapolate.CLAMP,
                }),
                transform: [
                    {
                        translateY: interpolate(expandAnimation.value, [0, 1], [40, 0], {
                            extrapolateRight: Extrapolate.CLAMP,
                        }),
                    },
                ],
            })),
            previewAnimatedStyle: useAnimatedStyle(() => ({
                opacity: interpolate(expandAnimation.value, [0, 0.3], [1, 0], {
                    extrapolateRight: Extrapolate.CLAMP,
                }),
                transform: [
                    {
                        translateY: interpolate(expandAnimation.value, [0, 1], [0, -10], {
                            extrapolateRight: Extrapolate.CLAMP,
                        }),
                    },
                ],
            })),
        };
    };

    const renderExpandedContent = ({
        article,
        contentAnimatedStyle,
        scrollToNextArticle,
    }: {
        article: NewsEntity;
        contentAnimatedStyle: AnimatedStyleProp<ViewStyle>;
        scrollToNextArticle: () => void;
    }) => (
        <ExpandedArticle
            article={article}
            contentAnimatedStyle={contentAnimatedStyle}
            isAnswered={selectedAnswer !== null || currentNewsItem.answered !== undefined}
            selectedAnswer={selectedAnswer}
            wasCorrect={answer?.wasCorrect ?? currentNewsItem.answered?.wasCorrect}
            onAnswerClick={handleAnswerClick}
            onNextArticle={() => {
                handleArticleSelect(expandedIndex + 1);
                scrollToNextArticle();
            }}
            showNextButton={expandedIndex < newsItems.length - 1}
        />
    );

    const getFilteredNewsItems = (items: NewsEntity[]) => {
        if (activeTab === 'to-read') {
            return items.filter((item) => !item.answered);
        }
        return items;
    };

    const renderCelebrationEffect = () => {
        if (!answer?.wasCorrect || lastClickedPosition.x === 0) return null;

        return <CelebrationParticle isVisible={answer.wasCorrect} position={lastClickedPosition} />;
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        // Assuming your useNewsArticles hook has a refetch method
        // If not, you'll need to implement the refresh logic
        await refetch();
        setIsRefreshing(false);
    };

    const scrollViewRef = useRef<ReAnimated.ScrollView>(null);

    return (
        <View style={styles.mainContainer}>
            <NewsHeader
                activeTab={activeTab}
                onTabChange={setActiveTab}
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
                        contentContainerStyle={{
                            flexGrow: 1,
                        }}
                        onRefresh={handleRefresh}
                        refreshing={isRefreshing}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={handleRefresh}
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
                            ) : (
                                <ArticleList
                                    articles={getFilteredNewsItems(newsItemsWithAnswers)}
                                    expandedIndex={expandedIndex}
                                    onArticlePress={handleArticleSelect}
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
    // Action Container
    actionContainer: {
        backgroundColor: '#FFFFFF',
        borderTopColor: 'rgba(0, 0, 0, 0.06)',
        borderTopWidth: 1,
        elevation: 4,
        padding: SIZES.md,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: {
            height: -2,
            width: 0,
        },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        zIndex: 2,
    },
    article: {
        color: '#1A1A1A',
        fontFamily: Platform.OS === 'ios' ? 'New York' : 'Noto Serif',
        fontSize: FONT_SIZES.md,
        fontWeight: '400',
        letterSpacing: 0.1,
        lineHeight: 26,
        marginBottom: 0,
        marginTop: SIZES['2xs'],
        textAlign: 'left',
    },
    articleContainer: {
        backgroundColor: '#FFFFFF',
        borderColor: 'rgba(0, 0, 0, 0.04)',
        borderRadius: 12,
        borderWidth: 1,
        marginVertical: SIZES.xs,
        overflow: 'hidden',
    },
    articleContainerAnswered: {
        opacity: 0.8,
    },
    articleContainerExpanded: {
        backgroundColor: '#FFFFFF',
        borderColor: 'rgba(0, 0, 0, 0.06)',
        borderRadius: 16,
        borderWidth: 1,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {
            height: 12,
            width: 0,
        },
        shadowOpacity: 0.16,
        shadowRadius: 24,
    },
    articleContent: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.sm,
        position: 'relative',
        zIndex: 1,
    },
    articleDate: {
        color: '#999999',
        fontSize: 11,
        fontWeight: '500',
    },
    // Article Content
    articleHeader: {
        backgroundColor: '#FFFFFF',
        borderBottomColor: 'rgba(0, 0, 0, 0.06)',
        borderBottomWidth: 1,
        elevation: 4,
        paddingBottom: SIZES.lg,
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.lg,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: {
            height: 2,
            width: 0,
        },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        zIndex: 3,
    },
    articlePressable: {
        overflow: 'hidden',
    },
    // Article Layout
    articleWrapper: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            height: 2,
            width: 0,
        },
        shadowOpacity: 0.06,
        shadowRadius: 8,
    },
    bottomSpacer: {
        height: 100,
    },
    container: {
        paddingHorizontal: SIZES.sm,
    },
    // Expanded Content
    expandedContent: {
        position: 'relative',
    },
    expandedPublisher: {
        color: '#454545',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.8,
        marginBottom: 1,
        textTransform: 'uppercase',
    },
    // Publisher Info
    expandedPublisherContainer: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    expandedPublisherIcon: {
        borderRadius: 10,
        height: 28,
        width: 28,
    },
    expandedPublisherInfo: {
        marginLeft: SIZES.md + SIZES['2xs'],
    },
    expandedTopRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    // Gradient and Effects
    fadeGradient: {
        bottom: 0,
        height: 100,
        left: 0,
        position: 'absolute',
        right: 0,
        zIndex: 1,
    },
    // Layout
    mainContainer: {
        backgroundColor: '#FFFFFF',
        flex: 1,
    },
    // Preview Content
    previewContent: {
        position: 'relative',
    },
    previewContentHidden: {
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
    },
    scrollContainer: {
        flex: 1,
        position: 'relative',
    },
    scrollView: {
        flex: 1,
    },
});
