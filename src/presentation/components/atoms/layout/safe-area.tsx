import React from 'react';
import { SafeAreaView, StyleSheet, ViewStyle } from 'react-native';

interface SafeAreaProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export function SafeArea({ children, style }: SafeAreaProps) {
    return <SafeAreaView style={[styles.safeArea, style]}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: 'transparent',
        flex: 1,
    },
});
