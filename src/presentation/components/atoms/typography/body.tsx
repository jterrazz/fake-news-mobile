import React from 'react';
import { Platform, StyleSheet, Text, TextProps } from 'react-native';

interface BodyProps extends TextProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
    size?: 'small' | 'medium' | 'large';
}

export function Body({ children, variant = 'primary', size = 'medium', style, ...props }: BodyProps) {
    return (
        <Text style={[styles.base, styles[variant], styles[size], style]} {...props}>
            {children}
        </Text>
    );
}

const styles = StyleSheet.create({
    base: {
        color: '#1A1A1A',
        fontFamily: Platform.OS === 'ios' ? 'New York' : 'Noto Serif',
        fontWeight: '400',
        letterSpacing: 0.1,
    },
    large: {
        fontSize: 18,
        lineHeight: 28,
    },
    medium: {
        fontSize: 16,
        lineHeight: 26,
    },
    primary: {
        color: '#1A1A1A',
    },
    secondary: {
        color: '#666666',
    },
    small: {
        fontSize: 14,
        lineHeight: 22,
    },
}); 