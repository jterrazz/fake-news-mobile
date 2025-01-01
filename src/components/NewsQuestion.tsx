import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  SafeAreaView,
  Image,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  Easing,
} from "react-native";
import { format } from "date-fns";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient"; 
import * as Haptics from 'expo-haptics';
import ReAnimated, { 
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

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
    id: "1",
    headline:
      "Scientists Discover Trees Can Communicate Through Underground Network",
    article:
      "Researchers have found that trees communicate and share resources through an underground fungal network, dubbed the 'Wood Wide Web'. This network allows trees to share nutrients and send warning signals about environmental changes and threats.",
    isFake: false,
  },
  {
    id: "2",
    headline:
      "New Technology Allows Humans to Breathe Underwater Without Equipment",
    article:
      "A startup claims to have developed a revolutionary pill that temporarily enables humans to extract oxygen from water, allowing them to breathe underwater for up to 4 hours. The pill supposedly modifies human lung tissue to process water like fish gills.",
    isFake: true,
  },
  {
    id: "3",
    headline: "AI System Predicts Earthquake 2 Hours Before It Happens",
    article:
      "Scientists at Stanford University have developed an AI system that successfully predicted a magnitude 5.2 earthquake in California two hours before it occurred. The system analyzes subtle changes in seismic activity and ground deformation patterns using machine learning algorithms trained on historical earthquake data.",
    isFake: true,
  },
  {
    id: "4",
    headline: "Scientists Create First Self-Replicating Living Robots",
    article:
      "Researchers have created the first living robots that can reproduce on their own. These microscopic 'xenobots,' made from frog cells, can find single cells, gather hundreds of them, and assemble baby robots inside their mouths that look and move like themselves.",
    isFake: false,
  },
  {
    id: "5",
    headline: "Brain Implant Allows Paralyzed Person to Tweet Using Thoughts",
    article:
      "A paralyzed individual has successfully posted messages on Twitter using only their thoughts, thanks to a brain-computer interface developed by researchers. The implant translates neural signals into text, allowing direct mental communication with digital devices.",
    isFake: false,
  },
  {
    id: "6",
    headline: "New AI-Powered Drug Can Cure Cancer in 24 Hours",
    article:
      "A groundbreaking drug developed by MIT researchers can cure cancer in just 24 hours, thanks to an AI-powered drug design system. The drug targets the specific genetic mutation responsible for the disease, effectively eliminating it without causing harm to healthy cells.",
    isFake: true,
  },
  {
    id: "7",
    headline: "New AI-Powered Drug Can Cure Cancer in 24 Hours",
    article:
      "A groundbreaking drug developed by MIT researchers can cure cancer in just 24 hours, thanks to an AI-powered drug design system. The drug targets the specific genetic mutation responsible for the disease, effectively eliminating it without causing harm to healthy cells.",
    isFake: true,
  },
  {
    id: "8",
    headline: "New AI-Powered Drug Can Cure Cancer in 24 Hours",
    article:
      "A groundbreaking drug developed by MIT researchers can cure cancer in just 24 hours, thanks to an AI-powered drug design system. The drug targets the specific genetic mutation responsible for the disease, effectively eliminating it without causing harm to healthy cells.",
    isFake: true,
  },
];

interface NewsQuestionProps {
  newsItems: NewsItem[];
  onAnswer: (isCorrect: boolean) => void;
}

const TIMING_CONFIG = {
  duration: 200,
  useNativeDriver: true,
};

// Enable LayoutAnimation for Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

type TabType = 'latest' | 'to-read';

const PARTICLE_COUNT = 24;
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
const BUTTON_PARTICLE_COUNT = 16;

interface BurstParticle extends Particle {
  delay: number;
  size: number;
}

interface ButtonParticle {
  animation: Animated.Value;
  size: number;
  color: string;
  offsetX: number;
  offsetY: number;
  duration: number;
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
      animation: new Animated.Value(0),
      angle: (i * 2 * Math.PI) / BURST_PARTICLE_COUNT,
      // More varied distances: smaller particles can travel further
      distance: (40 + Math.random() * 60) * (1 + distanceVariation),
      color: ENHANCED_COLORS[Math.floor(Math.random() * ENHANCED_COLORS.length)],
      // More varied scales
      scale: 0.2 + Math.random() * 0.8,
      rotation: new Animated.Value(0),
      delay: Math.random() * 50,
      // More varied sizes
      size: 3 + (sizeVariation * 8),
    };
  });
};

const createButtonParticles = (): ButtonParticle[] => {
  return Array.from({ length: BUTTON_PARTICLE_COUNT }, () => ({
    animation: new Animated.Value(0),
    size: 3 + Math.random() * 3,
    color: ENHANCED_COLORS[Math.floor(Math.random() * ENHANCED_COLORS.length)],
    offsetX: -20 + Math.random() * 40,
    offsetY: -20 + Math.random() * 40,
    duration: 600 + Math.random() * 400,
  }));
};

export function NewsQuestion({ newsItems, onAnswer }: NewsQuestionProps) {
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('latest');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastClickedPosition, setLastClickedPosition] = useState<ButtonPosition>({ x: 0, y: 0 });

  // Remove height animations, keep other animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
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
        Math.min(180, headerHeight.value - delta) // Maximum header height
      );
      lastScrollY.value = event.contentOffset.y;
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      paddingTop: interpolate(
        headerHeight.value,
        [70, 180],
        [12, 64],
        Extrapolate.CLAMP
      ),
      paddingBottom: 0,
    };
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    const fontSize = interpolate(
      headerHeight.value,
      [70, 180],
      [32, 42],
      Extrapolate.CLAMP
    );
    
    const marginBottom = interpolate(
      headerHeight.value,
      [70, 180],
      [16, 40],
      Extrapolate.CLAMP
    );

    const marginTop = interpolate(
      headerHeight.value,
      [70, 180],
      [8, 24],
      Extrapolate.CLAMP
    );

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
        LayoutAnimation.Properties.opacity
      )
    );

    setExpandedIndex(index);
    // Reset states when switching articles
    setSelectedAnswer(null);
    setIsCorrect(null);
    setLastClickedPosition({ x: 0, y: 0 });
  };

  const handleAnswer = async (selectedFake: boolean, buttonPosition: ButtonPosition) => {
    const correct = selectedFake === newsItems[expandedIndex].isFake;
    
    if (correct) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setScore(prev => prev + 100);
      setStreak(prev => prev + 1);
      setLastClickedPosition(buttonPosition);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setStreak(0);
    }

    setSelectedAnswer(selectedFake);
    setIsCorrect(correct);
    onAnswer(correct);

    // Store the answer in the newsItem
    newsItems[expandedIndex].answered = {
      wasCorrect: correct,
    };
  };

  const handleNextArticle = () => {
    if (expandedIndex < newsItems.length - 1) {
      // Configure the animation for expanding
      LayoutAnimation.configureNext(
        LayoutAnimation.create(
          200,
          LayoutAnimation.Types.easeInEaseOut,
          LayoutAnimation.Properties.opacity
        )
      );

      // Move to next article and expand it
      const nextIndex = expandedIndex + 1;
      setExpandedIndex(nextIndex);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setLastClickedPosition({ x: 0, y: 0 });

      // Scroll to the next article
      const yOffset = nextIndex * 200; // Approximate height of collapsed articles
      scrollY.value = yOffset;
    }
  };

  // Simplified button animations
  const getButtonStyle = (isFake: boolean, isCorrect: boolean | null, selectedAnswer: boolean | null) => ({
    backgroundColor: selectedAnswer !== null 
      ? (isCorrect ? "#F8F8F8" : "#000000")
      : "transparent",
    borderColor: selectedAnswer !== null 
      ? (isCorrect ? "#000000" : "transparent")
      : "#000000",
    opacity: selectedAnswer !== null && !isCorrect ? 0.5 : 1,
    transform: selectedAnswer !== null && isCorrect ? [{ scale: 1.02 }] : [],
  });

  const getTextStyle = (isCorrect: boolean | null, selectedAnswer: boolean | null) => ({
    color: selectedAnswer !== null 
      ? (isCorrect ? "#000000" : "#FFFFFF")
      : "#000000",
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
        name={isCorrect ? "check-circle" : "x-circle"}
        size={32}
        color={isCorrect ? "#03A678" : "#E15554"}
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
                    source={require("../../assets/icon.png")}
                    style={styles.previewIcon}
                  />
                </View>
                <View style={styles.previewTextContainer}>
                  <Text numberOfLines={2} style={styles.previewHeadline}>
                    {item.headline}
                  </Text>
                  <View style={styles.previewMetaContainer}>
                    <Text style={styles.previewPublisher}>AI BREAKING NEWS</Text>
                    <Text style={styles.previewTime}>2h ago</Text>
                  </View>
                </View>
                <View style={styles.dotContainer}>
                  <View style={[
                    styles.statusIcon,
                    !item.answered && styles.statusIconEmpty,
                    item.answered && !item.answered.wasCorrect && styles.statusIconIncorrect
                  ]}>
                    {item.answered ? (
                      <Feather
                        name={item.answered.wasCorrect ? "check" : "x"}
                        size={10}
                        color="#FFFFFF"
                      />
                    ) : null}
                  </View>
                </View>
              </View>
            ) : (
              // Expanded mode
              <View>
                <Text style={styles.headline}>{item.headline}</Text>
                <View style={styles.expandedPublisherContainer}>
                  <Image
                    source={require("../../assets/icon.png")}
                    style={styles.expandedPublisherIcon}
                  />
                  <Text style={styles.expandedPublisher}>AI BREAKING NEWS</Text>
                </View>
                <Text style={styles.article}>{item.article}</Text>

                <View style={styles.buttonContainer}>
                  <View style={styles.buttonWrapper}>
                    <Animated.View
                      style={[
                        styles.button,
                        getButtonStyle(item.isFake, isCorrect, selectedAnswer),
                      ]}
                    >
                      <Pressable
                        style={styles.pressable}
                        onPress={(event) => {
                          const { pageX, pageY } = event.nativeEvent;
                          handleAnswer(true, { x: pageX, y: pageY });
                        }}
                        disabled={selectedAnswer !== null}
                      >
                        <Animated.Text
                          style={[styles.buttonText, getTextStyle(isCorrect, selectedAnswer)]}
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
                        getButtonStyle(!item.isFake, isCorrect, selectedAnswer),
                      ]}
                    >
                      <Pressable
                        style={styles.pressable}
                        onPress={(event) => {
                          const { pageX, pageY } = event.nativeEvent;
                          handleAnswer(false, { x: pageX, y: pageY });
                        }}
                        disabled={selectedAnswer !== null}
                      >
                        <Animated.Text
                          style={[styles.buttonText, getTextStyle(isCorrect, selectedAnswer)]}
                        >
                          REAL
                        </Animated.Text>
                      </Pressable>
                    </Animated.View>
                    {selectedAnswer === false && renderIcon(!item.isFake)}
                  </View>
                </View>

                {selectedAnswer !== null && expandedIndex < newsItems.length - 1 && (
                  <View style={styles.nextButtonContainer}>
                    <Pressable
                      style={styles.nextButton}
                      onPress={handleNextArticle}
                    >
                      <Text style={styles.nextButtonText}>NEXT ARTICLE</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            )}
          </Pressable>
        </View>
      </View>
    );
  }; 
  
  const getFilteredNewsItems = () => {
    if (activeTab === 'to-read') {
      return newsItems.filter(item => !item.answered);
    }
    return newsItems;
  };

  const renderTabs = () => (
    <View style={styles.headerContent}>
      <View style={styles.tabContainer}>
        <Pressable 
          style={[styles.tab]} 
          onPress={() => setActiveTab('latest')}
        >
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'latest' && styles.tabTextActive
            ]}
          >
            Latest
          </Text>
          {activeTab === 'latest' && <View style={styles.activeIndicator} />}
        </Pressable>
        <Pressable 
          style={[styles.tab]} 
          onPress={() => setActiveTab('to-read')}
        >
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'to-read' && styles.tabTextActive
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
          <Text style={styles.scoreText}>{score}</Text>
        </View>
        <View style={styles.scoreItem}>
          <MaterialCommunityIcons name="fire" size={20} color="#FF4500" />
          <Text style={styles.scoreText}>×{streak}</Text>
        </View>
      </View>
    </View>
  );

  const renderCelebrationEffect = () => {
    // Create new particles for each render to ensure fresh animation
    const [particles] = useState(() => createParticles());

    useEffect(() => {
      if (isCorrect && lastClickedPosition.x !== 0) {
        particles.forEach((particle) => {
          particle.animation.setValue(0);
          particle.rotation.setValue(0);
          
          Animated.parallel([
            Animated.timing(particle.animation, {
              toValue: 1,
              duration: 600,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
              useNativeDriver: true,
            }),
            Animated.timing(particle.rotation, {
              toValue: 2,
              duration: 600,
              easing: Easing.bezier(0.33, 0, 0.67, 1),
              useNativeDriver: true,
            }),
          ]).start();
        });
      }
    }, [isCorrect, lastClickedPosition]);

    if (!isCorrect || lastClickedPosition.x === 0) return null;

    return (
      <View style={[styles.celebrationContainer, {
        left: lastClickedPosition.x - 100, // Larger container
        top: lastClickedPosition.y - 100,
        right: undefined,
        bottom: undefined,
        width: 200, // Larger container
        height: 200,
      }]}>
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
                  width: particle.size,
                  height: particle.size,
                  borderRadius: particle.size / 2,
                  backgroundColor: particle.color,
                  transform: [
                    { translateX },
                    { translateY },
                    { scale },
                    { rotate },
                  ],
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
        style={[
          styles.headerBlur,
          headerAnimatedStyle
        ]}
      >
        <SafeAreaView style={styles.headerContent}>
          <ReAnimated.Text style={[styles.publicationTitle, titleAnimatedStyle]}>
            FAKE NEWS
          </ReAnimated.Text>
          <View style={styles.headerContentInner}>
            <View style={styles.tabContainer}>
              <Pressable 
                style={[styles.tab]} 
                onPress={() => setActiveTab('latest')}
              >
                <Text 
                  style={[
                    styles.tabText, 
                    activeTab === 'latest' && styles.tabTextActive
                  ]}
                >
                  Latest
                </Text>
                {activeTab === 'latest' && <View style={styles.activeIndicator} />}
              </Pressable>
              <Pressable 
                style={[styles.tab]} 
                onPress={() => setActiveTab('to-read')}
              >
                <Text 
                  style={[
                    styles.tabText, 
                    activeTab === 'to-read' && styles.tabTextActive
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
                <Text style={styles.scoreText}>{score}</Text>
              </View>
              <View style={styles.scoreItem}>
                <MaterialCommunityIcons name="fire" size={20} color="#FF4500" />
                <Text style={styles.scoreText}>×{streak}</Text>
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
            <Text style={styles.date}>{format(new Date(), "MMMM d, yyyy")}</Text>
            <View style={styles.articlesList}>
              {getFilteredNewsItems().map((item, index) => renderArticle(item, index))}
            </View>
            <View style={styles.bottomSpacer} />
          </ReAnimated.ScrollView>
          <LinearGradient
            colors={["rgba(255,255,255,0)", "rgba(255,255,255,1)"]}
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
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  headerBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 48 : 32,
  },
  headerContentInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: 140,
  },
  date: {
    color: "#000000",
    fontSize: 12,
    marginTop: 24,
    marginBottom: 16,
    fontFamily: "System",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  articleContainer: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  articleContainerExpanded: {
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  headline: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1A1A1A",
    marginBottom: 16,
    lineHeight: 32,
    letterSpacing: 0.2,
    paddingHorizontal: 20,
  },
  publisherIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  publisher: {
    fontSize: 14,
    color: "#6B6B6B",
    fontFamily: "System",
    letterSpacing: 0.2,
    fontWeight: "600",
  },
  article: {
    fontSize: 17,
    lineHeight: 26,
    color: "#333333",
    letterSpacing: 0.3,
    marginTop: 16,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 32,
    paddingHorizontal: 20,
  },
  buttonWrapper: {
    flex: 1,
    position: "relative",
  },
  button: {
    borderRadius: 14,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    transition: 'all 0.3s ease',
  },
  pressable: {
    width: "100%",
    padding: 16,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontFamily: Platform.OS === 'ios' ? "SF Pro Text" : "System",
  },
  iconContainer: {
    position: "absolute",
    top: -16,
    right: -16,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  previewList: {
    gap: 12,
  },
  previewItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  previewContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 20,
  },
  previewIconContainer: {
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.03)',
  },
  previewIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  previewTextContainer: {
    flex: 1,
    gap: 4,
  },
  previewHeadline: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A1A",
    lineHeight: 24,
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'ios' ? "SF Pro Display" : "System",
  },
  previewMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewPublisher: {
    fontSize: 12,
    color: "#666666",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  previewTime: {
    fontSize: 12,
    color: "#999999",
    fontWeight: "500",
  },
  articlesList: {},
  articleWrapper: {
    elevation: 1,
  },
  expandedContent: {
    padding: 24,
    paddingTop: 16,
  },
  expandedPublisherContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 8,
  },
  expandedPublisherIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    marginRight: 12,
  },
  expandedPublisher: {
    fontSize: 13,
    color: "#454545",
    letterSpacing: 1,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  dotContainer: {
    paddingLeft: 12,
    justifyContent: "center",
  },
  statusIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#242424",
    alignItems: "center",
    justifyContent: "center",
  },
  statusIconEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: "#242424",
  },
  statusIconIncorrect: {
    backgroundColor: "#666666",
  },
  emptyDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#242424",
  },
  divider: {
    height: 1,
    backgroundColor: "#000000",
    opacity: 0.08,
  },
  publicationTitle: {
    fontFamily: Platform.OS === 'ios' ? "SF Pro Display" : "System",
    fontWeight: "900",
    textAlign: "center",
    color: "#000000",
    textTransform: "uppercase",
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.08)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    fontSize: 32,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 24,
  },
  tab: {
    position: "relative",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666666",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  tabTextActive: {
    color: "#000000",
  },
  activeIndicator: {
    position: "absolute",
    bottom: -16,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#000000",
    borderRadius: 1,
  },
  scrollContainer: {
    flex: 1,
    position: "relative",
  },
  bottomSpacer: {
    height: 100,
  },
  fadeGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 1,
  },
  scoreContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scoreText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  celebrationContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    zIndex: 99,
  },
  particle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    backgroundColor: "transparent",
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 16,
    paddingBottom: 12,
  },
  buttonParticlesContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    zIndex: 99,
  },
  buttonParticle: {
    position: 'absolute',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  nextButtonContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  nextButton: {
    backgroundColor: '#000000',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontFamily: Platform.OS === 'ios' ? "SF Pro Text" : "System",
  },
});
