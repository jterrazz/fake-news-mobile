import React, { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import ReAnimated from 'react-native-reanimated';

import { ArticlePreview } from '../../molecules/article-preview/article-preview.jsx';

import { SIZES } from '@/presentation/components/sizes.js';
import { useArticleAnimation } from '@/presentation/hooks/animations/use-article-animation';

type IconVariant = 'default' | 'dark' | 'green' | 'brown';

const getIconVariantFromHeadline = (headline: string): IconVariant => {
    if (!headline) return 'default';

    // Get the first letter and convert to lowercase
    const firstLetter = headline.trim().toLowerCase().charAt(0);

    // Distribute letters across the variants
    if ('abcdefgh'.includes(firstLetter)) return 'default';
    if ('ijklmnop'.includes(firstLetter)) return 'dark';
    if ('qrstuv'.includes(firstLetter)) return 'green';
    return 'brown'; // wxyz and any other characters
};

interface ArticleCardProps {
    headline: string;
    category: string;
    timeAgo: string;
    isAnswered?: boolean;
    isCorrect?: boolean;
    isFake?: boolean;
    isExpanded?: boolean;
    onPress?: () => void;
    expandedContent?: React.ReactNode;
}

export function ArticleCard({
    headline,
    category,
    isAnswered,
    isCorrect,
    isFake,
    isExpanded,
    onPress,
    expandedContent,
}: ArticleCardProps) {
    const { containerAnimatedStyle, contentAnimatedStyle, previewAnimatedStyle } =
        useArticleAnimation(isExpanded ?? false);
    const articleRef = useRef<View>(null);

    const iconVariant = getIconVariantFromHeadline(headline);

    return (
        <View style={styles.articleWrapper} ref={articleRef}>
            <ReAnimated.View
                style={[
                    styles.articleContainer,
                    isAnswered && styles.articleContainerAnswered,
                    containerAnimatedStyle,
                ]}
            >
                <Pressable onPress={onPress} style={styles.articlePressable}>
                    <ReAnimated.View
                        style={[
                            styles.previewContent,
                            previewAnimatedStyle,
                            isExpanded && styles.previewContentHidden,
                        ]}
                    >
                        <ArticlePreview
                            headline={headline}
                            category={category}
                            isAnswered={isAnswered}
                            isCorrect={isCorrect}
                            isFake={isFake}
                            iconVariant={iconVariant}
                        />
                    </ReAnimated.View>

                    {isExpanded && (
                        <ReAnimated.View style={[styles.expandedContent, contentAnimatedStyle]}>
                            {expandedContent}
                        </ReAnimated.View>
                    )}
                </Pressable>
            </ReAnimated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    articleContainer: {
        backgroundColor: '#FFFFFF',
        borderColor: 'rgba(0, 0, 0, 0.04)',
        borderRadius: 12,
        borderWidth: 1,
        marginVertical: SIZES.xs,
        overflow: 'hidden',
    },
    articleContainerAnswered: {},
    articlePressable: {
        overflow: 'hidden',
    },
    articleWrapper: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            height: 2,
            width: 0,
        },
        shadowOpacity: 0.06,
        shadowRadius: 8,
    },
    expandedContent: {
        position: 'relative',
    },
    previewContent: {
        position: 'relative',
    },
    previewContentHidden: {
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
    },
});
