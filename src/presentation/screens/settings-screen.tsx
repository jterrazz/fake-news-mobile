import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { useNewsStore } from '@/application/store/news.store';
import { useSettingsStore } from '@/application/store/settings.store';

import { container } from '@/core/container';
import { SettingsTemplate } from '@/presentation/components/templates/settings-template';

export function SettingsScreen() {
    const { t } = useTranslation();
    const [isResetting, setIsResetting] = useState(false);
    const resetStore = useNewsStore((state) => state.resetStore);
    const language = useSettingsStore((state) => state.language);
    const setLanguage = useSettingsStore((state) => state.setLanguage);

    const handleReset = () => {
        Alert.alert(
            t('common:settings.reset.title'),
            t('common:settings.reset.message'),
            [
                {
                    style: 'cancel',
                    text: t('common:settings.reset.cancel'),
                },
                {
                    onPress: async () => {
                        try {
                            setIsResetting(true);
                            await container.storageService.clear();
                            resetStore();
                            setLanguage('en');
                            Alert.alert(
                                t('common:settings.reset.successTitle'),
                                t('common:settings.reset.successMessage'),
                            );
                        } catch (error) {
                            Alert.alert(
                                t('common:settings.reset.errorTitle'),
                                t('common:settings.reset.errorMessage'),
                            );
                        } finally {
                            setIsResetting(false);
                        }
                    },
                    style: 'destructive',
                    text: t('common:settings.reset.confirm'),
                },
            ],
        );
    };

    const handleLanguageToggle = () => {
        setLanguage(language === 'en' ? 'fr' : 'en');
    };

    return (
        <SettingsTemplate
            selectedLanguage={language}
            isResetting={isResetting}
            onLanguageToggle={handleLanguageToggle}
            onReset={handleReset}
        />
    );
}
