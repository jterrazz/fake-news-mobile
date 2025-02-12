import { useQuery } from '@tanstack/react-query';

import type { Language } from '@/application/ports/news.repository';

import type { NewsEntity } from '@/domain/news/news.entity';

import { useContainer } from '@/presentation/providers/container-provider';

export const useNewsArticles = (language: Language) => {
    const { newsService } = useContainer();

    return useQuery<NewsEntity[], Error>({
        placeholderData: [], // Set empty array as placeholder
        queryFn: () => newsService.getArticles(language),
        queryKey: ['news-articles', language],
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
