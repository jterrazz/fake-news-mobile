import React, { useEffect, useRef, useState } from 'react';
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
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { useNewsQuestion } from '@/hooks/use-news-question';
import { useNewsStore } from '@/store/news';

interface NewsItem {
    id: string;
    headline: string;
    article: string;
    isFake: boolean;
    answered?: {
        wasCorrect: boolean;
    };
}

export const SAMPLE_NEWS_ITEMS: NewsItem[] = [
    {
        article:
            "Researchers have found that trees communicate and share resources through an underground fungal network, dubbed the 'Wood Wide Web'. This network allows trees to share nutrients and send warning signals about environmental changes and threats.",
        headline: 'Scientists Discover Trees Can Communicate Through Underground Network',
        id: '1',
        isFake: false,
    },
    {
        article:
            'A startup claims to have developed a revolutionary pill that temporarily enables humans to extract oxygen from water, allowing them to breathe underwater for up to 4 hours. The pill supposedly modifies human lung tissue to process water like fish gills.',
        headline: 'New Technology Allows Humans to Breathe Underwater Without Equipment',
        id: '2',
        isFake: true,
    },
    {
        article:
            'Scientists at Stanford University have developed an AI system that successfully predicted a magnitude 5.2 earthquake in California two hours before it occurred. The system analyzes subtle changes in seismic activity and ground deformation patterns using machine learning algorithms trained on historical earthquake data.',
        headline: 'AI System Predicts Earthquake 2 Hours Before It Happens',
        id: '3',
        isFake: true,
    },
    {
        article:
            "Researchers have created the first living robots that can reproduce on their own. These microscopic 'xenobots,' made from frog cells, can find single cells, gather hundreds of them, and assemble baby robots inside their mouths that look and move like themselves.",
        headline: 'Scientists Create First Self-Replicating Living Robots',
        id: '4',
        isFake: false,
    },
    {
        article:
            'A paralyzed individual has successfully posted messages on Twitter using only their thoughts, thanks to a brain-computer interface developed by researchers. The implant translates neural signals into text, allowing direct mental communication with digital devices.',
        headline: 'Brain Implant Allows Paralyzed Person to Tweet Using Thoughts',
        id: '5',
        isFake: false,
    },
    {
        article:
            'A groundbreaking drug developed by MIT researchers can cure cancer in just 24 hours, thanks to an AI-powered drug design system. The drug targets the specific genetic mutation responsible for the disease, effectively eliminating it without causing harm to healthy cells.',
        headline: 'New AI-Powered Drug Can Cure Cancer in 24 Hours',
        id: '6',
        isFake: true,
    },
    {
        article:
            'A groundbreaking drug developed by MIT researchers can cure cancer in just 24 hours, thanks to an AI-powered drug design system. The drug targets the specific genetic mutation responsible for the disease, effectively eliminating it without causing harm to healthy cells.',
        headline: 'New AI-Powered Drug Can Cure Cancer in 24 Hours',
        id: '7',
        isFake: true,
    },
    {
        article:
            'A groundbreaking drug developed by MIT researchers can cure cancer in just 24 hours, thanks to an AI-powered drug design system. The drug targets the specific genetic mutation responsible for the disease, effectively eliminating it without causing harm to healthy cells.',
        headline: 'New AI-Powered Drug Can Cure Cancer in 24 Hours',
        id: '8',
        isFake: true,
    },
];

interface NewsQuestionProps {
    newsItems: NewsItem[];
    onAnswer?: (isCorrect: boolean) => void;
}

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

type TabType = 'latest' | 'to-read';

const ENHANCED_COLORS = [
    'rgba(0, 0, 0, 0.9)',
    'rgba(0, 0, 0, 0.8)',
    'rgba(0, 0, 0, 0.7)',
    'rgba(0, 0, 0, 0.6)',
    'rgba(0, 0, 0, 0.5)',
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

const createParticles = (): BurstParticle[] => {
    return Array.from({ length: BURST_PARTICLE_COUNT }, (_, i) => {
        // Create more varied sizes and distances based on random factors
        const sizeVariation = Math.random();
        const distanceVariation = Math.random();

        return {
            angle: (i * 2 * Math.PI) / BURST_PARTICLE_COUNT,
            animation: new Animated.Value(0),

            color: ENHANCED_COLORS[Math.floor(Math.random() * ENHANCED_COLORS.length)],

            delay: Math.random() * 50,

            // More varied distances: smaller particles can travel further
            distance: (40 + Math.random() * 60) * (1 + distanceVariation),

            rotation: new Animated.Value(0),
            // More varied scales
            scale: 0.2 + Math.random() * 0.8,
            // More varied sizes
            size: 3 + sizeVariation * 8,
        };
    });
};

export function NewsQuestion({ newsItems, onAnswer }: NewsQuestionProps) {
    const { answers } = useNewsStore();

    // Merge the stored answers with news items
    const newsItemsWithAnswers = newsItems.map((item) => ({
        ...item,
        answered: answers[item.id]
            ? {
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

    // Remove height animations, keep other animation values
    const iconAnim = useRef(new Animated.Value(0)).current;

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

        return {
            fontSize,
            marginBottom,
            marginTop,
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

        // Calculate positions
        const centerX = 27.5;
        const fakeStartX = 2;
        const realStartX = 98 - 45;

        // Reset animation values
        animations.slide.fake.setValue(selectedFake ? fakeStartX : realStartX);
        animations.slide.real.setValue(selectedFake ? realStartX : fakeStartX);

        // Start next button animation immediately
        Animated.parallel([
            Animated.spring(nextButtonAnim.opacity, {
                damping: 20,
                mass: 0.4, // Even lighter mass for faster response
                stiffness: 300,
                toValue: 1,
                useNativeDriver: true,
            }),
            Animated.spring(nextButtonAnim.scale, {
                damping: 15,
                mass: 0.5,
                stiffness: 250,
                toValue: 1,
                useNativeDriver: true,
            }),
        ]).start();

        // Main button animations
        Animated.parallel([
            // Fade out unselected button with smooth cubic bezier
            Animated.timing(animations.fade[selectedFake ? 'real' : 'fake'], {
                duration: 600,
                easing: Easing.bezier(0.45, 0, 0.25, 1),
                toValue: 0,
                useNativeDriver: true,
            }),

            // Move selected button to center with refined spring physics
            Animated.spring(animations.slide[selectedFake ? 'fake' : 'real'], {
                damping: 28,
                mass: 0.9,
                stiffness: 250,
                toValue: centerX,
                useNativeDriver: true,
                velocity: 0,
            }),

            // Move unselected button to center with smooth timing
            Animated.timing(animations.slide[selectedFake ? 'real' : 'fake'], {
                duration: 600,
                easing: Easing.bezier(0.45, 0, 0.25, 1),
                toValue: centerX,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setIsMergeComplete(true);
        });

        await handleAnswer(selectedFake);
    };

    // Simplified button animations
    const getButtonStyle = (
        isFake: boolean,
        isCorrect: boolean | null,
        selectedAnswer: boolean | null,
    ) => ({
        backgroundColor:
            selectedAnswer !== null ? (isCorrect ? '#F8F8F8' : '#000000') : 'transparent',
        borderColor: selectedAnswer !== null ? (isCorrect ? '#000000' : 'transparent') : '#000000',
        opacity: selectedAnswer !== null && !isCorrect ? 0.5 : 1,
        transform: selectedAnswer !== null && isCorrect ? [{ scale: 1.02 }] : [],
    });

    const getTextStyle = (isCorrect: boolean | null, selectedAnswer: boolean | null) => ({
        color: selectedAnswer !== null ? (isCorrect ? '#000000' : '#FFFFFF') : '#000000',
        opacity: selectedAnswer !== null && !isCorrect ? 0.7 : 1,
    });

    const renderIcon = (isCorrect: boolean) => (
        <Animated.View
            style={[
                styles.iconContainer,
                {
                    transform: [{ scale: iconAnim }],
                },
            ]}
        >
            <Feather
                name={isCorrect ? 'check-circle' : 'x-circle'}
                size={32}
                color={isCorrect ? '#03A678' : '#E15554'}
            />
        </Animated.View>
    );

    const renderArticle = (item: NewsItem, index: number) => {
        const isExpanded = index === expandedIndex;
        const categories = ['TECH', 'SCIENCE', 'HEALTH', 'WORLD'];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];

        return (
            <View key={item.id}>
                <View style={styles.articleWrapper}>
                    <Pressable
                        style={[
                            styles.articleContainer,
                            isExpanded && styles.articleContainerExpanded,
                            item.answered && styles.articleContainerAnswered,
                        ]}
                        onPress={() => handleArticleSelect(index)}
                    >
                        {!isExpanded ? (
                            <View style={styles.previewContent}>
                                <View style={styles.previewLeftColumn}>
                                    <View style={styles.previewIconContainer}>
                                        <Image
                                            source={require('../../assets/icon.png')}
                                            style={styles.previewIcon}
                                            resizeMode="cover"
                                        />
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
                                            <Text style={styles.categoryText}>
                                                {randomCategory}
                                            </Text>
                                        </View>
                                        <Text style={styles.previewDot}>•</Text>
                                        <Text style={styles.previewTime}>2h ago</Text>
                                    </View>
                                </View>

                                <View style={styles.previewRightColumn}>
                                    <View
                                        style={[
                                            styles.statusIcon,
                                            !item.answered && styles.statusIconEmpty,
                                            item.answered &&
                                                !item.answered.wasCorrect &&
                                                styles.statusIconIncorrect,
                                            item.answered &&
                                                item.answered.wasCorrect &&
                                                styles.statusIconCorrect,
                                        ]}
                                    >
                                        {item.answered && (
                                            <Feather
                                                name={item.answered.wasCorrect ? 'check' : 'x'}
                                                size={10}
                                                color="#FFFFFF"
                                            />
                                        )}
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <View>
                                <View style={styles.articleHeader}>
                                    <View style={styles.expandedTopRow}>
                                        <View style={styles.categoryTag}>
                                            <Text style={styles.categoryText}>
                                                {randomCategory}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.headline}>{item.headline}</Text>
                                    <View style={styles.expandedPublisherContainer}>
                                        <Image
                                            source={require('../../assets/icon.png')}
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
                                <View style={styles.actionContainer}>{renderAnswerButtons()}</View>
                            </View>
                        )}
                    </Pressable>
                </View>
            </View>
        );
    };

    const getFilteredNewsItems = (items: NewsItem[]) => {
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
                            duration: 600,
                            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                            toValue: 1,
                            useNativeDriver: true,
                        }),
                        Animated.timing(particle.rotation, {
                            duration: 600,
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

                    return (
                        <Animated.View
                            key={`burst-${index}`}
                            style={[
                                styles.particle,
                                {
                                    backgroundColor: particle.color,
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

    const renderAnswerButtons = () => {
        const isAnswered = selectedAnswer !== null;
        const wasCorrect = answer?.wasCorrect;
        const animations = animationStates.get(currentNewsItem.id);

        if (!animations) return null;

        return (
            <View style={styles.buttonContainer}>
                {/* FAKE button */}
                <Animated.View
                    style={[
                        styles.buttonWrapper,
                        !isAnswered && styles.buttonWrapperLeft,
                        isMergeComplete && selectedAnswer === true && styles.buttonWrapperCentered,
                        {
                            opacity: animations.fade.fake,
                            transform: [
                                {
                                    translateX: animations.slide.fake.interpolate({
                                        inputRange: [0, 100],
                                        outputRange: ['0%', '100%'],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    <Pressable
                        style={({ pressed }) => [
                            styles.button,
                            isAnswered &&
                                (wasCorrect ? styles.buttonCorrect : styles.buttonIncorrect),
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
                            <MaterialCommunityIcons
                                name="close-circle-outline"
                                size={20}
                                color={isAnswered ? '#FFFFFF' : '#000000'}
                                style={styles.buttonIcon}
                            />
                            <Text
                                style={[
                                    styles.buttonText,
                                    isAnswered &&
                                        (wasCorrect
                                            ? styles.buttonTextCorrect
                                            : styles.buttonTextIncorrect),
                                ]}
                            >
                                FAKE
                            </Text>
                        </View>
                    </Pressable>
                </Animated.View>

                {/* REAL button */}
                <Animated.View
                    style={[
                        styles.buttonWrapper,
                        !isAnswered && styles.buttonWrapperRight,
                        isMergeComplete && selectedAnswer === false && styles.buttonWrapperCentered,
                        {
                            opacity: animations.fade.real,
                            transform: [
                                {
                                    translateX: animations.slide.real.interpolate({
                                        inputRange: [0, 100],
                                        outputRange: ['0%', '100%'],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    <Pressable
                        style={({ pressed }) => [
                            styles.button,
                            isAnswered &&
                                (wasCorrect ? styles.buttonCorrect : styles.buttonIncorrect),
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
                            <MaterialCommunityIcons
                                name="check-circle-outline"
                                size={20}
                                color={isAnswered ? '#FFFFFF' : '#000000'}
                                style={styles.buttonIcon}
                            />
                            <Text
                                style={[
                                    styles.buttonText,
                                    isAnswered &&
                                        (wasCorrect
                                            ? styles.buttonTextCorrect
                                            : styles.buttonTextIncorrect),
                                ]}
                            >
                                REAL
                            </Text>
                        </View>
                    </Pressable>
                </Animated.View>

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
                            <Feather name="arrow-right" size={18} color="#666666" />
                        </Pressable>
                    </Animated.View>
                )}
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
                    <ReAnimated.Text style={[styles.publicationTitle, titleAnimatedStyle]}>
                        FAKE NEWS
                    </ReAnimated.Text>
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
                                <MaterialCommunityIcons name="star" size={20} color="#FFD700" />
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
                        style={styles.container}
                        onScroll={scrollHandler}
                        scrollEventThrottle={16}
                        bounces={false}
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
        borderTopColor: 'rgba(0, 0, 0, 0.08)',
        borderTopWidth: 1,
        marginTop: 6,
        paddingHorizontal: 16,
        paddingVertical: 14,
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
        color: '#2D3748',
        firstLineColor: '#1A202C',
        firstLineSize: 20,
        fontFamily: Platform.OS === 'ios' ? 'New York' : 'Noto Serif',
        fontSize: 16,
        letterSpacing: 0.2,
        lineHeight: 24,
        marginBottom: 0,
        paddingHorizontal: 2,
        textAlign: 'left',
        textShadowColor: 'rgba(0, 0, 0, 0.02)',
        textShadowOffset: { height: 0.5, width: 0 },
        textShadowRadius: 0.5,
    },
    articleContainer: {
        backgroundColor: '#FFFFFF',
        borderColor: 'rgba(0, 0, 0, 0.04)',
        borderRadius: 16,
        borderWidth: 1,
        elevation: 2,
        marginHorizontal: 2,
        marginVertical: 6,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            height: 4,
            width: 0,
        },
        shadowOpacity: 0.08,
        shadowRadius: 12,
    },
    articleContainerAnswered: {
        opacity: 0.8,
    },
    articleContainerExpanded: {
        backgroundColor: '#FFFFFF',
        borderColor: 'rgba(0, 0, 0, 0.06)',
        borderRadius: 20,
        borderWidth: 1,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {
            height: 8,
            width: 0,
        },
        shadowOpacity: 0.12,
        shadowRadius: 16,
    },
    articleContent: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    articleDate: {
        color: '#999999',
        fontSize: 11,
        fontWeight: '500',
    },
    articleDate: {
        color: '#999999',
        fontSize: 11,
        fontWeight: '500',
    },
    articleHeader: {
        backgroundColor: '#FFFFFF',
        borderBottomColor: 'rgba(0, 0, 0, 0.08)',
        borderBottomWidth: 1,
        paddingBottom: 14,
        paddingHorizontal: 16,
        paddingTop: 16,
        shadowColor: '#000',
        shadowOffset: {
            height: 2,
            width: 0,
        },
        shadowOpacity: 0.02,
        shadowRadius: 4,
    },
    articleWrapper: {
        elevation: 1,
    },
    articlesList: {},
    bottomSpacer: {
        height: 80,
    },
    button: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 3,
        borderColor: '#000000',
        borderRadius: 12,
        borderWidth: 1.5,
        elevation: 3,
        height: 56,
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
        minHeight: 56,
        overflow: 'hidden',
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
        paddingHorizontal: 12,
    },
    buttonText: {
        color: '#000000',
        fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 2,
        lineHeight: 56,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
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
        borderRadius: 4,
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
        paddingHorizontal: 14,
        paddingTop: 120,
    },
    date: {
        color: '#000000',
        fontFamily: 'System',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1.5,
        marginBottom: 16,
        marginTop: 24,
        textTransform: 'uppercase',
    },
    dotContainer: {
        justifyContent: 'center',
        paddingLeft: 12,
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
        marginTop: 8,
    },
    expandedPublisherIcon: {
        borderRadius: 8,
        height: 28,
        width: 28,
    },
    expandedPublisherInfo: {
        marginLeft: 8,
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
    iconContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
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
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: 10,
        elevation: 1,
        height: 36,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            height: 2,
            width: 0,
        },
        shadowOpacity: 0.04,
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
        gap: 8,
        padding: 14,
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
        borderRadius: 0,
        height: '100%',
        width: '100%',
    },
    previewIconContainer: {
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        borderColor: 'rgba(0, 0, 0, 0.06)',
        borderRadius: 8,
        borderWidth: 1,
        height: 36,
        justifyContent: 'center',
        overflow: 'hidden',
        width: 36,
    },
    previewLeftColumn: {
        alignItems: 'center',
        marginRight: 4,
        width: 40,
    },
    previewMetaContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 6,
    },
    previewPublisher: {
        color: '#666666',
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    previewRightColumn: {
        alignItems: 'center',
        marginLeft: 'auto',
        width: 20,
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
    publicationTitle: {
        color: '#000000',
        fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: 4,
        marginBottom: 16,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.08)',
        textShadowOffset: { height: 1, width: 0 },
        textShadowRadius: 2,
        textTransform: 'uppercase',
    },
    resultIndicator: {
        backgroundColor: '#FFFFFF',
        borderColor: '#22C55E',
        borderRadius: 10,
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
        borderRadius: 6,
        flexDirection: 'row',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    scrollContainer: {
        flex: 1,
        position: 'relative',
    },
    statusIcon: {
        alignItems: 'center',
        backgroundColor: '#242424',
        borderRadius: 6,
        height: 16,
        justifyContent: 'center',
        width: 16,
    },
    statusIconCorrect: {
        backgroundColor: '#03A678',
    },
    statusIconEmpty: {
        backgroundColor: 'transparent',
        borderColor: '#242424',
        borderWidth: 2,
    },
    statusIconIncorrect: {
        backgroundColor: '#E15554',
    },
    tab: {
        paddingHorizontal: 4,
        paddingVertical: 8,
        position: 'relative',
    },
    tabContainer: {
        flexDirection: 'row',
        gap: 24,
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
