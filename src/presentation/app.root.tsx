import React from 'react';
import { Platform, StatusBar, UIManager } from 'react-native';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue/400Regular';
import { LibreBaskerville_400Regular } from '@expo-google-fonts/libre-baskerville/400Regular';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import '@/infrastructure/i18n/i18n.config';

import { ContainerProvider } from './providers/container-provider.jsx';
import { QueryClientProvider } from './providers/query-client-provider.jsx';
import { NewsFeedScreen } from './screens/news-feed-screen.js';
import { SettingsScreen } from './screens/settings-screen.js';

import { BottomTabBar } from '@/presentation/components/organisms/navigation/bottom-tab-bar';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ContainerProvider>
            <QueryClientProvider>{children}</QueryClientProvider>
        </ContainerProvider>
    );
}

export function AppRoot() {
    const [fontsLoaded] = useFonts({
        'BebasNeue-Regular': BebasNeue_400Regular,
        'Geist-Black': require('../../assets/fonts/Geist-Black.otf'),
        'Geist-Bold': require('../../assets/fonts/Geist-Bold.otf'),
        'Geist-ExtraBold': require('../../assets/fonts/Geist-ExtraBold.otf'),
        'Geist-ExtraLight': require('../../assets/fonts/Geist-ExtraLight.otf'),
        'Geist-Light': require('../../assets/fonts/Geist-Light.otf'),
        'Geist-Medium': require('../../assets/fonts/Geist-Medium.otf'),
        'Geist-Regular': require('../../assets/fonts/Geist-Regular.otf'),
        'Geist-SemiBold': require('../../assets/fonts/Geist-SemiBold.otf'),
        'Geist-Thin': require('../../assets/fonts/Geist-Thin.otf'),
        'Libre Baskerville': LibreBaskerville_400Regular,
    });

    React.useEffect(() => {
        if (fontsLoaded) {
            // Hide splash screen once fonts are loaded with a delay
            setTimeout(() => {
                // TODO: Fetch articles at app start.
                SplashScreen.hideAsync();
            }, 500);
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null; // Still loading fonts
    }

    return (
        <Providers>
            <StatusBar barStyle="dark-content" />
            <Navigation />
        </Providers>
    );
}

function Navigation() {
    const Tab = createBottomTabNavigator();

    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={{ headerShown: false }}
                tabBar={(props) => <BottomTabBar {...props} />}
            >
                <Tab.Screen name="feed" component={NewsFeedScreen} />
                <Tab.Screen name="settings" component={SettingsScreen} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}
