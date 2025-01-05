import { useQuery } from '@tanstack/react-query';

import type { NewsEntity } from '@/domain/news/news.entity';

import { useContainer } from '@/presentation/providers/container-provider';

export const useNewsArticles = () => {
    const { newsService } = useContainer();

    return useQuery<NewsEntity[], Error>({
        placeholderData: [], // Set empty array as placeholder
        queryFn: () => newsService.getArticles(),
        queryKey: ['news-articles'],
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
