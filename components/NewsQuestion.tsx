import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  SafeAreaView,
  Image,
} from "react-native";
import { format } from "date-fns";
import { Feather } from "@expo/vector-icons";

interface NewsItem {
  real_context: string;
  headline: string;
  article: string;
  isFake: boolean;
}

interface NewsQuestionProps {
  newsItem: NewsItem;
  onAnswer: (isCorrect: boolean) => void;
}

export function NewsQuestion({ newsItem, onAnswer }: NewsQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const buttonAnimFake = useRef(new Animated.Value(0)).current;
  const buttonAnimReal = useRef(new Animated.Value(0)).current;
  const iconScaleAnim = useRef(new Animated.Value(0)).current;

  const handleAnswer = (selectedFake: boolean) => {
    const correct = selectedFake === newsItem.isFake;
    setSelectedAnswer(selectedFake);
    setIsCorrect(correct);
    onAnswer(correct);

    // Trigger animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnimFake, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.timing(buttonAnimReal, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.delay(200), // Wait for button color change
        Animated.spring(iconScaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  // Interpolate colors for Fake button
  const fakeButtonBackground = buttonAnimFake.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", newsItem.isFake ? "#44FF44" : "#FF4444"],
  });
  const fakeButtonBorder = buttonAnimFake.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ffffff", newsItem.isFake ? "#44FF44" : "#FF4444"],
  });
  const fakeTextColor = buttonAnimFake.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ffffff", "#000000"],
  });

  // Interpolate colors for Real button
  const realButtonBackground = buttonAnimReal.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", !newsItem.isFake ? "#44FF44" : "#FF4444"],
  });
  const realButtonBorder = buttonAnimReal.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ffffff", !newsItem.isFake ? "#44FF44" : "#FF4444"],
  });
  const realTextColor = buttonAnimReal.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ffffff", "#000000"],
  });

  const getFeedbackMessage = () => {
    if (isCorrect === null) return "";
    if (isCorrect)
      return (
        "Bravo ! C'était effectivement " +
        (newsItem.isFake ? "une fake news" : "une vraie information")
      );
    return (
      "Dommage ! C'était " +
      (newsItem.isFake ? "une fake news" : "une vraie information")
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.date}>{format(new Date(), "MMMM d, yyyy")}</Text>

        <View style={styles.paper}>
          <Text style={styles.context}>{newsItem.real_context}</Text>
          <View style={styles.articleContainer}>
            <Text style={styles.headline}>{newsItem.headline}</Text>
            <View style={styles.publisherContainer}>
              <Image
                source={require("../assets/icon.png")}
                style={styles.publisherIcon}
              />
              <Text style={styles.publisher}>AI BREAKING NEWS</Text>
            </View>
            <Text style={styles.article}>{newsItem.article}</Text>
          </View>
        </View>

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
            {selectedAnswer === true && renderIcon(newsItem.isFake)}
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
            {selectedAnswer === false && renderIcon(!newsItem.isFake)}
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
                isCorrect ? styles.correctFeedback : styles.incorrectFeedback,
              ]}
            >
              {getFeedbackMessage()}
            </Text>
          </Animated.View>
        )}
      </View>
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
  paper: {
    marginBottom: 24,
  },
  context: {
    fontSize: 14,
    color: "#6B6B6B",
    marginBottom: 16,
    fontFamily: "System",
    letterSpacing: 0.3,
  },
  articleContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 24,
  },
  headline: {
    fontSize: 26,
    fontWeight: "600",
    color: "#242424",
    marginBottom: 20,
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
    marginTop: 8,
  },
  buttonWrapper: {
    flex: 1,
    position: "relative",
  },
  button: {
    borderRadius: 24,
    borderWidth: 2,
    overflow: "hidden",
  },
  pressable: {
    width: "100%",
    padding: 16,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 15,
    letterSpacing: 0.5,
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
});
