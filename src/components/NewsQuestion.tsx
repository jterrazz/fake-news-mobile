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

export function NewsQuestion({ newsItems, onAnswer }: NewsQuestionProps) {
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('latest');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

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
    if (selectedAnswer !== null) return;

    // Configure the animation
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        200, // duration
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.opacity
      )
    );

    setExpandedIndex(index);
  };

  const handleAnswer = async (selectedFake: boolean) => {
    const correct = selectedFake === newsItems[expandedIndex].isFake;
    
    if (correct) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setScore(prev => prev + 100);
      setStreak(prev => prev + 1);
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

    // Single animation sequence for feedback
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        ...TIMING_CONFIG,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        ...TIMING_CONFIG,
      }),
      Animated.sequence([
        Animated.delay(100),
        Animated.timing(iconAnim, {
          toValue: 1,
          ...TIMING_CONFIG,
        }),
      ]),
    ]).start();

    // Move to next question
    setTimeout(() => {
      if (expandedIndex < newsItems.length - 1) {
        handleArticleSelect(expandedIndex + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
        // Reset animations
        fadeAnim.setValue(0);
        buttonAnim.setValue(0);
        iconAnim.setValue(0);
      }
    }, 1500);
  };

  // Simplified button animations
  const getButtonStyle = (isFake: boolean, isCorrect: boolean | null) => ({
    backgroundColor: buttonAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["transparent", isCorrect ? "#FFFFFF" : "#000000"],
    }),
    borderColor: "#000000",
  });

  const getTextStyle = (isCorrect: boolean | null) => ({
    color: buttonAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["#000000", isCorrect ? "#000000" : "#FFFFFF"],
    }),
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
            disabled={selectedAnswer !== null && isExpanded}
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
                  <View
                    style={[
                      styles.dot,
                      item.answered &&
                        (item.answered.wasCorrect
                          ? styles.correctDot
                          : styles.incorrectDot),
                    ]}
                  />
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
                        getButtonStyle(item.isFake, isCorrect),
                      ]}
                    >
                      <Pressable
                        style={styles.pressable}
                        onPress={() => handleAnswer(true)}
                        disabled={selectedAnswer !== null}
                      >
                        <Animated.Text
                          style={[styles.buttonText, getTextStyle(isCorrect)]}
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
                        getButtonStyle(!item.isFake, isCorrect),
                      ]}
                    >
                      <Pressable
                        style={styles.pressable}
                        onPress={() => handleAnswer(false)}
                        disabled={selectedAnswer !== null}
                      >
                        <Animated.Text
                          style={[styles.buttonText, getTextStyle(isCorrect)]}
                        >
                          REAL
                        </Animated.Text>
                      </Pressable>
                    </Animated.View>
                    {selectedAnswer === false && renderIcon(!item.isFake)}
                  </View>
                </View>

                {selectedAnswer !== null && (
                  <Animated.View
                    style={[
                      styles.feedbackContainer,
                      {
                        opacity: fadeAnim,
                        transform: [{ scale: buttonAnim }],
                      },
                      isCorrect ? styles.correctFeedbackContainer : styles.incorrectFeedbackContainer,
                    ]}
                  >
                    <Text
                      style={[
                        styles.feedbackText,
                        isCorrect ? styles.correctFeedback : styles.incorrectFeedback,
                      ]}
                    >
                      {isCorrect
                        ? "Excellent ! Vous avez démasqué " +
                          (item.isFake
                            ? "cette fausse information !"
                            : "cette information véridique !")
                        : "Oups ! En réalité c'était " +
                          (item.isFake
                            ? "une fausse information. Restez vigilant !"
                            : "une information véridique. Continuez d'aiguiser votre esprit critique !")}
                    </Text>
                  </Animated.View>
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

  const renderConfetti = () => {
    const confettiAnims = [...Array(20)].map(() => ({
      y: new Animated.Value(0),
      x: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }));

    useEffect(() => {
      if (isCorrect) {
        confettiAnims.forEach((anim, i) => {
          Animated.parallel([
            Animated.timing(anim.y, {
              toValue: 400,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(anim.x, {
              toValue: (i % 2 === 0 ? 1 : -1) * (Math.random() * 100),
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(anim.rotate, {
              toValue: Math.random() * 360,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(anim.opacity, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]).start();
        });
      }
    }, [isCorrect]);

    if (!isCorrect) return null;

    return (
      <View style={styles.confettiContainer}>
        {confettiAnims.map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.confetti,
              {
                backgroundColor: ['#FFD700', '#FF4500', '#00FF00', '#FF1493'][i % 4],
                transform: [
                  { translateY: anim.y },
                  { translateX: anim.x },
                  { rotate: anim.rotate.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  })},
                ],
                opacity: anim.opacity,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <BlurView
        intensity={80}
        tint="light"
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
        {renderConfetti()}
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
    backgroundColor: '#FFFFFF',
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
  feedbackContainer: {
    marginTop: 24,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  correctFeedbackContainer: {
    backgroundColor: '#E7F7F2',
    borderColor: '#03A678',
  },
  incorrectFeedbackContainer: {
    backgroundColor: '#FFEFEF',
    borderColor: '#E15554',
  },
  feedbackText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
    lineHeight: 24,
  },
  correctFeedback: {
    color: "#03A678",
  },
  incorrectFeedback: {
    color: "#E15554",
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
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#242424",
    opacity: 0.3,
  },
  correctDot: {
    backgroundColor: "#03A678",
    opacity: 1,
  },
  incorrectDot: {
    backgroundColor: "#E15554",
    opacity: 1,
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
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
    pointerEvents: 'none',
  },
  confetti: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 8,
    height: 8,
    borderRadius: 4,
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
});
