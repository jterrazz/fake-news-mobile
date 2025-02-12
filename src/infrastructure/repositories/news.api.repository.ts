import { NewsRepository } from '@/application/ports/news.repository';

import type { NewsEntity } from '@/domain/news/news.entity';
import { NewsError } from '@/domain/news/news.entity';

interface ApiResponse {
    items: Array<{
        id: string;
        headline: string;
        article: string;
        isFake: boolean;
        category: string;
        createdAt: string;
        fakeReason: string | null;
        country: string;
        language: string;
        summary: string;
    }>;
    nextCursor: string | null;
    total: number;
}

const API_BASE_URL = 'https://fake-news-api.jterrazz.com';

export const newsApiRepositoryFactory = (): NewsRepository => ({
    getArticles: async (): Promise<NewsEntity[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/articles?country=fr&language=fr`, {
                headers: {
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                throw new NewsError(
                    `Failed to fetch articles: ${response.statusText}`,
                    'FETCH_ERROR',
                    response.status,
                );
            }

            const data = (await response.json()) as ApiResponse;

            if (data.items.length === 0) {
                throw new NewsError('No articles available', 'NO_CONTENT', 404);
            }

            return data.items.map((item) => ({
                article: item.article,
                category: item.category,
                createdAt: item.createdAt,
                headline: item.headline,
                id: item.id,
                isFake: item.isFake,
            }));
        } catch (error) {
            if (error instanceof NewsError) throw error;

            throw new NewsError(
                'Failed to fetch articles due to network error',
                'NETWORK_ERROR',
                500,
            );
        }
    },
});
