import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { clearAllStorage } from '../services/storage.service.js';
import { useNewsStore } from '../store/news.js';

type Language = 'en' | 'fr';

// Mock data for the reading stats
const mockStats = {
    en: {
        lastWeek: 8,
        subtitle: 'Articles read per week',
        thisWeek: 12,
        title: 'Reading Stats',
    },
    fr: {
        lastWeek: 8,
        subtitle: 'Articles lus par semaine',
        thisWeek: 12,
        title: 'Statistiques de lecture',
    },
};

export function SettingsScreen() {
    const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
    const [isResetting, setIsResetting] = useState(false);
    const resetStore = useNewsStore((state) => state.resetStore);

    const toggleLanguage = () => {
        setSelectedLanguage((prev) => (prev === 'en' ? 'fr' : 'en'));
    };

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
                            await clearAllStorage();
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
                            setIsResetting(false);
                        }
                    },
                    style: 'destructive',
                    text: selectedLanguage === 'en' ? 'Reset' : 'Réinitialiser',
                },
            ],
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>
                    {selectedLanguage === 'en' ? 'Settings' : 'Paramètres'}
                </Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {selectedLanguage === 'en' ? 'Language Settings' : 'Paramètres de langue'}
                    </Text>

                    <View style={styles.languageContainer}>
                        <Text style={styles.label}>
                            {selectedLanguage === 'en' ? 'Current Language:' : 'Langue actuelle:'}
                        </Text>

                        <TouchableOpacity style={styles.languageButton} onPress={toggleLanguage}>
                            <Text style={styles.buttonText}>
                                {selectedLanguage === 'en' ? 'English' : 'Français'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {selectedLanguage === 'en' ? mockStats.en.title : mockStats.fr.title}
                    </Text>

                    <View style={styles.statsContainer}>
                        <Text style={styles.statsSubtitle}>
                            {selectedLanguage === 'en'
                                ? mockStats.en.subtitle
                                : mockStats.fr.subtitle}
                        </Text>

                        <View style={styles.graphContainer}>
                            <View style={styles.barGroup}>
                                <View
                                    style={[
                                        styles.bar,
                                        { height: mockStats[selectedLanguage].lastWeek * 10 },
                                    ]}
                                />
                                <Text style={styles.barLabel}>
                                    {selectedLanguage === 'en' ? 'Last Week' : 'Sem. dernière'}
                                </Text>
                                <Text style={styles.barValue}>
                                    {mockStats[selectedLanguage].lastWeek}
                                </Text>
                            </View>

                            <View style={styles.barGroup}>
                                <View
                                    style={[
                                        styles.bar,
                                        { height: mockStats[selectedLanguage].thisWeek * 10 },
                                    ]}
                                />
                                <Text style={styles.barLabel}>
                                    {selectedLanguage === 'en' ? 'This Week' : 'Cette sem.'}
                                </Text>
                                <Text style={styles.barValue}>
                                    {mockStats[selectedLanguage].thisWeek}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.dangerZone}>
                    <Text style={styles.dangerTitle}>
                        {selectedLanguage === 'en' ? 'Danger Zone' : 'Zone dangereuse'}
                    </Text>
                    <TouchableOpacity
                        style={[styles.resetButton, isResetting && styles.resetButtonDisabled]}
                        onPress={handleReset}
                        disabled={isResetting}
                    >
                        <Text style={styles.resetButtonText}>
                            {isResetting
                                ? selectedLanguage === 'en'
                                    ? 'Resetting...'
                                    : 'Réinitialisation...'
                                : selectedLanguage === 'en'
                                  ? 'Reset Everything'
                                  : 'Réinitialiser tout'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.devNotesContainer}>
                    <Text style={styles.devNotesTitle}>
                        {selectedLanguage === 'en' ? 'Developer Notes' : 'Notes du développeur'}
                    </Text>
                    <Text style={styles.devNotesText}>
                        {selectedLanguage === 'en'
                            ? 'I created this app to help people stay informed about the latest news while encouraging critical thinking through interactive questions. My goal is to promote media literacy and thoughtful engagement with current events.'
                            : "J'ai créé cette application pour aider les gens à rester informés des dernières actualités tout en encourageant la pensée critique à travers des questions interactives. Mon objectif est de promouvoir l'éducation aux médias et l'engagement réfléchi avec l'actualité."}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    bar: {
        backgroundColor: 'black',
        borderRadius: 4,
        width: 40,
    },
    barGroup: {
        alignItems: 'center',
        width: 60,
    },
    barLabel: {
        color: '#666',
        fontSize: 12,
        marginTop: 8,
        textAlign: 'center',
    },
    barValue: {
        color: 'black',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 4,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    content: {
        paddingBottom: 24,
        paddingHorizontal: 16,
    },
    dangerTitle: {
        color: 'black',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    dangerZone: {
        backgroundColor: '#FFF1F0',
        borderColor: '#FFE4E6',
        borderRadius: 8,
        borderWidth: 1,
        marginTop: 32,
        padding: 16,
    },
    devNotesContainer: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        marginTop: 32,
        padding: 16,
    },
    devNotesText: {
        color: '#374151',
        fontSize: 14,
        lineHeight: 20,
    },
    devNotesTitle: {
        color: 'black',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    graphContainer: {
        alignItems: 'flex-end',
        flexDirection: 'row',
        height: 160,
        justifyContent: 'space-around',
        paddingVertical: 20,
    },
    header: {
        borderBottomColor: '#E5E7EB',
        borderBottomWidth: 1,
        marginBottom: 16,
        paddingVertical: 16,
    },
    headerTitle: {
        color: 'black',
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
    },
    languageButton: {
        backgroundColor: 'black',
        borderRadius: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    languageContainer: {
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
    },
    resetButton: {
        alignItems: 'center',
        backgroundColor: 'black',
        borderRadius: 6,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    resetButtonDisabled: {
        opacity: 0.5,
    },
    resetButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    safeArea: {
        backgroundColor: '#FFFFFF',
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
    },
    statsContainer: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 16,
    },
    statsSubtitle: {
        color: '#666',
        fontSize: 14,
        marginBottom: 16,
    },
});
