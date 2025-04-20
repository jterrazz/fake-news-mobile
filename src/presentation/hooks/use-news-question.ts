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
    handleAnswer: (selectedFake: boolean, articleId: string, wasCorrect: boolean) => Promise<void>;
    score: { score: number; streak: number };
}

// TODO Delete newsItem param
export const useNewsQuestion = ({ newsItem }: UseNewsQuestionProps): NewsQuestionResult => {
    const { addAnswer, answers, score } = useNewsStore();

    const handleAnswer = useCallback(
        async (selectedFake: boolean, articleId: string, wasCorrect: boolean) => {
            // TODO Refacto
            if (!newsItem) return;

            console.log(selectedFake);
            console.log(newsItem.isFake);

            if (wasCorrect) {
                console.log('isCorrect');
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                console.log('isNotCorrect');
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }

            addAnswer(articleId, wasCorrect);
        },
        [newsItem, addAnswer],
    );

    return {
        answer: newsItem ? answers[newsItem.id] : undefined,
        handleAnswer,
        score,
    };
};
