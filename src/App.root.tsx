import React, { useState } from 'react';
import { StatusBar, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

import { NewsQuestion, SAMPLE_NEWS_ITEMS } from './components/news-question.js';
import { SettingsScreen } from './components/settings.js';
import { TabBar } from './components/tab-bar.js';

function HomeScreen() {
    const [score, setScore] = useState(0);

    const handleAnswer = (isCorrect) => {
        if (isCorrect) setScore(score + 1);
    };

    return (
        <View style={{ backgroundColor: '#FFFFFF', flex: 1 }}>
            <NewsQuestion newsItems={SAMPLE_NEWS_ITEMS} onAnswer={handleAnswer} />
        </View>
    );
}

// Create the Bottom Tab Navigator
const BottomTab = createBottomTabNavigator();

export const AppRoot = () => {
    return (
        <>
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
            <NavigationContainer>
                <BottomTab.Navigator
                    tabBar={TabBar}
                    screenOptions={{
                        headerShown: false,
                    }}
                >
                    <BottomTab.Screen name="Home" component={HomeScreen} />
                    <BottomTab.Screen name="Settings" component={SettingsScreen} />
                </BottomTab.Navigator>
            </NavigationContainer>
        </>
    );
};
