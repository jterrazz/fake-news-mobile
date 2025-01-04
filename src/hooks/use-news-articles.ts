import { useQuery } from '@tanstack/react-query';

import { createNewsRepository } from '@/repositories/news.repository';
import { createNewsService } from '@/services/news.service';

const newsRepository = createNewsRepository();
const newsService = createNewsService(newsRepository);

export const useNewsArticles = () => {
  return useQuery({
    // Return fallback articles while loading
placeholderData: newsService.getFallbackArticles(),
    
queryFn: () => newsService.getArticles(),
    
    queryKey: ['news-articles'],
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
}; 