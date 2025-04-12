import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, TextStyle, View } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

interface AnimatedGradientTextProps {
    text: string;
    style?: TextStyle;
}

export function AnimatedGradientText({ text, style }: AnimatedGradientTextProps) {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(animatedValue, {
                duration: 8000,
                easing: Easing.linear,
                toValue: 1,
                useNativeDriver: true,
            }),
            {
                iterations: -1,
            },
        ).start();

        return () => {
            animatedValue.stopAnimation();
        };
    }, []);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -200],
    });

    // Create a perfectly looping gradient pattern with purple, orange, yellow
    const baseColors = [
        '#9D4EDD', // Deep purple
        '#B75CFF', // Bright purple
        '#FF9E5C', // Light orange
        '#FF8427', // Orange
        '#FFB800', // Golden yellow
        '#FFD449', // Bright yellow
        '#FF8427', // Orange
        '#FF9E5C', // Light orange
        '#9D4EDD', // Back to deep purple
    ] as const;

    // Duplicate the pattern to ensure smooth transition
    const gradientColors = [...baseColors, ...baseColors, baseColors[0]] as const;

    return (
        <View style={styles.container}>
            <MaskedView
                maskElement={
                    <View style={styles.maskContainer}>
                        <Animated.Text style={[styles.text, style]}>{text}</Animated.Text>
                    </View>
                }
            >
                <View style={styles.gradientContainer}>
                    <Animated.View
                        style={[styles.animatedGradient, { transform: [{ translateX }] }]}
                    >
                        <LinearGradient
                            colors={gradientColors}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={styles.gradient}
                        />
                    </Animated.View>
                </View>
            </MaskedView>
        </View>
    );
}

const styles = StyleSheet.create({
    animatedGradient: {
        width: 400,
    },
    container: {
        height: 20,
        overflow: 'hidden',
    },
    gradient: {
        height: 20,
        width: 400,
    },
    gradientContainer: {
        backgroundColor: '#9D4EDD', // Match the first color
        overflow: 'hidden',
    },
    maskContainer: {
        backgroundColor: 'transparent',
        flex: 1,
        justifyContent: 'center',
    },
    text: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
});
