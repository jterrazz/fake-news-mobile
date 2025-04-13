import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import CheckMark from '../../../../../assets/images/check-mark.jpg';
import Cross from '../../../../../assets/images/cross.jpg';
// Import status images
import QuestionMark from '../../../../../assets/images/question-mark.jpg';
import { ResponseIndicator } from '../../atoms/indicators/response-indicator.js';

import { ArticleMeta } from './article-meta.jsx';
import { SIZES } from '@/presentation/components/sizes.js';
import { FONT_FAMILY } from '@/presentation/theme/typography';

interface ArticlePreviewProps {
    headline: string;
    category: string;
    timeAgo: string;
    isAnswered?: boolean;
    isCorrect?: boolean;
    isFake?: boolean;
}

export function ArticlePreview({
    headline,
    category,
    timeAgo,
    isAnswered,
    isCorrect,
    isFake, // TODO: Remove this prop
}: ArticlePreviewProps) {
    const getStatusImage = () => {
        if (!isAnswered) return QuestionMark;
        return isCorrect ? CheckMark : Cross;
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
                <ArticleMeta category={category} timeAgo={timeAgo} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    previewContent: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: SIZES.xs * 3,
        padding: SIZES.md,
        paddingVertical: SIZES.sm + SIZES['2xs'],
    },
    previewHeadline: {
        color: '#1A1A1A',
        fontFamily: FONT_FAMILY.medium,
        fontSize: 15,
        letterSpacing: 0.2,
        lineHeight: 19,
    },
    previewIcon: {
        borderRadius: 8,
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
        width: 40,
    },
    previewTextContainer: {
        flex: 1,
        gap: 6,
        justifyContent: 'center',
        paddingRight: 8,
    },
});
