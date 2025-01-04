import type { NewsRepository } from '@/application/ports/news.repository';

export const createGetArticlesUseCase = (repository: NewsRepository) => ({
    execute: async () => {
        const response = await repository.getArticles();
        // Orchestration logic here
    },
});
