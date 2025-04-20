import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';

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

// TODO Use
export const darkCharcoal = '#1A1A1A';
const styles = StyleSheet.create({
    base: {
        color: darkCharcoal,
        fontFamily: 'BebasNeue-Regular',
    },
    large: {
        fontSize: 40,
    },
    medium: {
        fontSize: 32,
    },
    small: {
        fontSize: 24,
    },
});
