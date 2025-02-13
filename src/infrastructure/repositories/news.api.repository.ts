import {
    ArticlesResponse,
    GetArticlesParams,
    NewsRepository,
} from '@/application/ports/news.repository';

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

const LANGUAGE_SETTINGS = {
    en: { country: 'us', language: 'en' },
    fr: { country: 'fr', language: 'fr' },
} as const;

const DEFAULT_PAGE_SIZE = 10;

export const newsApiRepositoryFactory = (): NewsRepository => ({
    getArticles: async (params: GetArticlesParams): Promise<ArticlesResponse> => {
        try {
            const { country, language: apiLang } = LANGUAGE_SETTINGS[params.language];
            const searchParams = new URLSearchParams({
                country,
                language: apiLang,
                limit: String(params.limit || DEFAULT_PAGE_SIZE),
            });

            if (params.cursor) searchParams.append('cursor', params.cursor);
            if (params.category) searchParams.append('category', params.category);

            const response = await fetch(`${API_BASE_URL}/articles?${searchParams.toString()}`, {
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

            return {
                articles: data.items.map((item) => ({
                article: item.article,
                category: item.category,
                createdAt: item.createdAt,
                headline: item.headline,
                id: item.id,
                isFake: item.isFake,
                })),
                nextCursor: data.nextCursor,
                total: data.total,
            };
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
