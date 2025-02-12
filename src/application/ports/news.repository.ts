import type { NewsEntity } from '../../domain/news/news.entity';

export interface NewsRepository {
    getArticles: () => Promise<NewsEntity[]>;
}
