import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useState } from "react";
import { View, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NewsQuestion } from "./components/NewsQuestion";

// Sample news item (you can replace this with your data source)
const sampleNews = {
  real_context:
    "Des initiatives locales émergent pour protéger le patrimoine et promouvoir le tourisme.",
  headline:
    "Un village français impose une taxe selfie pour ses spots Instagram les plus populaires",
  article:
    "Fatigués de voir des influenceurs bloquer les rues pour prendre des selfies, les habitants de Saint-Miroir-sur-Lens ont instauré une taxe de 2 € par photo prise dans les lieux les plus prisés du village. Les fonds récoltés serviront à réparer les trottoirs endommagés par les trépieds. 'C'est un juste retour des choses,' explique le maire. Les visiteurs peuvent acheter un 'Pass Selfie Illimité' pour 10 €, offrant un accès prioritaire aux meilleurs angles. Un guide local ironise : 'Ils paient déjà pour des filtres, alors pourquoi pas pour le paysage ?'",
  isFake: true,
};

function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [score, setScore] = useState(0);

  const handleAnswer = (isCorrect) => {
    if (isCorrect) setScore(score + 1);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <NewsQuestion newsItem={sampleNews} onAnswer={handleAnswer} />
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
