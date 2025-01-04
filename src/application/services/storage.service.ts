import type { StateStorage } from 'zustand/middleware';

import type { StorageRepository } from '@/application/ports/storage.repository';

// Pure technical storage service that matches Zustand's StateStorage interface
export interface StorageService extends StateStorage {
    clear: () => Promise<void>;
}

export const createStorageService = (repository: StorageRepository): StorageService => ({
    clear: async () => {
        await repository.clear();
    },
    getItem: async (key: string) => {
        return repository.get(key);
    },
    removeItem: async (key: string) => {
        await repository.remove(key);
    },
    setItem: async (key: string, value: string) => {
        await repository.set(key, value);
    },
});
