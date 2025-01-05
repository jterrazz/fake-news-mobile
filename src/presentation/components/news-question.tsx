import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Image,
    LayoutAnimation,
    Platform,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { useNewsStore } from '@/application/store/news.store';

import { NewsEntity } from '@/domain/news/news.entity';

import { FONT_SIZES, SIZES } from '../constants/sizes.js';

import { LoadingSpinner } from './atoms/indicators/loading-spinner.jsx';
import { Container } from './atoms/layout/container.jsx';
import { SafeArea } from './atoms/layout/safe-area.jsx';
import { Body } from './atoms/typography/body.jsx';
import { CategoryLabel } from './atoms/typography/category-label.jsx';
import { Headline } from './atoms/typography/headline.jsx';
import { CelebrationParticle } from './molecules/feedback/celebration-particle.js';
import { ArticleList } from './organisms/article/article-list.jsx';
import { AnswerButtons } from './organisms/question/answer-buttons.jsx';

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

    const renderExpandedContent = (
        article: NewsEntity,
        contentAnimatedStyle: AnimatedStyleProp<ViewStyle>,
        scrollToArticle?: (index: number) => void
    ) => (
        <ReAnimated.View style={[styles.expandedContent, contentAnimatedStyle]}>
            <View style={styles.articleHeader}>
                <View style={styles.expandedTopRow}>
                    <CategoryLabel>{article.category}</CategoryLabel>
                </View>
                <Headline style={{ marginBottom: 12 }}>{article.headline}</Headline>
                <View style={styles.expandedPublisherContainer}>
                    <Image
                        source={require('../../../assets/icon.png')}
                        style={styles.expandedPublisherIcon}
                    />
                    <View style={styles.expandedPublisherInfo}>
                        <Text style={styles.expandedPublisher}>AI BREAKING NEWS</Text>
                        <Text style={styles.articleDate}>{format(new Date(), 'MMMM d, yyyy')}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.articleContent}>
                <Body size="medium">{article.article}</Body>
            </View>
            <View style={styles.actionContainer}>
                <AnswerButtons
                    isAnswered={selectedAnswer !== null || currentNewsItem.answered !== undefined}
                    selectedAnswer={selectedAnswer}
                    wasCorrect={answer?.wasCorrect ?? currentNewsItem.answered?.wasCorrect}
                    onAnswerClick={handleAnswerClick}
                    onNextArticle={() => {
                        handleArticleSelect(expandedIndex + 1);
                        scrollToArticle?.(expandedIndex + 1);
                    }}
                    showNextButton={expandedIndex < newsItems.length - 1}
                    currentArticleId={currentNewsItem.id}
                />
            </View>
        </ReAnimated.View>
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

    const renderAnswerButtons = () => {
        if (!currentNewsItem) return null;

        const isAnswered = selectedAnswer !== null || currentNewsItem.answered !== undefined;
        const wasCorrect = answer?.wasCorrect ?? currentNewsItem.answered?.wasCorrect;

        return (
            <AnswerButtons
                isAnswered={isAnswered}
                selectedAnswer={selectedAnswer}
                wasCorrect={wasCorrect}
                onAnswerClick={handleAnswerClick}
                onNextArticle={() => handleArticleSelect(expandedIndex + 1)}
                showNextButton={expandedIndex < newsItems.length - 1}
                currentArticleId={currentNewsItem.id}
            />
        );
    };

    const [letterAnimations] = useState(() =>
        Array.from({ length: 9 }, () => ({
            isAnimating: false,
            offset: new Animated.ValueXY({ x: 0, y: 0 }),
            value: new Animated.Value(1),
        })),
    );

    const animateLetter = useCallback(
        (index: number) => {
            if (letterAnimations[index].isAnimating) return;

            letterAnimations[index].isAnimating = true;

            // Create random glitch offsets
            const xOffset = (Math.random() - 0.5) * GLITCH_OFFSET * 2;
            const yOffset = (Math.random() - 0.5) * GLITCH_OFFSET * 2;

            Animated.sequence([
                // Initial scale up with glitch
                Animated.parallel([
                    Animated.timing(letterAnimations[index].value, {
                        duration: LETTER_ANIMATION_DURATION / 2,
                        easing: Easing.out(Easing.ease),
                        toValue: 1.2,
                        useNativeDriver: true,
                    }),
                    // Quick random position shifts
                    Animated.sequence([
                        Animated.timing(letterAnimations[index].offset, {
                            duration: GLITCH_DURATION,
                            easing: Easing.linear,
                            toValue: { x: xOffset, y: yOffset },
                            useNativeDriver: true,
                        }),
                        Animated.timing(letterAnimations[index].offset, {
                            duration: GLITCH_DURATION,
                            easing: Easing.linear,
                            toValue: { x: -xOffset, y: -yOffset },
                            useNativeDriver: true,
                        }),
                        Animated.timing(letterAnimations[index].offset, {
                            duration: GLITCH_DURATION,
                            easing: Easing.linear,
                            toValue: { x: 0, y: 0 },
                            useNativeDriver: true,
                        }),
                    ]),
                ]),
                // Scale back to normal
                Animated.timing(letterAnimations[index].value, {
                    duration: LETTER_ANIMATION_DURATION / 2,
                    easing: Easing.out(Easing.ease),
                    toValue: 1,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                letterAnimations[index].isAnimating = false;
            });
        },
        [letterAnimations],
    );

    useEffect(() => {
        const interval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * 9);
            animateLetter(randomIndex);
        }, LETTER_ANIMATION_INTERVAL);

        return () => clearInterval(interval);
    }, [animateLetter]);

    const renderAnimatedTitle = () => {
        const letters = 'FAKE NEWS'.split('');

        return (
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                {letters.map((letter, index) => (
                    <Animated.Text
                        key={`${letter}-${index}`}
                        style={[
                            styles.publicationTitleLetter,
                            {
                                transform: [
                                    { scale: letterAnimations[index].value },
                                    { translateX: letterAnimations[index].offset.x },
                                    { translateY: letterAnimations[index].offset.y },
                                ],
                            },
                        ]}
                    >
                        {letter}
                    </Animated.Text>
                ))}
            </View>
        );
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
            <BlurView
                intensity={95}
                tint="extraLight"
                style={[styles.headerBlur, headerAnimatedStyle]}
            >
                <SafeArea style={styles.headerContent}>
                    <ReAnimated.View style={[styles.publicationTitleContainer, titleAnimatedStyle]}>
                        {renderAnimatedTitle()}
                    </ReAnimated.View>
                    <View style={styles.headerContentInner}>
                        <View style={styles.tabContainer}>
                            <Pressable style={[styles.tab]} onPress={() => setActiveTab('latest')}>
                                <Text
                                    style={[
                                        styles.tabText,
                                        activeTab === 'latest' && styles.tabTextActive,
                                    ]}
                                >
                                    Latest
                                </Text>
                                {activeTab === 'latest' && <View style={styles.activeIndicator} />}
                            </Pressable>
                            <Pressable style={[styles.tab]} onPress={() => setActiveTab('to-read')}>
                                <Text
                                    style={[
                                        styles.tabText,
                                        activeTab === 'to-read' && styles.tabTextActive,
                                    ]}
                                >
                                    To Read
                                </Text>
                                {activeTab === 'to-read' && <View style={styles.activeIndicator} />}
                            </Pressable>
                        </View>
                        <View style={styles.scoreContainer}>
                            <View style={styles.scoreItem}>
                                <MaterialCommunityIcons
                                    name="check-circle"
                                    size={18}
                                    color="#22C55E"
                                    style={{ marginVertical: 1 }}
                                />
                                <Text style={styles.scoreText}>{score.score}</Text>
                            </View>
                            <View style={styles.scoreItem}>
                                <MaterialCommunityIcons name="fire" size={20} color="#FF4500" />
                                <Text style={styles.scoreText}>×{score.streak}</Text>
                            </View>
                        </View>
                    </View>
                </SafeArea>
            </BlurView>
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
    activeIndicator: {
        backgroundColor: '#000000',
        borderRadius: 1,
        bottom: -16,
        height: 2,
        left: 0,
        position: 'absolute',
        right: 0,
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
    articlesList: {
        paddingTop: 8,
    },
    bottomSpacer: {
        height: 100,
    },
    button: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 3,
        borderColor: '#000000',
        borderRadius: 10,
        borderWidth: 1.5,
        elevation: 3,
        height: 48,
        overflow: 'hidden',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: {
            height: 2,
            width: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        width: '100%',
    },
    buttonContainer: {
        alignItems: 'center',
        flexDirection: 'column',
        gap: SIZES.md,
        justifyContent: 'center',
        position: 'relative',
        width: '100%',
    },
    buttonCorrect: {
        backgroundColor: '#22C55E',
        borderBottomColor: '#167C3D',
        borderColor: '#1B9D4D',
    },
    buttonIcon: {
        marginRight: 8,
        opacity: 0.7,
    },
    buttonIncorrect: {
        backgroundColor: '#EF4444',
        borderBottomColor: '#B91C1C',
        borderColor: '#DC2626',
    },
    buttonInner: {
        alignItems: 'center',
        flexDirection: 'row',
        height: '100%',
        justifyContent: 'center',
    },
    buttonRow: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: SIZES.md,
        justifyContent: 'center',
        minHeight: 48,
        position: 'relative',
        width: '100%',
    },
    buttonText: {
        color: '#000000',
        fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
        fontSize: FONT_SIZES.sm,
        fontWeight: '700',
        letterSpacing: 2,
        lineHeight: 48,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.05)',
        textShadowOffset: { height: 1, width: 0 },
        textShadowRadius: 1,
    },
    buttonTextCorrect: {
        color: '#FFFFFF',
    },
    buttonTextIncorrect: {
        color: '#FFFFFF',
    },
    buttonWrapper: {
        position: 'absolute',
        transform: [{ scale: 1 }],
        width: '45%',
    },
    buttonWrapperCentered: {
        left: '27.5%',
        position: 'absolute',
        width: '45%',
    },
    buttonWrapperLeft: {
        position: 'relative',
        width: 'auto',
    },
    buttonWrapperRight: {
        position: 'relative',
        width: 'auto',
    },
    celebrationContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        position: 'absolute',
        zIndex: 99,
    },
    container: {
        paddingHorizontal: SIZES.sm,
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
    dotContainer: {
        justifyContent: 'center',
        paddingLeft: 12,
    },
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
    fadeGradient: {
        bottom: 0,
        height: 100,
        left: 0,
        position: 'absolute',
        right: 0,
        zIndex: 1,
    },
    headerBlur: {
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
        borderBottomWidth: 1,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 10,
    },
    headerContent: {
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 44 : 28,
    },
    headerContentInner: {
        alignItems: 'center',
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 12,
        paddingHorizontal: 16,
    },
    headline: {
        color: '#000000',
        fontFamily: Platform.OS === 'ios' ? 'New York' : 'serif',
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: -0.5,
        lineHeight: 30,
        marginBottom: 12,
        textShadowColor: 'rgba(0, 0, 0, 0.04)',
        textShadowOffset: { height: 1, width: 0 },
        textShadowRadius: 1,
    },
    hintContainer: {
        alignItems: 'center',
        position: 'relative',
        width: '100%',
    },
    hintText: {
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
        color: '#666666',
        elevation: 1,
        fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
        fontSize: 13,
        fontWeight: '500',
        letterSpacing: 0.3,
        opacity: 0.8,
        overflow: 'hidden',
        paddingHorizontal: 8,
        paddingVertical: 4,
        shadowColor: '#000',
        shadowOffset: {
            height: 1,
            width: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    iconContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        elevation: 4,
        padding: 2,
        position: 'absolute',
        right: -16,
        shadowColor: '#000',
        shadowOffset: {
            height: 2,
            width: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        top: -16,
    },
    mainContainer: {
        backgroundColor: '#FFFFFF',
        flex: 1,
    },
    nextButton: {
        alignItems: 'center',
        backgroundColor: '#000000',
        borderRadius: 8,
        height: 36,
        justifyContent: 'center',
        width: 36,
    },
    nextButtonContainer: {
        position: 'relative',
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    particle: {
        position: 'absolute',
    },
    pressable: {
        alignItems: 'center',
        padding: 16,
        width: '100%',
    },
    previewContent: {
        position: 'relative',
    },
    previewContentHidden: {
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
    },
    publicationTitleContainer: {
        marginBottom: 16,
        width: '100%',
    },
    publicationTitleLetter: {
        color: '#000000',
        fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto-Black',
        fontSize: 42,
        fontWeight: '900',
        letterSpacing: 4,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.12)',
        textShadowOffset: { height: 2, width: 0 },
        textShadowRadius: 3,
    },
    resultIndicator: {
        backgroundColor: '#FFFFFF',
        borderColor: '#22C55E',
        borderRadius: 8,
        borderWidth: 1.5,
        padding: 4,
        position: 'absolute',
        right: -8,
        top: -8,
    },
    resultIndicatorError: {
        borderColor: '#EF4444',
    },
    scoreContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 12,
    },
    scoreItem: {
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        borderRadius: 8,
        flexDirection: 'row',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    scoreText: {
        color: '#333333',
        fontSize: 14,
        fontWeight: '600',
    },
    scrollContainer: {
        flex: 1,
        position: 'relative',
    },
    scrollView: {
        flex: 1,
    },
    tab: {
        paddingHorizontal: 4,
        paddingVertical: 5,
        position: 'relative',
    },
    tabContainer: {
        flexDirection: 'row',
        gap: SIZES.lg,
    },
    tabText: {
        color: '#666666',
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    tabTextActive: {
        color: '#000000',
    },
});
