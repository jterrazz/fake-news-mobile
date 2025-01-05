export interface StorageRepository {
    clear: () => Promise<void>;
    get: (key: string) => Promise<string | null>;
    remove: (key: string) => Promise<void>;
    set: (key: string, value: string) => Promise<void>;
}
w