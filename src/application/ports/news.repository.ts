import type { NewsEntity } from '../../domain/news/news.entity';

export type Language = 'en' | 'fr';

export interface NewsRepository {
    getArticles: (language: Language) => Promise<NewsEntity[]>;
}
