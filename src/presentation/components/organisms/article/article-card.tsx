import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import ReAnimated, { AnimatedStyleProp, ViewStyle } from 'react-native-reanimated';

import { ArticlePreview } from '../../molecules/article-preview/article-preview.jsx';

import { SIZES } from '@/presentation/constants/sizes';

interface ArticleCardProps {
    headline: string;
    category: string;
    timeAgo: string;
    isAnswered?: boolean;
    isCorrect?: boolean;
    isFake?: boolean;
    isExpanded?: boolean;
    onPress?: () => void;
    previewAnimatedStyle?: AnimatedStyleProp<ViewStyle>;
    containerAnimatedStyle?: AnimatedStyleProp<ViewStyle>;
    expandedContent?: React.ReactNode;
}

export function ArticleCard({
    headline,
    category,
    timeAgo,
    isAnswered,
    isCorrect,
    isFake,
    isExpanded,
    onPress,
    previewAnimatedStyle,
    containerAnimatedStyle,
    expandedContent,
}: ArticleCardProps) {
    return (
        <View style={styles.articleWrapper}>
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
                            timeAgo={timeAgo}
                            isAnswered={isAnswered}
                            isCorrect={isCorrect}
                            isFake={isFake}
                        />
                    </ReAnimated.View>

                    {isExpanded && expandedContent}
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
    articleContainerAnswered: {
        opacity: 0.8,
    },
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
