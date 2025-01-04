import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StorageRepository {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<void>;
    remove: (key: string) => Promise<void>;
}

// Direct wrapper around AsyncStorage
export const storageRepository: StorageRepository = {
    get: AsyncStorage.getItem,
    remove: AsyncStorage.removeItem,
    set: AsyncStorage.setItem,
};
