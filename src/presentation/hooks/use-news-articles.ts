import { useInfiniteQuery } from '@tanstack/react-query';

import type { Language } from '@/application/ports/news.repository';

import type { NewsEntity } from '@/domain/news/news.entity';

import { useContainer } from '@/presentation/providers/container-provider';

export interface UseNewsArticlesOptions {
    language: Language;
    limit?: number;
}

interface NewsArticlesPage {
    items: NewsEntity[];
    nextCursor: string | null;
    total: number;
}

export const useNewsArticles = ({ language, limit = 10 }: UseNewsArticlesOptions) => {
    const { newsService } = useContainer();

    return useInfiniteQuery<NewsArticlesPage>({
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialPageParam: undefined as string | undefined,
        queryFn: async ({ pageParam }) => {
            const response = await newsService.getArticles({
                cursor: pageParam as string | undefined,
                language,
                limit,
            });

            return {
                items: response.articles,
                nextCursor: response.nextCursor,
                total: response.total,
            };
        },
        queryKey: ['news-articles', language],
        // 5 minutes
        refetchOnMount: true,
        refetchOnReconnect: true,
        refetchOnWindowFocus: true,
        retry: 3,
        staleTime: 1000 * 60 * 5,
    });
};
