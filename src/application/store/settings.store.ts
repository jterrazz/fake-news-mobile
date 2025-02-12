import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Language } from '@/application/ports/news.repository';

import { container } from '@/core/container';

interface SettingsState {
    language: Language;
    setLanguage: (language: Language) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            language: 'fr',
            setLanguage: (language: Language) => set({ language }),
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => container.storageService),
        },
    ),
);
