import React from 'react';
import { StyleSheet, View } from 'react-native';
import ReAnimated, { AnimatedStyleProp } from 'react-native-reanimated';

import { NewsEntity } from '@/domain/news/news.entity';

import { SIZES } from '../../sizes.js';
import { ArticleContent } from '../../molecules/article/article-content.jsx';
import { ArticleHeader } from '../../molecules/article/article-header.jsx';
import { AnswerButtons } from '../question/answer-buttons.jsx';

interface ExpandedArticleProps {
    article: NewsEntity;
    contentAnimatedStyle: AnimatedStyleProp<any>;
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
            <ArticleContent content={article.article} />
            <View style={styles.actionContainer}>
                <AnswerButtons
                    isAnswered={isAnswered}
                    selectedAnswer={selectedAnswer}
                    wasCorrect={wasCorrect}
                    onAnswerClick={onAnswerClick}
                    onNextArticle={onNextArticle}
                    showNextButton={showNextButton}
                    currentArticleId={article.id}
                />
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
    expandedContent: {
        position: 'relative',
    },
});
