import { type NewsRepository } from '@/repositories/news.repository';
import type { NewsArticleError, NewsItem } from '@/types/news';

export interface NewsService {
  getArticles: () => Promise<NewsItem[]>;
  getFallbackArticles: () => NewsItem[];
}

export const createNewsService = (repository: NewsRepository): NewsService => {
  const handleError = (error: NewsArticleError): NewsItem[] => {
    console.error('Error fetching articles:', error);
    // Return fallback articles in case of error
    return getFallbackArticles();
  };

  const getFallbackArticles = (): NewsItem[] => {
    // Import from your existing SAMPLE_NEWS_ITEMS
    const { SAMPLE_NEWS_ITEMS } = require('@/components/news-question');
    return SAMPLE_NEWS_ITEMS;
  };

  const getArticles = async (): Promise<NewsItem[]> => {
    try {
      const response = await repository.getArticles();
      
      // Validate response structure
      if (!Array.isArray(response.articles)) {
        throw {
          code: 'INVALID_RESPONSE',
          message: 'Invalid response format',
          status: 500,
        } as NewsArticleError;
      }

      return response.articles;
    } catch (error) {
      return handleError(error as NewsArticleError);
    }
  };

  return {
    getArticles,
    getFallbackArticles,
  };
}; 