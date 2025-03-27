import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';

import { FONT_FAMILY } from '@/presentation/theme/typography';

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
        color: '#111111',
        fontFamily: FONT_FAMILY.semibold,
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
        fontSize: 26,
        lineHeight: 30,
    },
    small: {
        fontSize: 20,
        lineHeight: 26,
    },
});
