import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import type { Language } from '@/infrastructure/i18n/types';

export const useLanguage = () => {
    const { i18n } = useTranslation();

    const changeLanguage = useCallback(
        async (language: Language) => {
            try {
                await i18n.changeLanguage(language);
            } catch (error) {
                console.error('Failed to change language:', error);
            }
        },
        [i18n],
    );

    return {
        availableLanguages: i18n.options.supportedLngs || [],
        changeLanguage,
        currentLanguage: i18n.language as Language,
        isRTL: i18n.dir() === 'rtl',
    };
};
