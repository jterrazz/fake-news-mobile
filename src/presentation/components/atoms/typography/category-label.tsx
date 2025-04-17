import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TextProps, View, ViewStyle } from 'react-native';

import type { NewsCategory } from '@/application/ports/news.repository';

import { FONT_FAMILY } from '@/presentation/theme/typography';

interface CategoryLabelProps extends TextProps {
    children: NewsCategory;
    containerStyle?: ViewStyle;
}

export function CategoryLabel({ children, style, containerStyle, ...props }: CategoryLabelProps) {
    const { t } = useTranslation();

    // Using a type assertion since we know these translations exist
    const translationKey = `common:categories.${children.toLowerCase()}` as const;

    return (
        <View style={[styles.container, containerStyle]}>
            <Text style={[styles.text, style]} {...props}>
                {t(translationKey)}
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
