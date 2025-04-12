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
                duration: 4000,
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

    // Create a perfectly looping gradient pattern with pastel colors
    const baseColors = [
        '#C7A0DD', // Soft lavender
        '#D4B0EA', // Light lavender
        '#E6C0A0', // Soft peach
        '#EED1B0', // Light peach
        '#F1DFA0', // Soft yellow
        '#E6C0A0', // Back to soft peach
        '#D4B0EA', // Back to light lavender
        '#C7A0DD', // Back to soft lavender
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
    animatedGradient: {},
    container: {
        height: 20,
        overflow: 'hidden',
    },
    gradient: {
        height: 20,
    },
    gradientContainer: {
        backgroundColor: '#C7A0DD', // Match the first color
        overflow: 'hidden',
    },
    maskContainer: {
        backgroundColor: 'transparent',
        flex: 1,
        justifyContent: 'center',
    },
    text: {
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
