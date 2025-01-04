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
    const [expandedIndex, setExpandedIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('latest');
    const [lastClickedPosition, setLastClickedPosition] = useState<ButtonPosition>({ x: 0, y: 0 });

    const currentNewsItem = newsItems[expandedIndex];
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

        setExpandedIndex(index);
        // Reset states when switching articles
        setSelectedAnswer(null);
        setLastClickedPosition({ x: 0, y: 0 });
    };

    const handleAnswerClick = async (selectedFake: boolean, buttonPosition: ButtonPosition) => {
        setSelectedAnswer(selectedFake);
        setLastClickedPosition(buttonPosition);
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

        return (
            <View key={item.id}>
                {index > 0}
                <View style={styles.articleWrapper}>
                    <Pressable
                        style={[
                            styles.articleContainer,
                            isExpanded && styles.articleContainerExpanded,
                        ]}
                        onPress={() => handleArticleSelect(index)}
                    >
                        {!isExpanded ? (
                            // Preview mode with enhanced styling
                            <View style={styles.previewContent}>
                                <View style={styles.previewIconContainer}>
                                    <Image
                                        source={require('../../assets/icon.png')}
                                        style={styles.previewIcon}
                                    />
                                </View>
                                <View style={styles.previewTextContainer}>
                                    <Text numberOfLines={2} style={styles.previewHeadline}>
                                        {item.headline}
                                    </Text>
                                    <View style={styles.previewMetaContainer}>
                                        <Text style={styles.previewPublisher}>
                                            AI BREAKING NEWS
                                        </Text>
                                        <Text style={styles.previewTime}>2h ago</Text>
                                    </View>
                                </View>
                                <View style={styles.dotContainer}>
                                    <View
                                        style={[
                                            styles.statusIcon,
                                            !item.answered && styles.statusIconEmpty,
                                            item.answered &&
                                                !item.answered.wasCorrect &&
                                                styles.statusIconIncorrect,
                                        ]}
                                    >
                                        {item.answered ? (
                                            <Feather
                                                name={item.answered.wasCorrect ? 'check' : 'x'}
                                                size={10}
                                                color="#FFFFFF"
                                            />
                                        ) : null}
                                    </View>
                                </View>
                            </View>
                        ) : (
                            // Expanded mode with new layout
                            <View>
                                {/* Article Header */}
                                <View style={styles.articleHeader}>
                                    <Text style={styles.headline}>{item.headline}</Text>
                                    <View style={styles.expandedPublisherContainer}>
                                        <Image
                                            source={require('../../assets/icon.png')}
                                            style={styles.expandedPublisherIcon}
                                        />
                                        <View>
                                            <Text style={styles.expandedPublisher}>
                                                AI BREAKING NEWS
                                            </Text>
                                            <Text style={styles.articleDate}>
                                                {format(new Date(), 'MMMM d, yyyy')}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Article Content */}
                                <View style={styles.articleContent}>
                                    <Text style={styles.article}>{item.article}</Text>
                                </View>

                                {/* Action Buttons */}
                                <View style={styles.actionContainer}>
                                    <View style={styles.buttonContainer}>
                                        <View style={styles.buttonWrapper}>
                                            <Animated.View
                                                style={[
                                                    styles.button,
                                                    getButtonStyle(
                                                        item.isFake,
                                                        answer?.wasCorrect,
                                                        selectedAnswer,
                                                    ),
                                                ]}
                                            >
                                                <Pressable
                                                    style={styles.pressable}
                                                    onPress={(event) => {
                                                        const { pageX, pageY } = event.nativeEvent;
                                                        handleAnswerClick(true, {
                                                            x: pageX,
                                                            y: pageY,
                                                        });
                                                    }}
                                                    disabled={selectedAnswer !== null}
                                                >
                                                    <Animated.Text
                                                        style={[
                                                            styles.buttonText,
                                                            getTextStyle(
                                                                answer?.wasCorrect,
                                                                selectedAnswer,
                                                            ),
                                                        ]}
                                                    >
                                                        FAKE
                                                    </Animated.Text>
                                                </Pressable>
                                            </Animated.View>
                                            {selectedAnswer === true && renderIcon(item.isFake)}
                                        </View>

                                        <View style={styles.buttonWrapper}>
                                            <Animated.View
                                                style={[
                                                    styles.button,
                                                    getButtonStyle(
                                                        !item.isFake,
                                                        answer?.wasCorrect,
                                                        selectedAnswer,
                                                    ),
                                                ]}
                                            >
                                                <Pressable
                                                    style={styles.pressable}
                                                    onPress={(event) => {
                                                        const { pageX, pageY } = event.nativeEvent;
                                                        handleAnswerClick(false, {
                                                            x: pageX,
                                                            y: pageY,
                                                        });
                                                    }}
                                                    disabled={selectedAnswer !== null}
                                                >
                                                    <Animated.Text
                                                        style={[
                                                            styles.buttonText,
                                                            getTextStyle(
                                                                answer?.wasCorrect,
                                                                selectedAnswer,
                                                            ),
                                                        ]}
                                                    >
                                                        REAL
                                                    </Animated.Text>
                                                </Pressable>
                                            </Animated.View>
                                            {selectedAnswer === false && renderIcon(!item.isFake)}
                                        </View>
                                    </View>

                                    {selectedAnswer !== null &&
                                        expandedIndex < newsItems.length - 1 && (
                                            <View style={styles.nextButtonContainer}>
                                                <Pressable
                                                    style={styles.nextButton}
                                                    onPress={() =>
                                                        handleArticleSelect(expandedIndex + 1)
                                                    }
                                                >
                                                    <Text style={styles.nextButtonText}>
                                                        NEXT ARTICLE
                                                    </Text>
                                                </Pressable>
                                            </View>
                                        )}
                                </View>
                            </View>
                        )}
                    </Pressable>
                </View>
            </View>
        );
    };

    const getFilteredNewsItems = () => {
        if (activeTab === 'to-read') {
            return newsItems.filter((item) => !item.answered);
        }
        return newsItems;
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
                            {getFilteredNewsItems().map((item, index) =>
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
        paddingHorizontal: 24,
        paddingTop: 32,
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
        color: '#333333',
        fontFamily: Platform.OS === 'ios' ? 'New York' : 'serif',
        fontSize: 18,
        letterSpacing: 0.2,
        lineHeight: 32,
        marginBottom: 32,
    },
    articleContainer: {
        backgroundColor: '#FFFFFF',
        borderColor: 'rgba(0, 0, 0, 0.04)',
        borderRadius: 20,
        borderWidth: 1,
        elevation: 3,
        flex: 1,
        marginVertical: 8,
        paddingVertical: 16,
        shadowColor: '#000',
        shadowOffset: {
            height: 8,
            width: 0,
        },
        shadowOpacity: 0.06,
        shadowRadius: 12,
    },
    articleContainerExpanded: {
        backgroundColor: '#FFFFFF',
        borderColor: 'rgba(0, 0, 0, 0.04)',
        borderRadius: 24,
        borderWidth: 1,
        elevation: 4,
        paddingVertical: 32,
        shadowColor: '#000',
        shadowOffset: {
            height: 8,
            width: 0,
        },
        shadowOpacity: 0.12,
        shadowRadius: 16,
    },
    articleContent: {
        paddingHorizontal: 24,
    },
    articleDate: {
        color: '#999999',
        fontSize: 12,
        fontWeight: '500',
    },
    articleHeader: {
        marginBottom: 24,
        paddingHorizontal: 24,
    },
    articleWrapper: {
        elevation: 1,
    },
    articlesList: {},
    bottomSpacer: {
        height: 100,
    },
    button: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 2,
        elevation: 3,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            height: 4,
            width: 0,
        },
        shadowOpacity: 0.12,
        shadowRadius: 8,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'space-between',
    },
    buttonText: {
        fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    buttonWrapper: {
        flex: 1,
        position: 'relative',
    },
    celebrationContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        position: 'absolute',
        zIndex: 99,
    },
    container: {
        backgroundColor: '#FFFFFF',
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 140,
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
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    expandedPublisherContainer: {
        alignItems: 'center',
        borderBottomColor: 'rgba(0, 0, 0, 0.08)',
        borderBottomWidth: 1,
        flexDirection: 'row',
        marginBottom: 24,
        paddingBottom: 24,
    },
    expandedPublisherIcon: {
        borderRadius: 8,
        height: 32,
        marginRight: 12,
        width: 32,
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
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 48 : 32,
    },
    headerContentInner: {
        alignItems: 'center',
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 16,
        paddingHorizontal: 24,
    },
    headline: {
        color: '#000000',
        fontFamily: Platform.OS === 'ios' ? 'New York' : 'serif',
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -0.5,
        lineHeight: 40,
        marginBottom: 20,
    },
    iconContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
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
        borderRadius: 16,
        elevation: 3,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            height: 4,
            width: 0,
        },
        shadowOpacity: 0.12,
        shadowRadius: 8,
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
        gap: 16,
        paddingHorizontal: 20,
    },
    previewHeadline: {
        color: '#1A1A1A',
        fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.3,
        lineHeight: 24,
    },
    previewIcon: {
        borderRadius: 8,
        height: 32,
        width: 32,
    },
    previewIconContainer: {
        backgroundColor: '#F9F9F9',
        borderColor: 'rgba(0, 0, 0, 0.03)',
        borderRadius: 16,
        borderWidth: 1,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: {
            height: 4,
            width: 0,
        },
        shadowOpacity: 0.06,
        shadowRadius: 8,
    },
    previewMetaContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    previewPublisher: {
        color: '#666666',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    previewTextContainer: {
        flex: 1,
        gap: 4,
    },
    previewTime: {
        color: '#999999',
        fontSize: 12,
        fontWeight: '500',
    },
    publicationTitle: {
        color: '#000000',
        fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: 4,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.08)',
        textShadowOffset: { height: 1, width: 0 },
        textShadowRadius: 2,
        textTransform: 'uppercase',
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
        color: '#333',
        fontSize: 15,
        fontWeight: '700',
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
        width: 16,
    },
    statusIconEmpty: {
        backgroundColor: 'transparent',
        borderColor: '#242424',
        borderWidth: 1.5,
    },
    statusIconIncorrect: {
        backgroundColor: '#666666',
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
