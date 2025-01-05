import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';

import { useNewsStore } from '@/application/store/news.store';

import type { NewsEntity } from '@/domain/news/news.entity';

interface UseNewsQuestionProps {
    newsItem: NewsEntity | null;
}

interface NewsQuestionResult {
    answer:
        | {
              answeredAt: string;
              id: string;
              wasCorrect: boolean;
          }
        | undefined;
    handleAnswer: (selectedFake: boolean) => Promise<void>;
    score: { score: number; streak: number };
}

export const useNewsQuestion = ({ newsItem }: UseNewsQuestionProps): NewsQuestionResult => {
    const { addAnswer, answers, score } = useNewsStore();

    const handleAnswer = useCallback(
        async (selectedFake: boolean) => {
            if (!newsItem) return;

            const isCorrect = selectedFake === newsItem.isFake;

            if (isCorrect) {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }

            addAnswer(newsItem.id, isCorrect);
        },
        [newsItem, addAnswer],
    );

    return {
        answer: newsItem ? answers[newsItem.id] : undefined,
        handleAnswer,
        score,
    };
};
