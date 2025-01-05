import React from 'react';
import { Platform, StyleSheet, Text, TextProps } from 'react-native';

interface HeadlineProps extends TextProps {
    children: React.ReactNode;
    size?: 'small' | 'medium' | 'large';
}

export function Headline({ children, size = 'medium', style, ...props }: HeadlineProps) {
    return (
        <Text style={[styles.base, styles[size], style]} {...props}>
            {children}
        </Text>
    );
}

const styles = StyleSheet.create({
    base: {
        color: '#000000',
        fontFamily: Platform.OS === 'ios' ? 'New York' : 'serif',
        fontWeight: '700',
        letterSpacing: -0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.04)',
        textShadowOffset: { height: 1, width: 0 },
        textShadowRadius: 1,
    },
    large: {
        fontSize: 32,
        lineHeight: 40,
    },
    medium: {
        fontSize: 24,
        lineHeight: 30,
    },
    small: {
        fontSize: 20,
        lineHeight: 26,
    },
});
