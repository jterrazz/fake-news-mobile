import { useQuery } from '@tanstack/react-query';

import { useContainer } from '@/presentation/providers/container-provider';

export const useNewsArticles = () => {
    const { newsService } = useContainer();

    return useQuery({
        placeholderData: newsService.getFallbackArticles(),
        queryFn: () => newsService.getArticles(),
        queryKey: ['news-articles'],
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
