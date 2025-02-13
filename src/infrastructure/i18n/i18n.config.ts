import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18next from 'i18next';

import { useSettingsStore } from '@/application/store/settings.store';

import en from './locales/en.json';
import fr from './locales/fr.json';

const LANGUAGE_DETECTOR = {
    async: true,
    cacheUserLanguage: async (lng: string) => {
        try {
            await AsyncStorage.setItem('user-language', lng);
        } catch {
            // Handle error
        }
    },
    detect: async (callback: (lng: string) => void) => {
        try {
            // Get language from settings store
            const language = useSettingsStore.getState().language;
            if (language) {
                callback(language);
                return;
            }

            // Fallback to device language if store is empty
            callback(Localization.locale.split('-')[0]);
        } catch {
            callback('en');
        }
    },
    init: () => {},
    type: 'languageDetector' as const,
};

export const defaultNS = 'common';
export const resources = {
    en: {
        common: en.common,
    },
    fr: {
        common: fr.common,
    },
} as const;

i18next
    .use(LANGUAGE_DETECTOR)
    .use(initReactI18next)
    .init({
        compatibilityJSON: 'v4',
        defaultNS,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        resources,
        supportedLngs: ['en', 'fr'],
    });

// Subscribe to language changes in the store
useSettingsStore.subscribe((state, prevState) => {
    const language = state.language;
    const prevLanguage = prevState.language;

    if (language !== prevLanguage) {
        i18next.changeLanguage(language);
    }
});

export default i18next;
