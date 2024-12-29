import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useState } from "react";
import { View, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NewsQuestion, SAMPLE_NEWS_ITEMS } from "./components/NewsQuestion";
import { SettingsScreen } from "./components/Settings";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TabBar } from "./components/TabBar";

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
const BottomTab = createBottomTabNavigator();

export function App() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <NavigationContainer>
        <BottomTab.Navigator
          tabBar={TabBar}
          screenOptions={{
            headerShown: false,
          }}
        >
          <BottomTab.Screen name="Home" component={HomeScreen} />
          <BottomTab.Screen name="hhh" component={SettingsScreen} />
          <BottomTab.Screen name="Settings" component={SettingsScreen} />
        </BottomTab.Navigator>
      </NavigationContainer>
    </>
  );
}
