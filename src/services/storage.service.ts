import { StorageRepository } from '@/repositories/storage.repository';

export interface StorageService {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
}

export const createStorageService = (repository: StorageRepository): StorageService => ({
    getItem: async (key: string): Promise<string | null> => {
        try {
            return await repository.get(key);
        } catch (error) {
            console.error('Error reading from storage:', error);
            return null;
        }
    },

    removeItem: async (key: string): Promise<void> => {
        try {
            await repository.remove(key);
        } catch (error) {
            console.error('Error removing from storage:', error);
        }
    },

    setItem: async (key: string, value: string): Promise<void> => {
        try {
            await repository.set(key, value);
        } catch (error) {
            console.error('Error writing to storage:', error);
        }
    },
});
