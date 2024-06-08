import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import React, { useRef } from 'react';
import { ScrollView, Text, View, StyleSheet, Animated } from 'react-native';
import { ProgressBar } from "./ProgressBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlackButton } from "./button";

const HEADER_MAX_HEIGHT = 80;
const HEADER_MIN_HEIGHT = 40;
const TITLE_MAX_SIZE = 32;
const TITLE_MIN_SIZE = 20;

function HomeScreen() {
    const scrollY = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();

    // Interpolate the title size and position based on scroll
    const titleFontSize = scrollY.interpolate({
        inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
        outputRange: [TITLE_MAX_SIZE, TITLE_MIN_SIZE],
        extrapolate: 'clamp',
    });

    const titleOpacity = scrollY.interpolate({
        inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
        outputRange: [1, 0.6],
        extrapolate: 'clamp',
    });

    return (
        <View style={{ flex: 1, paddingTop: insets.top }}>
            <Animated.ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 8 }}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >
                {/* Animated Title */}
                <Animated.View style={[
                    styles.titleContainer,
                    {
                        opacity: titleOpacity,
                    }
                ]}>
                    <Animated.Text style={[styles.pageTitle, { fontSize: titleFontSize }]}>
                        Now
                    </Animated.Text>
                </Animated.View>

                <BlackButton title="Motivation" onPress={() => console.log('Add Task')} />
                <Text style={styles.sectionTitle}>My XP</Text>
                <View style={styles.progressContainer}>
                    <Text style={styles.progressLabel}>Sport - Level 4</Text>
                    <ProgressBar progress={70} />
                </View>
                <View style={styles.progressContainer}>
                    <Text style={styles.progressLabel}>Sport - Level 4</Text>
                    <ProgressBar progress={70} />
                </View>
                <Text style={styles.sectionTitle}>Daily Routine</Text>
                <Text>8am: Running</Text>
                <Text>8:30am: Gym</Text>
                <Text>6pm: Write one article</Text>
                <Text>8pm: Code own project</Text>

                <BlackButton title="Add a recurring event" onPress={() => console.log('Add Task')} />

                <Text style={styles.sectionTitle}>My Tasks</Text>
                <Text>Prepare sport schedule</Text>
                <Text>Prepare sport schedule</Text>
                <BlackButton title="New Task" onPress={() => console.log('Add Task')} />
            </Animated.ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        paddingHorizontal: 16,
        alignItems: 'center',
        height: HEADER_MAX_HEIGHT,
    },
    pageTitle: {
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    progressLabel: {
        marginRight: 8,
    },
});

function SettingsScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Settings Screen</Text>
        </View>
    );
}

function ProfileScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Profile Screen</Text>
        </View>
    );
}

// Create the Bottom Tab Navigator
const Tab = createBottomTabNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={{
                    tabBarActiveTintColor: '#7781e8',
                    tabBarInactiveTintColor: '#e0e0e0',
                    headerShown: false,
                }}
            >
                <Tab.Screen name="Now" component={HomeScreen} />
                <Tab.Screen name="Goals" component={SettingsScreen} />
                <Tab.Screen name="Domains" component={ProfileScreen} />
                <Tab.Screen name="Community" component={ProfileScreen} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}