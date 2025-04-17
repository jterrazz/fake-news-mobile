import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, View } from 'react-native';

import CheckMark from '../../../../../assets/images/check-mark.jpg';
import Cross from '../../../../../assets/images/cross.jpg';
// Import status images
import QuestionMark from '../../../../../assets/images/question-mark.jpg';
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
    const { t } = useTranslation();

    const getStatusImage = () => {
        if (!isAnswered) return QuestionMark;
        return isFake ? CheckMark : Cross;
    };

    const getStatusText = () => {
        if (!isAnswered) return '';
        return isFake ? t('common:newsFeed.fake') : t('common:newsFeed.real');
    };

    const getStatusColor = () => {
        if (!isAnswered) return 'rgba(0, 0, 0, 0.05)';
        return isFake ? 'rgba(255, 77, 77, 0.1)' : 'rgba(0, 200, 83, 0.1)';
    };

    const getStatusTextColor = () => {
        if (!isAnswered) return '#666666';
        return isFake ? '#FF4D4D' : '#00C853';
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
                </View>
            </View>

            <View style={styles.previewTextContainer}>
                <Text style={styles.previewHeadline} numberOfLines={2}>
                    {headline}
                </Text>
                <View style={styles.metaContainer}>
                    <CategoryLabel>{category}</CategoryLabel>
                    {isAnswered && (
                        <View style={[styles.statusTag, { backgroundColor: getStatusColor() }]}>
                            <Text style={[styles.statusTagText, { color: getStatusTextColor() }]}>
                                {getStatusText()}
                            </Text>
                        </View>
                    )}
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
        gap: SIZES.md,
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
        height: 36,
        justifyContent: 'center',
        overflow: 'visible',
        position: 'relative',
        width: 36,
    },
    previewLeftColumn: {
        alignItems: 'center',
        position: 'relative',
    },
    previewTextContainer: {
        flex: 1,
        gap: 6,
        justifyContent: 'center',
        paddingRight: 8,
    },
    statusTag: {
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    statusTagText: {
        fontFamily: FONT_FAMILY.semibold,
        fontSize: 9,
        letterSpacing: 0.5,
        lineHeight: 11,
        textTransform: 'uppercase',
    },
});
