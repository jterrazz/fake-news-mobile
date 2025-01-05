import React from 'react';
import { Platform, StatusBar, UIManager } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

import { ContainerProvider } from './providers/container-provider.jsx';
import { QueryClientProvider } from './providers/query-client-provider.jsx';
import { NewsFeedScreen } from './screens/news-feed-screen.js';
import { SettingsScreen } from './screens/settings-screen.js';

import { BottomTabBar } from '@/presentation/components/organisms/navigation/bottom-tab-bar';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ContainerProvider>
            <QueryClientProvider>{children}</QueryClientProvider>
        </ContainerProvider>
    );
}

export const AppRoot = () => {
    const BottomTab = createBottomTabNavigator();

    return (
        <Providers>
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
            <NavigationContainer>
                <BottomTab.Navigator
                    tabBar={BottomTabBar}
                    screenOptions={{
                        headerShown: false,
                    }}
                >
                    <BottomTab.Screen name="Home" component={NewsFeedScreen} />
                    <BottomTab.Screen name="Settings" component={SettingsScreen} />
                </BottomTab.Navigator>
            </NavigationContainer>
        </Providers>
    );
};
