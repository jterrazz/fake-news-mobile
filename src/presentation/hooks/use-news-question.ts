import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';

import { useNewsStore } from '@/application/store/news.store';

import type { NewsEntity } from '@/domain/news/news.entity';

interface UseNewsQuestionProps {
    newsItem: NewsEntity;
    onAnswer?: (isCorrect: boolean) => void;
}

export const useNewsQuestion = ({ newsItem, onAnswer }: UseNewsQuestionProps) => {
    const { addAnswer, answers, score } = useNewsStore();

    const handleAnswer = useCallback(
        async (selectedFake: boolean) => {
            const isCorrect = selectedFake === newsItem.isFake;

            if (isCorrect) {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }

            addAnswer(newsItem.id, isCorrect);
            onAnswer?.(isCorrect);
        },
        [newsItem.id, newsItem.isFake, addAnswer, onAnswer],
    );

    return {
        answer: answers[newsItem.id],
        handleAnswer,
        score,
    };
};
