import AsyncStorage from '@react-native-async-storage/async-storage';

import type { StorageRepository } from '@/application/ports/storage.repository';

export const storageReactNativeRepositoryFactory = (): StorageRepository => ({
    clear: AsyncStorage.clear,
    get: AsyncStorage.getItem,
    remove: AsyncStorage.removeItem,
    set: AsyncStorage.setItem,
});
