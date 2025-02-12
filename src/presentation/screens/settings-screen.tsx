import React, { useState } from 'react';
import { Alert } from 'react-native';

import { useNewsStore } from '@/application/store/news.store';
import { useSettingsStore } from '@/application/store/settings.store';

import { container } from '@/core/container';
import { SettingsTemplate } from '@/presentation/components/templates/settings-template';

export function SettingsScreen() {
    const [isResetting, setIsResetting] = useState(false);
    const resetStore = useNewsStore((state) => state.resetStore);
    const language = useSettingsStore((state) => state.language);
    const setLanguage = useSettingsStore((state) => state.setLanguage);

    const handleReset = () => {
        Alert.alert(
            language === 'en' ? 'Reset Everything' : 'Réinitialiser tout',
            language === 'en'
                ? 'Are you sure? This action cannot be undone.'
                : 'Êtes-vous sûr ? Cette action ne peut pas être annulée.',
            [
                {
                    style: 'cancel',
                    text: language === 'en' ? 'Cancel' : 'Annuler',
                },
                {
                    onPress: async () => {
                        try {
                            setIsResetting(true);
                            await container.storageService.clear();
                            resetStore();
                            setLanguage('en');
                            Alert.alert(
                                language === 'en' ? 'Success' : 'Succès',
                                language === 'en'
                                    ? 'All data has been reset successfully.'
                                    : 'Toutes les données ont été réinitialisées avec succès.',
                            );
                        } catch (error) {
                            Alert.alert(
                                language === 'en' ? 'Error' : 'Erreur',
                                language === 'en'
                                    ? 'Failed to reset data. Please try again.'
                                    : 'Échec de la réinitialisation des données. Veuillez réessayer.',
                            );
                        } finally {
                            setIsResetting(false);
                        }
                    },
                    style: 'destructive',
                    text: language === 'en' ? 'Reset' : 'Réinitialiser',
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
