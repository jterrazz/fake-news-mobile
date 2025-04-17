import React from 'react';
import type { ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';

interface StatusIndicatorProps {
    isCorrect: boolean;
    style?: ViewStyle;
}

export function ResponseIndicator({ isCorrect, style }: StatusIndicatorProps) {
    return (
        <View
            style={[styles.container, isCorrect ? styles.correct : styles.incorrect, style]}
        ></View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 6,
        height: 10,
        width: 10,
    },
    correct: {
        backgroundColor: '#83C5BE',
    },
    incorrect: {
        backgroundColor: '#E29C9C',
    },
});
