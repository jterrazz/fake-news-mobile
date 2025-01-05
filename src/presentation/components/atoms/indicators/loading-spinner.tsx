import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface LoadingSpinnerProps {
    size?: 'small' | 'large';
    color?: string;
}

export function LoadingSpinner({ size = 'small', color = 'red' }: LoadingSpinnerProps) {
    return (
        <View style={styles.container}>
            <ActivityIndicator size={size} color={color} style={styles.spinner} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-start',
        opacity: 0.8,
        paddingTop: 150,
    },
    spinner: {
        transform: [{ scale: 0.8 }],
    },
});
