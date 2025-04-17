import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import ReAnimated, { AnimatedStyleProp } from 'react-native-reanimated';

import { NewsEntity } from '@/domain/news/news.entity';

import { ArticleContent } from '../../molecules/article/article-content.jsx';
import { ArticleHeader } from '../../molecules/article/article-header.jsx';
import { SIZES } from '../../sizes.jsx';
import { AnswerButtons } from '../question/answer-buttons.jsx';

interface ExpandedArticleProps {
    article: NewsEntity;
    contentAnimatedStyle: AnimatedStyleProp<ViewStyle>;
    isAnswered: boolean;
    selectedAnswer: boolean | null;
    wasCorrect?: boolean;
    onAnswerClick: (selectedFake: boolean, buttonPosition: { x: number; y: number }) => void;
    onNextArticle: () => void;
    showNextButton: boolean;
}

export function ExpandedArticle({
    article,
    contentAnimatedStyle,
    isAnswered,
    selectedAnswer,
    wasCorrect,
    onAnswerClick,
    onNextArticle,
    showNextButton,
}: ExpandedArticleProps) {
    return (
        <ReAnimated.View style={[styles.expandedContent, contentAnimatedStyle]}>
            <ArticleHeader category={article.category} headline={article.headline} />
            <ArticleContent
                contentWithAnnotations={article.contentWithAnnotations}
                wasCorrect={wasCorrect}
            />
            <View style={styles.actionContainer}>
                <View style={styles.actionRow}>
                    <View style={styles.buttonsContainer}>
                        <AnswerButtons
                            isAnswered={isAnswered}
                            selectedAnswer={selectedAnswer}
                            wasCorrect={wasCorrect}
                            onAnswerClick={onAnswerClick}
                            onNextArticle={onNextArticle}
                            showNextButton={showNextButton}
                            currentArticleId={article.id}
                            article={article}
                        />
                    </View>
                </View>
            </View>
        </ReAnimated.View>
    );
}

const styles = StyleSheet.create({
    actionContainer: {
        backgroundColor: '#FFFFFF',
        borderTopColor: 'rgba(0, 0, 0, 0.06)',
        borderTopWidth: 1,
        elevation: 4,
        padding: SIZES.md,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: {
            height: -2,
            width: 0,
        },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        zIndex: 2,
    },
    actionRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    buttonsContainer: {
        flex: 1,
    },
    expandedContent: {
        position: 'relative',
    },
});
