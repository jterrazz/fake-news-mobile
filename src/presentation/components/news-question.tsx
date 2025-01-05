import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Image,
    LayoutAnimation,
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    UIManager,
    View,
} from 'react-native';
import ReAnimated, {
    Extrapolate,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { useNewsStore } from '@/application/store/news.store';

import { NewsEntity } from '@/domain/news/news.entity';

import { FONT_SIZES, SIZES } from '../constants/sizes.js';

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

const ENHANCED_COLORS = [
    'rgba(34, 197, 94, 0.95)', // Green-500
    'rgba(34, 197, 94, 0.85)',
    'rgba(22, 163, 74, 0.75)', // Green-600
    'rgba(255, 255, 255, 0.9)', // White
    'rgba(255, 255, 255, 0.8)', // White
];

interface Particle {
    animation: Animated.Value;
    angle: number;
    distance: number;
    color: string;
    scale: number;
    rotation: Animated.Value;
}

const BURST_PARTICLE_COUNT = 32;

interface BurstParticle extends Particle {
    delay: number;
    size: number;
}

interface ButtonPosition {
    x: number;
    y: number;
}

const LETTER_ANIMATION_INTERVAL = 3000; // 3 seconds between animations
const LETTER_ANIMATION_DURATION = 300; // 300ms for each animation
const GLITCH_OFFSET = 2; // Maximum pixel offset for glitch
const GLITCH_DURATION = 50; // Duration of each glitch movement

const createParticles = (): BurstParticle[] => {
    return Array.from({ length: BURST_PARTICLE_COUNT }, (_, i) => {
        const sizeVariation = Math.random();
        const distanceVariation = Math.random();

        return {
            angle: (i * 2 * Math.PI) / BURST_PARTICLE_COUNT,
            animation: new Animated.Value(0),
            color: ENHANCED_COLORS[Math.floor(Math.random() * ENHANCED_COLORS.length)],
            delay: Math.random() * 30, // Reduced from 50
            // Reduced distance range
            distance: (20 + Math.random() * 40) * (1 + distanceVariation), // Reduced from (40 + Math.random() * 60)
            rotation: new Animated.Value(0),
            scale: 0.2 + Math.random() * 0.8,
            size: 2 + sizeVariation * 6, // Slightly smaller particles
        };
    });
};

export function NewsQuestion({ onAnswer }: NewsQuestionProps) {
    const { data: newsItems } = useNewsArticles();

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
    const [animationStates] = useState(
        () =>
            new Map<
                string,
                {
                    fade: { fake: Animated.Value; real: Animated.Value };
                    slide: { fake: Animated.Value; real: Animated.Value };
                }
            >(),
    );

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

    const scrollViewRef = useRef<ReAnimated.ScrollView>(null);

    const handleArticleSelect = (index: number) => {
        // Configure the animation
        LayoutAnimation.configureNext(
            LayoutAnimation.create(
                200,
                LayoutAnimation.Types.easeInEaseOut,
                LayoutAnimation.Properties.opacity,
            ),
        );

        const newArticleId = newsItems[index].id;
        if (!animationStates.has(newArticleId)) {
            animationStates.set(newArticleId, {
                fade: {
                    fake: new Animated.Value(1),
                    real: new Animated.Value(1),
                },
                slide: {
                    fake: new Animated.Value(0),
                    real: new Animated.Value(0),
                },
            });
        }

        // Reset with new initial values
        nextButtonAnim.opacity.setValue(0);
        nextButtonAnim.scale.setValue(0.95);

        setExpandedIndex(index);
        setSelectedAnswer(null);
        setLastClickedPosition({ x: 0, y: 0 });

        // Add a small delay to ensure the layout has updated
        setTimeout(() => {
            // Calculate the scroll position (height of each collapsed article * index)
            const scrollPosition = index * 100; // Adjust this value based on your collapsed article height

            scrollViewRef.current?.scrollTo({
                animated: true,
                y: scrollPosition,
            });
        }, 100);
    };

    const [isMergeComplete, setIsMergeComplete] = useState(false);

    const [nextButtonAnim] = useState(() => ({
        opacity: new Animated.Value(0),
        scale: new Animated.Value(0.95), // Slightly larger initial scale
    }));

    const handleAnswerClick = async (selectedFake: boolean, buttonPosition: ButtonPosition) => {
        const currentArticleId = currentNewsItem.id;
        const animations = animationStates.get(currentArticleId);

        if (!animations) return;

        setSelectedAnswer(selectedFake);
        setLastClickedPosition(buttonPosition);
        setIsMergeComplete(false);

        // Calculate positions for merging animation
        const centerX = 27.5; // Center position
        const leftStartX = 2; // Left button starting position
        const rightStartX = 98 - 45; // Right button starting position

        // Reset animation values
        animations.slide.fake.setValue(selectedFake ? leftStartX : rightStartX);
        animations.slide.real.setValue(selectedFake ? rightStartX : leftStartX);
        animations.fade.fake.setValue(1);
        animations.fade.real.setValue(1);

        // Create smooth merging animation
        Animated.parallel([
            // Fade out unselected button with smoother easing
            Animated.timing(animations.fade[selectedFake ? 'real' : 'fake'], {
                duration: 400, // Increased from 300 for smoother fade
                easing: Easing.bezier(0.4, 0.0, 0.2, 1), // Material Design easing
                toValue: 0,
                useNativeDriver: true,
            }),

            // Move selected button to center with refined spring physics
            Animated.spring(animations.slide[selectedFake ? 'fake' : 'real'], {
                damping: 28, // Increased from 20 for less bounce
                mass: 1, // Increased from 0.8 for more natural feel
                restDisplacementThreshold: 0.01,
                restSpeedThreshold: 0.01,
                stiffness: 300, // Increased from 250 for faster initial movement
                toValue: centerX,
                useNativeDriver: true,
            }),

            // Move unselected button with smoother timing
            Animated.timing(animations.slide[selectedFake ? 'real' : 'fake'], {
                duration: 400, // Increased from 300 to match fade duration
                easing: Easing.bezier(0.4, 0.0, 0.2, 1), // Material Design easing
                toValue: centerX,
                useNativeDriver: true,
            }),

            // Scale animation for selected button with refined timing
            Animated.sequence([
                Animated.timing(nextButtonAnim.scale, {
                    duration: 200, // Increased from 150 for smoother scale
                    easing: Easing.bezier(0.4, 0.0, 0.2, 1),
                    toValue: 1.05,
                    useNativeDriver: true,
                }),
                Animated.spring(nextButtonAnim.scale, {
                    damping: 15, // Adjusted for subtle bounce
                    mass: 0.8,
                    restDisplacementThreshold: 0.01,
                    restSpeedThreshold: 0.01,
                    stiffness: 250,
                    toValue: 1,
                    useNativeDriver: true,
                }),
            ]),

            // Fade in scale animation with smoother timing
            Animated.timing(nextButtonAnim.opacity, {
                delay: 200, // Increased from 150 to better match movement
                duration: 300, // Increased from 200 for smoother fade
                easing: Easing.bezier(0.4, 0.0, 0.2, 1),
                toValue: 1,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setIsMergeComplete(true);
        });

        await handleAnswer(selectedFake);
    };

    const renderArticle = (item: NewsEntity, index: number) => {
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

        const containerAnimatedStyle = useAnimatedStyle(() => {
            const borderRadius = interpolate(expandAnimation.value, [0, 1], [12, 16]);

            return {
                borderRadius,
                borderWidth: 1,
            };
        });

        const previewAnimatedStyle = useAnimatedStyle(() => {
            return {
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
            };
        });

        const contentAnimatedStyle = useAnimatedStyle(() => {
            return {
                opacity: interpolate(
                    expandAnimation.value,
                    [0.3, 0.7], // Adjusted timing for content fade
                    [0, 1],
                    { extrapolateRight: Extrapolate.CLAMP },
                ),
                transform: [
                    {
                        translateY: interpolate(
                            expandAnimation.value,
                            [0, 1],
                            [40, 0], // Increased initial offset
                            { extrapolateRight: Extrapolate.CLAMP },
                        ),
                    },
                ],
            };
        });

        return (
            <View key={item.id}>
                <View style={styles.articleWrapper}>
                    <ReAnimated.View
                        style={[
                            styles.articleContainer,
                            item.answered && styles.articleContainerAnswered,
                            containerAnimatedStyle,
                        ]}
                    >
                        <Pressable
                            onPress={() => handleArticleSelect(index)}
                            style={styles.articlePressable}
                        >
                            <ReAnimated.View
                                style={[
                                    styles.previewContent,
                                    previewAnimatedStyle,
                                    isExpanded && styles.previewContentHidden,
                                ]}
                            >
                                <View style={styles.previewLeftColumn}>
                                    <View style={styles.previewIconContainer}>
                                        <Image
                                            source={require('../../../assets/icon.png')}
                                            style={styles.previewIcon}
                                            resizeMode="cover"
                                        />
                                        {item.answered && (
                                            <View
                                                style={[
                                                    styles.statusIcon,
                                                    !item.answered.wasCorrect &&
                                                        styles.statusIconIncorrect,
                                                    item.answered.wasCorrect &&
                                                        styles.statusIconCorrect,
                                                ]}
                                            >
                                                <Text style={styles.statusIconText}>
                                                    {item.isFake ? 'F' : 'R'}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                <View style={styles.previewTextContainer}>
                                    <Text style={styles.previewHeadline} numberOfLines={2}>
                                        {item.headline}
                                    </Text>
                                    <View style={styles.previewMetaContainer}>
                                        <Text style={styles.previewPublisher}>
                                            AI BREAKING NEWS
                                        </Text>
                                        <Text style={styles.previewDot}>•</Text>
                                        <View style={styles.categoryTag}>
                                            <Text style={styles.categoryText}>{item.category}</Text>
                                        </View>
                                        <Text style={styles.previewDot}>•</Text>
                                        <Text style={styles.previewTime}>2h ago</Text>
                                    </View>
                                </View>

                                <View style={styles.previewRightColumn}>
                                    {item.answered && (
                                        <View
                                            style={[
                                                styles.statusIcon,
                                                !item.answered.wasCorrect &&
                                                    styles.statusIconIncorrect,
                                                item.answered.wasCorrect &&
                                                    styles.statusIconCorrect,
                                            ]}
                                        >
                                            <Text style={styles.statusIconText}>
                                                {item.isFake ? 'F' : 'R'}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </ReAnimated.View>

                            {isExpanded && (
                                <ReAnimated.View
                                    style={[styles.expandedContent, contentAnimatedStyle]}
                                >
                                    <View style={styles.articleHeader}>
                                        <View style={styles.expandedTopRow}>
                                            <View style={styles.categoryTag}>
                                                <Text style={styles.categoryText}>
                                                    {item.category}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={styles.headline}>{item.headline}</Text>
                                        <View style={styles.expandedPublisherContainer}>
                                            <Image
                                                source={require('../../../assets/icon.png')}
                                                style={styles.expandedPublisherIcon}
                                            />
                                            <View style={styles.expandedPublisherInfo}>
                                                <Text style={styles.expandedPublisher}>
                                                    AI BREAKING NEWS
                                                </Text>
                                                <Text style={styles.articleDate}>
                                                    {format(new Date(), 'MMMM d, yyyy')}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.articleContent}>
                                        <Text style={styles.article}>{item.article}</Text>
                                    </View>
                                    <View style={styles.actionContainer}>
                                        {renderAnswerButtons()}
                                    </View>
                                </ReAnimated.View>
                            )}
                        </Pressable>
                    </ReAnimated.View>
                </View>
            </View>
        );
    };

    const getFilteredNewsItems = (items: NewsEntity[]) => {
        if (activeTab === 'to-read') {
            return items.filter((item) => !item.answered);
        }
        return items;
    };

    const renderCelebrationEffect = () => {
        // Create new particles for each render to ensure fresh animation
        const [particles] = useState(() => createParticles());

        useEffect(() => {
            if (answer?.wasCorrect && lastClickedPosition.x !== 0) {
                particles.forEach((particle) => {
                    particle.animation.setValue(0);
                    particle.rotation.setValue(0);

                    Animated.parallel([
                        Animated.timing(particle.animation, {
                            duration: 400, // Reduced from 600
                            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                            toValue: 1,
                            useNativeDriver: true,
                        }),
                        Animated.timing(particle.rotation, {
                            duration: 400, // Reduced from 600
                            easing: Easing.bezier(0.33, 0, 0.67, 1),
                            toValue: 2,
                            useNativeDriver: true,
                        }),
                    ]).start();
                });
            }
        }, [answer?.wasCorrect, lastClickedPosition]);

        if (!answer?.wasCorrect || lastClickedPosition.x === 0) return null;

        return (
            <View
                style={[
                    styles.celebrationContainer,
                    {
                        bottom: undefined,
                        // Larger container
                        height: 200,

                        left: lastClickedPosition.x - 100,

                        right: undefined,

                        // Larger container
                        top: lastClickedPosition.y - 100,
                        width: 200,
                    },
                ]}
            >
                {particles.map((particle, index) => {
                    const translateX = particle.animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, Math.cos(particle.angle) * particle.distance],
                    });

                    const translateY = particle.animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, Math.sin(particle.angle) * particle.distance],
                    });

                    const scale = particle.animation.interpolate({
                        inputRange: [0, 0.3, 1],
                        outputRange: [0, particle.scale, 0],
                    });

                    const rotate = particle.rotation.interpolate({
                        inputRange: [0, 2],
                        outputRange: ['0deg', '720deg'],
                    });

                    const backgroundColor = particle.animation.interpolate({
                        inputRange: [0, 0.3, 0.8, 1],
                        outputRange: [
                            particle.color,
                            particle.color,
                            'rgba(255, 255, 255, 0.9)',
                            'rgba(255, 255, 255, 0)',
                        ],
                    });

                    return (
                        <Animated.View
                            key={`burst-${index}`}
                            style={[
                                styles.particle,
                                {
                                    backgroundColor,
                                    borderRadius: particle.size / 2,
                                    height: particle.size,
                                    transform: [
                                        { translateX },
                                        { translateY },
                                        { scale },
                                        { rotate },
                                    ],
                                    width: particle.size,
                                },
                            ]}
                        />
                    );
                })}
            </View>
        );
    };

    const initializeAnimationState = (itemId: string) => {
        if (animationStates.has(itemId)) return;

        const newAnimations = {
            fade: {
                fake: new Animated.Value(1),
                real: new Animated.Value(1),
            },
            slide: {
                fake: new Animated.Value(0),
                real: new Animated.Value(0),
            },
        };

        animationStates.set(itemId, newAnimations);
    };

    const renderAnswerButtons = () => {
        if (!currentNewsItem) return null;

        const isAnswered = selectedAnswer !== null || currentNewsItem.answered !== undefined;
        const wasCorrect = answer?.wasCorrect ?? currentNewsItem.answered?.wasCorrect;

        if (!animationStates.has(currentNewsItem.id)) {
            initializeAnimationState(currentNewsItem.id);
        }

        const animations = animationStates.get(currentNewsItem.id);
        if (!animations) return null;

        return (
            <View style={styles.buttonContainer}>
                <View style={styles.hintContainer}>
                    <Text
                        style={[
                            styles.hintText,
                            { textTransform: isAnswered ? 'uppercase' : 'none' },
                        ]}
                    >
                        {isAnswered
                            ? `This article was ${currentNewsItem.isFake ? 'FAKE' : 'REAL'}`
                            : 'Is this article fake or real?'}
                    </Text>
                </View>

                {currentNewsItem.answered ? (
                    <View style={styles.buttonWrapperCentered}>
                        <View
                            style={[
                                styles.button,
                                wasCorrect ? styles.buttonCorrect : styles.buttonIncorrect,
                            ]}
                        >
                            <View style={styles.buttonInner}>
                                <Text
                                    style={[
                                        styles.buttonText,
                                        wasCorrect
                                            ? styles.buttonTextCorrect
                                            : styles.buttonTextIncorrect,
                                    ]}
                                >
                                    {currentNewsItem.isFake ? 'FAKE' : 'REAL'}
                                </Text>
                            </View>
                        </View>
                    </View>
                ) : (
                    <>
                        <Animated.View
                            style={[
                                styles.buttonWrapper,
                                !isAnswered && styles.buttonWrapperLeft,
                                isMergeComplete &&
                                    selectedAnswer === true &&
                                    styles.buttonWrapperCentered,
                                {
                                    opacity: animations.fade.fake,
                                    transform: [
                                        {
                                            translateX: animations.slide.fake,
                                        },
                                        {
                                            scale:
                                                selectedAnswer === true ? nextButtonAnim.scale : 1,
                                        },
                                    ],
                                    zIndex: selectedAnswer === true ? 2 : 1,
                                },
                            ]}
                        >
                            <Pressable
                                style={({ pressed }) => [
                                    styles.button,
                                    selectedAnswer === true &&
                                        answer &&
                                        (answer.wasCorrect
                                            ? styles.buttonCorrect
                                            : styles.buttonIncorrect),
                                    pressed && { transform: [{ scale: 0.98 }] },
                                ]}
                                onPress={(event) =>
                                    handleAnswerClick(true, {
                                        x: event.nativeEvent.pageX,
                                        y: event.nativeEvent.pageY,
                                    })
                                }
                                disabled={isAnswered}
                            >
                                <View style={styles.buttonInner}>
                                    <Text
                                        style={[
                                            styles.buttonText,
                                            selectedAnswer === true &&
                                                answer &&
                                                (answer.wasCorrect
                                                    ? styles.buttonTextCorrect
                                                    : styles.buttonTextIncorrect),
                                        ]}
                                    >
                                        FAKE
                                    </Text>
                                </View>
                            </Pressable>
                        </Animated.View>

                        <Animated.View
                            style={[
                                styles.buttonWrapper,
                                !isAnswered && styles.buttonWrapperRight,
                                isMergeComplete &&
                                    selectedAnswer === false &&
                                    styles.buttonWrapperCentered,
                                {
                                    opacity: animations.fade.real,
                                    transform: [
                                        {
                                            translateX: animations.slide.real,
                                        },
                                        {
                                            scale:
                                                selectedAnswer === false ? nextButtonAnim.scale : 1,
                                        },
                                    ],
                                    zIndex: selectedAnswer === false ? 2 : 1,
                                },
                            ]}
                        >
                            <Pressable
                                style={({ pressed }) => [
                                    styles.button,
                                    selectedAnswer === false &&
                                        answer &&
                                        (answer.wasCorrect
                                            ? styles.buttonCorrect
                                            : styles.buttonIncorrect),
                                    pressed && { transform: [{ scale: 0.98 }] },
                                ]}
                                onPress={(event) =>
                                    handleAnswerClick(false, {
                                        x: event.nativeEvent.pageX,
                                        y: event.nativeEvent.pageY,
                                    })
                                }
                                disabled={isAnswered}
                            >
                                <View style={styles.buttonInner}>
                                    <Text
                                        style={[
                                            styles.buttonText,
                                            selectedAnswer === false &&
                                                answer &&
                                                (answer.wasCorrect
                                                    ? styles.buttonTextCorrect
                                                    : styles.buttonTextIncorrect),
                                        ]}
                                    >
                                        REAL
                                    </Text>
                                </View>
                            </Pressable>
                        </Animated.View>
                    </>
                )}

                {/* Next article button */}
                {isAnswered && expandedIndex < newsItems.length - 1 && (
                    <Animated.View
                        style={{
                            opacity: nextButtonAnim.opacity,
                            position: 'absolute',
                            right: '2%',
                            transform: [
                                { scale: nextButtonAnim.scale },
                                {
                                    translateX: nextButtonAnim.opacity.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [20, 0],
                                    }),
                                },
                            ],
                        }}
                    >
                        <Pressable
                            style={styles.nextButton}
                            onPress={() => handleArticleSelect(expandedIndex + 1)}
                        >
                            <Feather name="arrow-down" size={18} color="#FFFFFF" />
                        </Pressable>
                    </Animated.View>
                )}
            </View>
        );
    };

    useEffect(() => {
        // Initialize animation states for the default expanded article
        if (expandedIndex === 0 && newsItems.length > 0) {
            const defaultItem = newsItems[0];
            if (!animationStates.has(defaultItem.id)) {
                initializeAnimationState(defaultItem.id);
            }
        }
    }, []);

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
                        easing: Easing.easeOut,
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
                    easing: Easing.easeIn,
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

    return (
        <View style={styles.mainContainer}>
            <BlurView
                intensity={95}
                tint="extraLight"
                style={[styles.headerBlur, headerAnimatedStyle]}
            >
                <SafeAreaView style={styles.headerContent}>
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
                </SafeAreaView>
            </BlurView>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.scrollContainer}>
                    <ReAnimated.ScrollView
                        ref={scrollViewRef}
                        style={styles.container}
                        onScroll={scrollHandler}
                        scrollEventThrottle={16}
                        bounces={false}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingTop: 24 }}
                    >
                        <Text style={styles.date}>{format(new Date(), 'MMMM d, yyyy')}</Text>
                        <View style={styles.articlesList}>
                            {getFilteredNewsItems(newsItemsWithAnswers).map((item, index) =>
                                renderArticle(item, index),
                            )}
                        </View>
                        <View style={styles.bottomSpacer} />
                    </ReAnimated.ScrollView>
                    <LinearGradient
                        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
                        style={styles.fadeGradient}
                        pointerEvents="none"
                    />
                </View>
                {renderCelebrationEffect()}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    actionContainer: {
        backgroundColor: '#FFFFFF',
        borderTopColor: 'rgba(0, 0, 0, 0.06)',
        borderTopWidth: 1,
        elevation: 4,
        marginTop: 6,
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
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
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SIZES.xl,
        minHeight: 56,
        overflow: 'visible',
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
        left: '2%',
    },
    buttonWrapperRight: {
        right: '2%',
    },
    categoryTag: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    categoryText: {
        color: '#666666',
        fontSize: 9,
        fontWeight: '600',
        letterSpacing: 0.5,
        lineHeight: 11,
        textTransform: 'uppercase',
    },
    celebrationContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        position: 'absolute',
        zIndex: 99,
    },
    container: {
        backgroundColor: '#F8F9FA',
        flex: 1,
        paddingHorizontal: SIZES.sm,
        paddingTop: 128,
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
        left: 0,
        position: 'absolute',
        right: 0,
        top: -28,
        zIndex: 10,
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
        elevation: 1,
        height: 36,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            height: 2,
            width: 0,
        },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        width: 36,
    },
    nextButtonContainer: {
        marginTop: 24,
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
        alignItems: 'center',
        flexDirection: 'row',
        gap: SIZES.xs * 3,
        padding: SIZES.md,
        paddingVertical: SIZES.sm + SIZES['2xs'],
    },
    previewContentHidden: {
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
    },
    previewDot: {
        color: '#999999',
        fontSize: 10,
        lineHeight: 10,
    },
    previewHeadline: {
        color: '#1A1A1A',
        fontFamily: Platform.OS === 'ios' ? 'New York' : 'serif',
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.2,
        lineHeight: 19,
    },
    previewIcon: {
        borderRadius: 8,
        height: '100%',
        width: '100%',
    },
    previewIconContainer: {
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        borderColor: 'rgba(0, 0, 0, 0.06)',
        borderRadius: 12,
        borderWidth: 1,
        height: 36,
        justifyContent: 'center',
        overflow: 'visible',
        position: 'relative',
        width: 36,
    },
    previewLeftColumn: {
        alignItems: 'center',
        position: 'relative',
        width: 40,
    },
    previewMetaContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: SIZES.xs,
    },
    previewPublisher: {
        color: '#666666',
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    previewRightColumn: {
        display: 'none',
    },
    previewTextContainer: {
        flex: 1,
        gap: 6,
        justifyContent: 'center',
        paddingRight: 8,
    },
    previewTime: {
        color: '#999999',
        fontSize: 11,
        fontWeight: '500',
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
    safeArea: {
        backgroundColor: 'transparent',
        flex: 1,
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
    statusIcon: {
        alignItems: 'center',
        backgroundColor: '#242424',
        borderRadius: 8,
        height: 16,
        justifyContent: 'center',
        position: 'absolute',
        right: -4,
        top: -4,
        width: 16,
        zIndex: 1,
    },
    statusIconCorrect: {
        backgroundColor: '#03A678',
    },
    statusIconIncorrect: {
        backgroundColor: '#E15554',
    },
    statusIconText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '800',
        textAlign: 'center',
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
