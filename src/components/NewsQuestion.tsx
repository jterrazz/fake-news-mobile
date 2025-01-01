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

export function NewsQuestion({ newsItems, onAnswer }: NewsQuestionProps) {
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

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
        [12, 24],
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
      [8, 16],
      Extrapolate.CLAMP
    );

    return {
      fontSize,
      marginBottom,
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
    
    // Add haptic feedback based on answer correctness
    if (correct) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
        {index > 0 && <View style={styles.divider} />}
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
              // Preview mode
              <View style={styles.previewContent}>
                <Image
                  source={require("../../assets/icon.png")}
                  style={styles.previewIcon}
                />
                <View style={styles.previewTextContainer}>
                  <Text numberOfLines={2} style={styles.previewHeadline}>
                    {item.headline}
                  </Text>
                  <Text style={styles.previewPublisher}>AI BREAKING NEWS</Text>
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
                          FAKE NEWS
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
                          REAL NEWS
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
  
  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <Pressable style={[styles.tab, styles.tabActive]}>
        <Text style={[styles.tabText, styles.tabTextActive]}>Latest</Text>
        <View style={styles.activeIndicator} />
      </Pressable>
      <Pressable style={styles.tab}>
        <Text style={styles.tabText}>New</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ReAnimated.View style={[styles.header, headerAnimatedStyle]}>
        <ReAnimated.Text style={[styles.publicationTitle, titleAnimatedStyle]}>
          FAKE NEWS
        </ReAnimated.Text>
        {renderTabs()}
      </ReAnimated.View>
      <View style={styles.scrollContainer}>
        <ReAnimated.ScrollView
          style={styles.container}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          bounces={false}
        >
          <Text style={styles.date}>{format(new Date(), "MMMM d, yyyy")}</Text>
          <View style={styles.articlesList}>
            {newsItems.map((item, index) => renderArticle(item, index))}
          </View>
          <View style={styles.bottomSpacer} />
        </ReAnimated.ScrollView>
        <LinearGradient
          colors={["rgba(255,255,255,0)", "rgba(255,255,255,1)"]}
          style={styles.fadeGradient}
          pointerEvents="none"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
    position: 'sticky',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  articleContainerExpanded: {
    paddingVertical: 24,
  },
  headline: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 12,
    lineHeight: 32,
    letterSpacing: 0.2,
    fontFamily: "System",
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
    fontSize: 16,
    lineHeight: 24,
    color: "#1A1A1A",
    fontFamily: "System",
    letterSpacing: 0.3,
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 24,
  },
  buttonWrapper: {
    flex: 1,
    position: "relative",
  },
  button: {
    borderRadius: 4,
    borderWidth: 1.5,
  },
  pressable: {
    width: "100%",
    padding: 16,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  feedbackContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 4,
    borderWidth: 1,
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
    paddingHorizontal: 8,
  },
  previewIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  previewTextContainer: {
    flex: 1,
  },
  previewHeadline: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000000",
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  previewPublisher: {
    fontSize: 11,
    color: "#666666",
    marginTop: 4,
    letterSpacing: 1,
    textTransform: "uppercase",
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
    marginBottom: 16,
  },
  expandedPublisherIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  expandedPublisher: {
    fontSize: 12,
    color: "#666666",
    fontFamily: "System",
    letterSpacing: 1,
    textTransform: "uppercase",
    fontWeight: "600",
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
    fontFamily: "System",
    fontWeight: "900",
    textAlign: "center",
    color: "#000000",
    textTransform: "uppercase",
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 32,
    justifyContent: 'center',
    transition: 'padding 0.2s ease-out',
    paddingBottom: 12,
  },
  tab: {
    position: "relative",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tabActive: {
    backgroundColor: "transparent",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  tabTextActive: {
    color: "#000000",
  },
  activeIndicator: {
    position: "absolute",
    bottom: -13,
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
    height: 100, // Adjust this value based on your navbar height
  },
  fadeGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100, // Adjust the height of the fade effect
    zIndex: 1,
  },
});
