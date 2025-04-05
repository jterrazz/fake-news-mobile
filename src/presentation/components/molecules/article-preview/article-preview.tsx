import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';

// Import icons
import IconDefault from '../../../../../assets/icon.png';
import IconBrown from '../../../../../assets/icon-brown.png';
import IconDark from '../../../../../assets/icon-dark.png';
import IconGreen from '../../../../../assets/icon-green.png';
import { StatusIndicator } from '../../atoms/indicators/status-indicator.jsx';

import { ArticleMeta } from './article-meta.jsx';
import { SIZES } from '@/presentation/components/sizes.js';
import { FONT_FAMILY } from '@/presentation/theme/typography';

type IconVariant = 'default' | 'dark' | 'green' | 'brown';

interface ArticlePreviewProps {
    headline: string;
    category: string;
    timeAgo: string;
    isAnswered?: boolean;
    isCorrect?: boolean;
    isFake?: boolean;
    iconVariant?: IconVariant;
}

const ICON_SOURCES: Record<IconVariant, ImageSourcePropType> = {
    brown: IconBrown,
    dark: IconDark,
    default: IconDefault,
    green: IconGreen,
};

export function ArticlePreview({
    headline,
    category,
    timeAgo,
    isAnswered,
    isCorrect,
    isFake,
    iconVariant,
}: ArticlePreviewProps) {
    return (
        <View style={styles.previewContent}>
            <View style={styles.previewLeftColumn}>
                <View style={styles.previewIconContainer}>
                    <Image
                        source={ICON_SOURCES[iconVariant]}
                        style={styles.previewIcon}
                        resizeMode="cover"
                    />
                    {isAnswered && <StatusIndicator isCorrect={isCorrect} isFake={isFake} />}
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
        borderColor: 'rgba(0, 0, 0, 0.06)',
        borderRadius: 12,
        borderWidth: 1,
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
