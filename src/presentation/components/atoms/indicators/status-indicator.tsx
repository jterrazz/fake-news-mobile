import React from 'react';
import type { ViewStyle } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';

interface StatusIndicatorProps {
    isCorrect: boolean;
    isFake: boolean; // TODO: Remove this prop
    style?: ViewStyle;
}

export function StatusIndicator({ isCorrect, isFake, style }: StatusIndicatorProps) {
    const symbol = isCorrect ? '+' : '-';

    return (
        <View style={[styles.container, isCorrect ? styles.correct : styles.incorrect, style]}>
            <Text style={styles.text}>{symbol}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: '#242424',
        borderRadius: 7,
        height: 14,
        justifyContent: 'center',
        overflow: 'visible',
        paddingBottom: 1,
        position: 'absolute',
        right: -5,
        top: -5,
        width: 14,
        zIndex: 1,
    },
    correct: {
        backgroundColor: '#03A678',
    },
    incorrect: {
        backgroundColor: '#E15554',
    },
    text: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '900',
        includeFontPadding: false,
        padding: 0,
        textAlign: 'center',
        textAlignVertical: 'center',
    },
});
