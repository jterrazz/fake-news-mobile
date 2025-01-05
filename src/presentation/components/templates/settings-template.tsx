import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SettingsTemplateProps {
    selectedLanguage: 'en' | 'fr';
    isResetting: boolean;
    onLanguageToggle: () => void;
    onReset: () => void;
}

export function SettingsTemplate({
    selectedLanguage,
    isResetting,
    onLanguageToggle,
    onReset,
}: SettingsTemplateProps) {
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

                        <TouchableOpacity style={styles.languageButton} onPress={onLanguageToggle}>
                            <Text style={styles.buttonText}>
                                {selectedLanguage === 'en' ? 'English' : 'Français'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.dangerZone}>
                    <Text style={styles.dangerTitle}>
                        {selectedLanguage === 'en' ? 'Danger Zone' : 'Zone dangereuse'}
                    </Text>
                    <TouchableOpacity
                        style={[styles.resetButton, isResetting && styles.resetButtonDisabled]}
                        onPress={onReset}
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
});
