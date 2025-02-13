import type { NewsEntity } from '../../domain/news/news.entity';

export type Language = 'en' | 'fr';
export type NewsCategory =
    | 'WORLD'
    | 'POLITICS'
    | 'BUSINESS'
    | 'TECHNOLOGY'
    | 'SCIENCE'
    | 'HEALTH'
    | 'SPORTS'
    | 'ENTERTAINMENT'
    | 'LIFESTYLE'
    | 'OTHER';

export interface GetArticlesParams {
    language: Language;
    cursor?: string;
    limit?: number;
    category?: NewsCategory;
}

export interface ArticlesResponse {
    articles: NewsEntity[];
    nextCursor: string | null;
    total: number;
}

export interface NewsRepository {
    getArticles: (params: GetArticlesParams) => Promise<ArticlesResponse>;
}
