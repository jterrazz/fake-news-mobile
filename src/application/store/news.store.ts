import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { NewsAnswer, NewsScore } from '@/domain/news/news';

import { container } from '@/di/container';

interface NewsState {
    answers: Record<string, NewsAnswer>;
    score: NewsScore;
    addAnswer: (newsId: string, wasCorrect: boolean) => void;
    resetScore: () => void;
    resetStore: () => void;
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
            resetStore: () =>
                set(() => ({
                    answers: {},
                    articles: [],
                    currentArticle: null,
                    error: null,
                    isLoading: false,
                    score: {
                        score: 0,
                        streak: 0,
                    },
                })),
            score: {
                score: 0,
                streak: 0,
            },
        }),
        {
            name: 'news-storage',
            storage: createJSONStorage(() => container.storageService),
        },
    ),
);
