import React from 'react';
import { StyleSheet, Text, TextProps, View, ViewStyle } from 'react-native';

import { FONT_FAMILY } from '@/presentation/theme/typography';

interface CategoryLabelProps extends TextProps {
    children: React.ReactNode;
    containerStyle?: ViewStyle;
}

export function CategoryLabel({ children, style, containerStyle, ...props }: CategoryLabelProps) {
    return (
        <View style={[styles.container, containerStyle]}>
            <Text style={[styles.text, style]} {...props}>
                {children}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    text: {
        color: '#666666',
        fontFamily: FONT_FAMILY.semibold,
        fontSize: 9,
        letterSpacing: 0.5,
        lineHeight: 11,
        textTransform: 'uppercase',
    },
});
