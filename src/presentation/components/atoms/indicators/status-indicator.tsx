import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StatusIndicatorProps {
    isCorrect: boolean;
    isFake: boolean;
    style?: any;
}

export function StatusIndicator({ isCorrect, isFake, style }: StatusIndicatorProps) {
    return (
        <View
            style={[
                styles.container,
                isCorrect ? styles.correct : styles.incorrect,
                style,
            ]}
        >
            <Text style={styles.text}>{isFake ? 'F' : 'R'}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: '#242424',
        borderRadius: 8,
        height: 16,
        justifyContent: 'center',
        position: 'absolute',
        right: -4,
        top: -4,
        width: 16,
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
        fontSize: 10,
        fontWeight: '800',
        textAlign: 'center',
    },
}); 