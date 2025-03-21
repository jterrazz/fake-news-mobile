import * as Localization from 'expo-localization';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Language } from '@/application/ports/news.repository';

import { container } from '@/di/container';

interface SettingsState {
    language: Language;
    setLanguage: (language: Language) => void;
}

// Get initial language from device locale
const getInitialLanguage = (): Language => {
    // Get the full locale (e.g., "fr-FR", "en-US")
    const deviceLocale = Localization.locale;

    // Extract the language code (e.g., "fr", "en")
    const languageCode = deviceLocale.split('-')[0].toLowerCase();

    // Check if the language is supported, otherwise fallback to English
    const supportedLanguages: Language[] = ['en', 'fr'];
    return supportedLanguages.includes(languageCode as Language)
        ? (languageCode as Language)
        : 'en';
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
