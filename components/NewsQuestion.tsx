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
} from "react-native";
import { format } from "date-fns";
import { Feather } from "@expo/vector-icons";

interface NewsItem {
  id: string;
  headline: string;
  article: string;
  isFake: boolean;
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
];

interface NewsQuestionProps {
  newsItems: NewsItem[];
  onAnswer: (isCorrect: boolean) => void;
}

export function NewsQuestion({ newsItems, onAnswer }: NewsQuestionProps) {
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const buttonAnimFake = useRef(new Animated.Value(0)).current;
  const buttonAnimReal = useRef(new Animated.Value(0)).current;
  const iconScaleAnim = useRef(new Animated.Value(0)).current;

  // Create animation values for each article
  const articleAnimations = useRef(
    newsItems.map((_, index) => ({
      height: new Animated.Value(index === 0 ? 400 : 80), // First article expanded
      opacity: new Animated.Value(1), // All articles visible initially
      scale: new Animated.Value(1),
    }))
  ).current;

  // No need for initial animation since we set initial values correctly
  useEffect(() => {
    // Optional: Add any initial setup here
  }, []);

  const handleAnswer = (selectedFake: boolean) => {
    const correct = selectedFake === newsItems[expandedIndex].isFake;
    setSelectedAnswer(selectedFake);
    setIsCorrect(correct);
    onAnswer(correct);

    // Faster animations for feedback
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200, // Faster fade
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 200,
        friction: 15,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnimFake, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(buttonAnimReal, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.delay(100), // Shorter delay
        Animated.spring(iconScaleAnim, {
          toValue: 1,
          tension: 200,
          friction: 15,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Shorter timeout for next question
    setTimeout(() => {
      if (expandedIndex < newsItems.length - 1) {
        setExpandedIndex(expandedIndex + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
        // Reset animations
        fadeAnim.setValue(0);
        scaleAnim.setValue(0.95);
        buttonAnimFake.setValue(0);
        buttonAnimReal.setValue(0);
        iconScaleAnim.setValue(0);
      }
    }, 1500); // Shorter delay before next question
  };

  const handleArticleSelect = (index: number) => {
    if (selectedAnswer !== null) return;

    const currentArticle = articleAnimations[expandedIndex];
    const newArticle = articleAnimations[index];

    Animated.parallel([
      // Close current article
      Animated.spring(currentArticle.scale, {
        toValue: 0.98,
        tension: 200, // Increased tension
        friction: 15,
        useNativeDriver: true,
      }),
      Animated.timing(currentArticle.height, {
        toValue: 80,
        duration: 200, // Faster duration
        useNativeDriver: false,
      }),
      // Open new article
      Animated.spring(newArticle.scale, {
        toValue: 1,
        tension: 200, // Increased tension
        friction: 15,
        useNativeDriver: true,
      }),
      Animated.timing(newArticle.height, {
        toValue: 400,
        duration: 200, // Faster duration
        useNativeDriver: false,
      }),
    ]).start();

    setExpandedIndex(index);
  };

  // Interpolate colors for Fake button
  const fakeButtonBackground = buttonAnimFake.interpolate({
    inputRange: [0, 1],
    outputRange: [
      "transparent",
      newsItems[expandedIndex].isFake ? "#FFFFFF" : "#000000",
    ],
  });
  const fakeButtonBorder = buttonAnimFake.interpolate({
    inputRange: [0, 1],
    outputRange: [
      "#000000",
      newsItems[expandedIndex].isFake ? "#FFFFFF" : "#000000",
    ],
  });
  const fakeTextColor = buttonAnimFake.interpolate({
    inputRange: [0, 1],
    outputRange: [
      "#000000",
      newsItems[expandedIndex].isFake ? "#000000" : "#FFFFFF",
    ],
  });

  // Interpolate colors for Real button
  const realButtonBackground = buttonAnimReal.interpolate({
    inputRange: [0, 1],
    outputRange: [
      "transparent",
      !newsItems[expandedIndex].isFake ? "#FFFFFF" : "#000000",
    ],
  });
  const realButtonBorder = buttonAnimReal.interpolate({
    inputRange: [0, 1],
    outputRange: [
      "#000000",
      !newsItems[expandedIndex].isFake ? "#FFFFFF" : "#000000",
    ],
  });
  const realTextColor = buttonAnimReal.interpolate({
    inputRange: [0, 1],
    outputRange: [
      "#000000",
      !newsItems[expandedIndex].isFake ? "#000000" : "#FFFFFF",
    ],
  });

  const getFeedbackMessage = () => {
    if (isCorrect === null) return "";
    if (isCorrect)
      return (
        "Bravo ! C'était effectivement " +
        (newsItems[expandedIndex].isFake
          ? "une fake news"
          : "une vraie information")
      );
    return (
      "Dommage ! C'était " +
      (newsItems[expandedIndex].isFake
        ? "une fake news"
        : "une vraie information")
    );
  };

  const renderIcon = (isCorrect: boolean) => (
    <Animated.View
      style={[
        styles.iconContainer,
        {
          transform: [{ scale: iconScaleAnim }],
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
    const animations = articleAnimations[index];

    const animatedStyle = {
      transform: [{ scale: animations.scale }],
    };

    const animatedHeight = {
      height: animations.height,
    };

    return (
      <Animated.View
        key={item.id}
        style={[
          styles.articleWrapper,
          animatedHeight,
          {
            marginBottom: 12,
            transform: [{ translateY: 0 }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.articleContent,
            animatedStyle,
            { transform: [{ translateY: 0 }] },
          ]}
        >
          <Pressable
            style={[
              styles.articleContainer,
              isExpanded && styles.articleContainerExpanded,
            ]}
            onPress={() => handleArticleSelect(index)}
            disabled={selectedAnswer !== null}
          >
            {!isExpanded ? (
              // Preview mode
              <View style={styles.previewContent}>
                <Image
                  source={require("../assets/icon.png")}
                  style={styles.previewIcon}
                />
                <View style={styles.previewTextContainer}>
                  <Text numberOfLines={2} style={styles.previewHeadline}>
                    {item.headline}
                  </Text>
                  <Text style={styles.previewPublisher}>AI BREAKING NEWS</Text>
                </View>
                <View style={styles.dotContainer}>
                  <View style={styles.dot} />
                </View>
              </View>
            ) : (
              // Expanded mode
              <View>
                <Text style={styles.headline}>{item.headline}</Text>
                <View style={styles.expandedPublisherContainer}>
                  <Image
                    source={require("../assets/icon.png")}
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
                        {
                          backgroundColor: fakeButtonBackground,
                          borderColor: fakeButtonBorder,
                        },
                      ]}
                    >
                      <Pressable
                        style={styles.pressable}
                        onPress={() => handleAnswer(true)}
                        disabled={selectedAnswer !== null}
                      >
                        <Animated.Text
                          style={[styles.buttonText, { color: fakeTextColor }]}
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
                        {
                          backgroundColor: realButtonBackground,
                          borderColor: realButtonBorder,
                        },
                      ]}
                    >
                      <Pressable
                        style={styles.pressable}
                        onPress={() => handleAnswer(false)}
                        disabled={selectedAnswer !== null}
                      >
                        <Animated.Text
                          style={[styles.buttonText, { color: realTextColor }]}
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
                        transform: [{ scale: scaleAnim }],
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.feedbackText,
                        isCorrect
                          ? styles.correctFeedback
                          : styles.incorrectFeedback,
                      ]}
                    >
                      {getFeedbackMessage()}
                    </Text>
                  </Animated.View>
                )}
              </View>
            )}
          </Pressable>
        </Animated.View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        scrollEventThrottle={16} // Optimize scroll performance
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.date}>{format(new Date(), "MMMM d, yyyy")}</Text>
        <View style={styles.articlesList}>
          {newsItems.map((item, index) => renderArticle(item, index))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  date: {
    color: "#6B6B6B",
    fontSize: 14,
    marginBottom: 24,
    fontFamily: "System",
    letterSpacing: 0.5,
  },
  paper: {},
  context: {
    fontSize: 14,
    color: "#6B6B6B",
    marginBottom: 16,
    fontFamily: "System",
    letterSpacing: 0.3,
  },
  articleContainer: {
    flex: 1,
  },
  articleContainerExpanded: {},
  headline: {
    fontSize: 26,
    fontWeight: "600",
    color: "#242424",
    marginBottom: 12,
    lineHeight: 34,
    letterSpacing: 0.2,
    fontFamily: "System",
  },
  publisherContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
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
    lineHeight: 24,
    color: "#242424",
    fontFamily: "System",
    letterSpacing: 0.2,
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
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  pressable: {
    width: "100%",
    padding: 16,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 14,
    letterSpacing: 1,
  },
  feedbackContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F8F8F8",
    borderWidth: 1,
    borderColor: "#E6E6E6",
  },
  feedbackText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
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
    marginTop: 20,
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
    gap: 12,
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
    fontSize: 16,
    fontWeight: "600",
    color: "#242424",
    lineHeight: 22,
  },
  previewPublisher: {
    fontSize: 12,
    color: "#6B6B6B",
    marginTop: 4,
  },
  articlesList: {
    gap: 12,
  },
  articleWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
    backfaceVisibility: "hidden", // Improve performance
  },
  articleContent: {
    flex: 1,
    backfaceVisibility: "hidden", // Improve performance
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
    fontSize: 14,
    color: "#6B6B6B",
    fontFamily: "System",
    letterSpacing: 0.2,
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
});
