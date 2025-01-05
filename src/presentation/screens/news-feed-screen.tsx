import React, { useState } from 'react';

import { useNewsStore } from '@/application/store/news.store';

import { NewsFeedTemplate } from '@/presentation/components/templates/news-feed-template';
import { useArticleAnimation } from '@/presentation/hooks/animations/use-article-animation';
import { useHeaderAnimation } from '@/presentation/hooks/animations/use-header-animation';
import { useNewsArticles } from '@/presentation/hooks/use-news-articles';
import { useNewsQuestion } from '@/presentation/hooks/use-news-question';


export function NewsFeedScreen() {
    const { data: newsItems = [], refetch } = useNewsArticles();
    const { answers } = useNewsStore();

    const newsItemsWithAnswers =
        newsItems?.map((item) => ({
            ...item,
            answered: answers[item.id]
                ? {
                      answeredAt: answers[item.id].answeredAt,
                      id: answers[item.id].id,
                      wasCorrect: answers[item.id].wasCorrect,
                  }
                : undefined,
        })) ?? [];

    const [expandedIndex, setExpandedIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
    const [activeTab, setActiveTab] = useState<'latest' | 'to-read'>('latest');
    const [lastClickedPosition, setLastClickedPosition] = useState({ x: 0, y: 0 });
    const [isRefreshing, setIsRefreshing] = useState(false);

    const currentNewsItem = newsItemsWithAnswers[expandedIndex] ?? null;
    const { answer, handleAnswer, score } = useNewsQuestion({
        newsItem: currentNewsItem,
    });

    const { headerAnimatedStyle, titleAnimatedStyle, scrollHandler } = useHeaderAnimation();

    const getAnimationStyles = (index: number) => {
        const isExpanded = index === expandedIndex;
        return useArticleAnimation(isExpanded);
    };

    const handleArticleSelect = (index: number) => {
        setExpandedIndex(index);
        setSelectedAnswer(null);
        setLastClickedPosition({ x: 0, y: 0 });
    };

    const handleAnswerClick = async (
        selectedFake: boolean,
        buttonPosition: { x: number; y: number },
    ) => {
        setSelectedAnswer(selectedFake);
        setLastClickedPosition(buttonPosition);
        await handleAnswer(selectedFake);
    };

    const getFilteredNewsItems = (items: typeof newsItemsWithAnswers) => {
        if (activeTab === 'to-read') return items.filter((item) => !item.answered);
        return items;
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refetch();
        setIsRefreshing(false);
    };

    return (
        <NewsFeedTemplate
            newsItems={getFilteredNewsItems(newsItemsWithAnswers)}
            expandedIndex={expandedIndex}
            selectedAnswer={selectedAnswer}
            activeTab={activeTab}
            isRefreshing={isRefreshing}
            score={score}
            lastClickedPosition={lastClickedPosition}
            answer={answer}
            headerAnimatedStyle={headerAnimatedStyle}
            titleAnimatedStyle={titleAnimatedStyle}
            scrollHandler={scrollHandler}
            onTabChange={setActiveTab}
            onArticleSelect={handleArticleSelect}
            onAnswerClick={handleAnswerClick}
            onRefresh={handleRefresh}
            getAnimationStyles={getAnimationStyles}
        />
    );
}
