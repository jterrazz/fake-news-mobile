import * as Localization from 'expo-localization';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Language } from '@/application/ports/news.repository';

import { container } from '@/di/container';

interface SettingsState {
    language: Language;
    setLanguage: (language: Language) => void;
}

// Get initial language from device locale, defaulting to 'en' if not supported
const getInitialLanguage = (): Language => {
    const deviceLanguage = Localization.locale.split('-')[0];
    return deviceLanguage === 'fr' ? 'fr' : 'en';
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            language: getInitialLanguage(),
            setLanguage: (language: Language) => set({ language }),
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => container.storageService),
        },
    ),
);
