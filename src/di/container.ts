import { NewsRepository } from '@/application/ports/news.repository';
import { StorageRepository } from '@/application/ports/storage.repository';
import { createNewsService, NewsService } from '@/application/services/news.service';
import { createStorageService, StorageService } from '@/application/services/storage.service';

import { newsApiRepositoryFactory } from '@/infrastructure/repositories/news.api.repository';
import { storageReactNativeRepositoryFactory } from '@/infrastructure/repositories/storage.react-native.repository';

export interface Container {
    newsRepository: NewsRepository;
    newsService: NewsService;
    storageRepository: StorageRepository;
    storageService: StorageService;
}

export const createContainer = (): Container => {
    // Infrastructure layer
    const storageRepository = storageReactNativeRepositoryFactory();
    const newsRepository = newsApiRepositoryFactory();

    // Application layer
    const storageService = createStorageService(storageRepository);
    const newsService = createNewsService(newsRepository);

    return {
        newsRepository,
        newsService,
        storageRepository,
        storageService,
    };
};

// Singleton instance
export const container = createContainer();
