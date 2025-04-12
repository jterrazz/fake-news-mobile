import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, TextStyle } from 'react-native';

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
                useNativeDriver: false,
            }),
            {
                iterations: -1,
            },
        ).start();

        return () => {
            animatedValue.stopAnimation();
        };
    }, []);

    const animatedColor = animatedValue.interpolate({
        inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
        outputRange: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FF6B6B', '#4ECDC4', '#45B7D1'],
    });

    return (
        <Animated.Text style={[styles.text, style, { color: animatedColor }]}>{text}</Animated.Text>
    );
}

const styles = StyleSheet.create({
    text: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
});
