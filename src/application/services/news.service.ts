import type { ArticlesResponse, GetArticlesParams, NewsRepository } from '@/application/ports/news.repository';

export interface NewsService {
    getArticles: (params: GetArticlesParams) => Promise<ArticlesResponse>;
export interface NewsService {
    getArticles: (params: GetArticlesParams) => Promise<ArticlesResponse>;
}

export const createNewsService = (repository: NewsRepository): NewsService => {
    const getArticles = async (params: GetArticlesParams): Promise<ArticlesResponse> => {
        try {
            return await repository.getArticles(params);
        } catch (error) {
            // If there's an error fetching from the API, fallback to sample data
            // TODO Fix this
            if (error.code === 'NO_CONTENT' || error.code === 'NETWORK_ERROR') {
                return {
                    articles: [],
                    nextCursor: null,
                    total: 0,
                };
            }
            throw error;
        }
    };

    return {
        getArticles,
    };
};
