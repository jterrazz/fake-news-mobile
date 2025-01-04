import { NewsRepository } from '@/application/ports/news.repository';

import type { NewsEntity } from '@/domain/news/news.entity';
import { NewsError } from '@/domain/news/news.entity';

export const newsApiRepositoryFactory = (): NewsRepository => ({
    getArticles: async (): Promise<NewsEntity> => {
        try {
            const response = await fetch('https://your-api.com/news-articles.json');

            if (!response.ok) {
                throw new NewsError(
                    `Failed to fetch articles: ${response.statusText}`,
                    'FETCH_ERROR',
                    response.status,
                );
            }

            const data = await response.json();
            return data as NewsEntity;
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
