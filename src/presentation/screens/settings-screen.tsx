import React, { useState } from 'react';
import { Alert } from 'react-native';

import { useNewsStore } from '@/application/store/news.store';

import { container } from '@/core/container';
import { SettingsTemplate } from '@/presentation/components/templates/settings-template';

type Language = 'en' | 'fr';

export function SettingsScreen() {
    const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
    const [isResetting, setIsResetting] = useState(false);
    const resetStore = useNewsStore((state) => state.resetStore);

    const handleReset = () => {
        Alert.alert(
            selectedLanguage === 'en' ? 'Reset Everything' : 'Réinitialiser tout',
            selectedLanguage === 'en'
                ? 'Are you sure? This action cannot be undone.'
                : 'Êtes-vous sûr ? Cette action ne peut pas être annulée.',
            [
                {
                    style: 'cancel',
                    text: selectedLanguage === 'en' ? 'Cancel' : 'Annuler',
                },
                {
                    onPress: async () => {
                        try {
                            setIsResetting(true);
                            await container.storageService.clear();
                            resetStore();
                            setSelectedLanguage('en');
                            Alert.alert(
                                selectedLanguage === 'en' ? 'Success' : 'Succès',
                                selectedLanguage === 'en'
                                    ? 'All data has been reset successfully.'
                                    : 'Toutes les données ont été réinitialisées avec succès.',
                            );
                        } catch (error) {
                            Alert.alert(
                                selectedLanguage === 'en' ? 'Error' : 'Erreur',
                                selectedLanguage === 'en'
                                    ? 'Failed to reset data. Please try again.'
                                    : 'Échec de la réinitialisation des données. Veuillez réessayer.',
                            );
                        } finally {
                            setIsRefreshing(false);
                        }
                    },
                    style: 'destructive',
                    text: selectedLanguage === 'en' ? 'Reset' : 'Réinitialiser',
                },
            ],
        );
    };

    const handleLanguageToggle = () => {
        setSelectedLanguage((prev) => (prev === 'en' ? 'fr' : 'en'));
    };

    return (
        <SettingsTemplate
            selectedLanguage={selectedLanguage}
            isResetting={isResetting}
            onLanguageToggle={handleLanguageToggle}
            onReset={handleReset}
        />
    );
}
