import type { NewsArticleError, NewsArticleResponse } from '@/types/news';

export interface NewsRepository {
  getArticles: () => Promise<NewsArticleResponse>;
}

export const createNewsRepository = (): NewsRepository => ({
  getArticles: async (): Promise<NewsArticleResponse> => {
    try {
      // Replace with your actual JSON URL
      const response = await fetch('https://your-api.com/news-articles.json');
      
      if (!response.ok) {
        const error: NewsArticleError = {
          code: 'FETCH_ERROR',
          message: `Failed to fetch articles: ${response.statusText}`,
          status: response.status,
        };
        throw error;
      }

      const data = await response.json();
      return data as NewsArticleResponse;
    } catch (error) {
      if ((error as NewsArticleError).code === 'FETCH_ERROR') throw error;

      const networkError: NewsArticleError = {
        code: 'NETWORK_ERROR',
        message: 'Failed to fetch articles due to network error',
        status: 500,
      };
      throw networkError;
    }
  },
}); 