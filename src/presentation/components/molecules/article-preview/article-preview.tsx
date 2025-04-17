import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import CheckMark from '../../../../../assets/images/check-mark.jpg';
import Cross from '../../../../../assets/images/cross.jpg';
// Import status images
import QuestionMark from '../../../../../assets/images/question-mark.jpg';
import { ResponseIndicator } from '../../atoms/indicators/response-indicator.js';
import { CategoryLabel } from '../../atoms/typography/category-label.jsx';

import { SIZES } from '@/presentation/components/sizes.js';
import { FONT_FAMILY } from '@/presentation/theme/typography';

const COLORS = {
    text: {
        primary: '#1A1A1A',
        secondary: '#666666',
        status: '#000000',
    },
} as const;

interface ArticlePreviewProps {
    headline: string;
    category: string;
    isAnswered?: boolean;
    isCorrect?: boolean;
    isFake?: boolean;
}

export function ArticlePreview({
    headline,
    category,
    isAnswered,
    isCorrect,
    isFake,
}: ArticlePreviewProps) {
    const getStatusImage = () => {
        if (!isAnswered) return QuestionMark;
        return isFake ? CheckMark : Cross;
    };

    const getStatusText = () => {
        if (!isAnswered) return '';
        return isCorrect ? 'Success' : 'Failed';
    };

    return (
        <View style={styles.previewContent}>
            <View style={styles.previewLeftColumn}>
                <View style={styles.previewIconContainer}>
                    <Image
                        source={getStatusImage()}
                        style={styles.previewIcon}
                        resizeMode="cover"
                    />
                    {isAnswered && <ResponseIndicator isCorrect={isCorrect} />}
                </View>
            </View>

            <View style={styles.previewTextContainer}>
                <Text style={styles.previewHeadline} numberOfLines={2}>
                    {headline}
                </Text>
                <View style={styles.metaContainer}>
                    <CategoryLabel>{category}</CategoryLabel>
                    {isAnswered && <Text style={styles.status}>{getStatusText()}</Text>}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    metaContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: SIZES.sm,
    },
    previewContent: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: SIZES.xs * 3,
        padding: SIZES.md,
        paddingVertical: SIZES.sm + SIZES['2xs'],
    },
    previewHeadline: {
        color: COLORS.text.primary,
        fontFamily: FONT_FAMILY.medium,
        fontSize: 15,
        letterSpacing: 0.2,
        lineHeight: 19,
    },
    previewIcon: {
        borderRadius: 42,
        height: '100%',
        width: '100%',
    },
    previewIconContainer: {
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        height: 42,
        justifyContent: 'center',
        overflow: 'visible',
        position: 'relative',
        width: 42,
    },
    previewLeftColumn: {
        alignItems: 'center',
        position: 'relative',
        width: 40,
    },
    previewTextContainer: {
        flex: 1,
        gap: 6,
        justifyContent: 'center',
        paddingRight: 8,
    },
    status: {
        color: COLORS.text.status,
        fontFamily: FONT_FAMILY.bold,
        fontSize: 13,
    },
});
