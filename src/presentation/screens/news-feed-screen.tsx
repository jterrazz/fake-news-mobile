import React, { useState } from 'react';

import { useNewsStore } from '@/application/store/news.store';

import { NewsFeedTemplate } from '@/presentation/components/templates/news-feed-template';
import { useHeaderAnimation } from '@/presentation/hooks/animations/use-header-animation';
import { useNewsArticles } from '@/presentation/hooks/use-news-articles';
import { useNewsQuestion } from '@/presentation/hooks/use-news-question';

export function NewsFeedScreen() {
    const { data: newsItems, refetch } = useNewsArticles();
    const { answers } = useNewsStore();
    const [expandedIndex, setExpandedIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
    const [activeTab, setActiveTab] = useState<'latest' | 'to-read'>('latest');
    const [lastClickedPosition, setLastClickedPosition] = useState({ x: 0, y: 0 });
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [answeredInSession, setAnsweredInSession] = useState<Set<string>>(new Set());

    const newsItemsWithAnswers = React.useMemo(() => {
        return (newsItems ?? []).map((item) => ({
            ...item,
            answered: answers[item.id]
                ? {
                      answeredAt: answers[item.id].answeredAt,
                      id: answers[item.id].id,
                      wasCorrect: answers[item.id].wasCorrect,
                  }
                : undefined,
        }));
    }, [newsItems, answers]);

    React.useEffect(() => {
        if (newsItemsWithAnswers.length === 0) {
            setExpandedIndex(0);
        } else if (expandedIndex >= newsItemsWithAnswers.length) {
            setExpandedIndex(newsItemsWithAnswers.length - 1);
        }
    }, [newsItemsWithAnswers.length, expandedIndex]);

    const filteredNewsItems = React.useMemo(() => {
        if (activeTab === 'to-read') {
            return newsItemsWithAnswers.filter(
                (item) => !item.answered || answeredInSession.has(item.id),
            );
        }
        return newsItemsWithAnswers;
    }, [newsItemsWithAnswers, activeTab, answeredInSession]);

    React.useEffect(() => {
        if (currentNewsItem) {
            const newIndex = filteredNewsItems.findIndex((item) => item.id === currentNewsItem.id);
            if (newIndex !== -1 && newIndex !== expandedIndex) {
                setExpandedIndex(newIndex);
            }
        } else if (expandedIndex >= filteredNewsItems.length) {
            setExpandedIndex(Math.max(0, filteredNewsItems.length - 1));
        }
    }, [filteredNewsItems, currentNewsItem, expandedIndex]);

    const currentNewsItem = filteredNewsItems[expandedIndex] ?? null;
    const { answer, handleAnswer, score } = useNewsQuestion({
        newsItem: currentNewsItem,
    });

    const { headerAnimatedStyle, titleAnimatedStyle, scrollHandler } = useHeaderAnimation();

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

        if (currentNewsItem) {
            setAnsweredInSession((prev) => new Set(prev).add(currentNewsItem.id));
        }

        await handleAnswer(selectedFake);
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refetch();
        setIsRefreshing(false);
    };

    const handleTabChange = (newTab: 'latest' | 'to-read') => {
        setActiveTab(newTab);
        setAnsweredInSession(new Set());
    };

    return (
        <NewsFeedTemplate
            newsItems={filteredNewsItems}
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
            onTabChange={handleTabChange}
            onArticleSelect={handleArticleSelect}
            onAnswerClick={handleAnswerClick}
            onRefresh={handleRefresh}
        />
    );
}
