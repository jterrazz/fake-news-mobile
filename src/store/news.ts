import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { storageRepository } from '@/repositories/storage.repository';
import { createStorageService } from '@/services/storage.service';
import type { NewsAnswer, NewsScore } from '@/types/news';

interface NewsState {
    answers: Record<string, NewsAnswer>;
    score: NewsScore;
    addAnswer: (newsId: string, wasCorrect: boolean) => void;
    resetScore: () => void;
}

export const useNewsStore = create<NewsState>()(
    persist(
        (set, _get) => ({
            addAnswer: (newsId: string, wasCorrect: boolean) => {
                set((state) => {
                    const answers = {
                        ...state.answers,
                        [newsId]: {
                            answeredAt: new Date().toISOString(),
                            id: newsId,
                            wasCorrect,
                        },
                    };

                    const newScore = {
                        score: wasCorrect ? state.score.score + 100 : state.score.score,
                        streak: wasCorrect ? state.score.streak + 1 : 0,
                    };

                    return { answers, score: newScore };
                });
            },
            answers: {},
            resetScore: () => {
                set({ score: { score: 0, streak: 0 } });
            },
            score: {
                score: 0,
                streak: 0,
            },
        }),
        {
            name: 'news-storage',
            storage: createJSONStorage(() => createStorageService(storageRepository)),
        },
    ),
);
