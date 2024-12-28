import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useState } from "react";
import { View, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NewsQuestion, SAMPLE_NEWS_ITEMS } from "./components/NewsQuestion";

function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [score, setScore] = useState(0);

  const handleAnswer = (isCorrect) => {
    if (isCorrect) setScore(score + 1);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <NewsQuestion newsItems={SAMPLE_NEWS_ITEMS} onAnswer={handleAnswer} />
    </View>
  );
}

// Create the Bottom Tab Navigator
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: "#7781e8",
            tabBarInactiveTintColor: "#ffffff",
            headerShown: false,
            tabBarStyle: {
              backgroundColor: "#000",
              borderTopColor: "#333",
            },
          }}
        >
          <Tab.Screen name="Play" component={HomeScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}
