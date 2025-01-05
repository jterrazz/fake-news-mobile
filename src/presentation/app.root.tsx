import React, { useState } from 'react';
import { Platform, StatusBar, UIManager, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

import { TabBar } from './components/tab-bar.jsx';
import { ContainerProvider } from './providers/container-provider.jsx';
import { QueryClientProvider } from './providers/query-client-provider.jsx';
import { NewsFeedScreen } from './screens/news-feed-screen.js';
import { SettingsScreen } from './screens/settings-screen.js';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

function HomeScreen() {
    const [score, setScore] = useState(0);

    const handleAnswer = (isCorrect: boolean) => {
        if (isCorrect) setScore(score + 1);
    };

    return (
        <View style={{ backgroundColor: '#FFFFFF', flex: 1 }}>
            <NewsFeedScreen onAnswer={handleAnswer} />
        </View>
    );
}

// Create the Bottom Tab Navigator
const BottomTab = createBottomTabNavigator();

function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ContainerProvider>
            <QueryClientProvider>{children}</QueryClientProvider>
        </ContainerProvider>
    );
}

export const AppRoot = () => {
    return (
        <Providers>
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
        </Providers>
    );
};
