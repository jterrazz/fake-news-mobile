import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Animated,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

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
    const { t } = useTranslation();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('common:settings.title')}</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('common:settings.language')}</Text>
                        <Text style={styles.sectionSubtitle}>Choose your preferred language</Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.settingRow}>
                            <Text style={styles.settingLabel}>
                                {t('common:settings.currentLanguage')}
                            </Text>
                            <View style={styles.languageToggleContainer}>
                                <View style={styles.customToggle}>
                                    <Animated.View
                                        style={[
                                            styles.customToggleSlider,
                                            {
                                                transform: [
                                                    {
                                                        translateX: useSliderAnimation(
                                                            selectedLanguage === 'en',
                                                        ),
                                                    },
                                                ],
                                            },
                                        ]}
                                    />
                                    <TouchableOpacity
                                        style={styles.customToggleOption}
                                        onPress={() =>
                                            selectedLanguage === 'en' && onLanguageToggle()
                                        }
                                    >
                                        <Text
                                            style={[
                                                styles.customToggleText,
                                                selectedLanguage === 'fr' &&
                                                    styles.customToggleTextActive,
                                            ]}
                                        >
                                            FR
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.customToggleOption}
                                        onPress={() =>
                                            selectedLanguage === 'fr' && onLanguageToggle()
                                        }
                                    >
                                        <Text
                                            style={[
                                                styles.customToggleText,
                                                selectedLanguage === 'en' &&
                                                    styles.customToggleTextActive,
                                            ]}
                                        >
                                            US
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={[styles.section, styles.dangerSection]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, styles.dangerTitle]}>
                            {t('common:settings.dangerZone')}
                        </Text>
                        <Text style={styles.sectionSubtitle}>Actions that cannot be undone</Text>
                    </View>

                    <View style={styles.dangerCard}>
                        <TouchableOpacity
                            style={[styles.resetButton, isResetting && styles.resetButtonDisabled]}
                            onPress={onReset}
                            disabled={isResetting}
                        >
                            <Text style={styles.resetButtonText}>
                                {isResetting
                                    ? t('common:settings.reset.resetting')
                                    : t('common:settings.reset.title')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.section, styles.lastSection]}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            {t('common:settings.devNotes.title')}
                        </Text>
                        <Text style={styles.sectionSubtitle}>Information for developers</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.devNotesText}>
                            {t('common:settings.devNotes.content')}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function useSliderAnimation(isEn: boolean) {
    const slideAnim = useRef(new Animated.Value(isEn ? 1 : 0)).current;

    useEffect(() => {
        Animated.spring(slideAnim, {
            friction: 8,
            tension: 50,
            toValue: isEn ? 1 : 0,
            useNativeDriver: true,
        }).start();
    }, [isEn]);

    return slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 80],
    });
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderColor: '#F3F4F6',
        borderRadius: 12,
        borderWidth: 1,
        elevation: 2,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    content: {
        paddingBottom: 40,
        paddingHorizontal: 20,
        paddingTop: 32,
    },
    customToggle: {
        backgroundColor: '#F3F4F6',
        borderRadius: 30,
        flexDirection: 'row',
        height: 36,
        padding: 3,
        position: 'relative',
        width: 140,
    },
    customToggleOption: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        zIndex: 1,
    },
    customToggleSlider: {
        backgroundColor: '#111827',
        borderRadius: 28,
        height: 30,
        left: 3,
        position: 'absolute',
        top: 3,
        width: 67,
    },
    customToggleText: {
        color: '#6B7280',
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    customToggleTextActive: {
        color: '#FFFFFF',
    },
    dangerCard: {
        backgroundColor: '#FEF2F2',
        borderColor: '#FEE2E2',
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
    },
    dangerSection: {
        marginTop: 48,
    },
    dangerTitle: {
        color: '#991B1B',
    },
    devNotesText: {
        color: '#4B5563',
        fontSize: 14,
        lineHeight: 22,
    },
    header: {
        borderBottomColor: '#F3F4F6',
        borderBottomWidth: 1,
        paddingVertical: 24,
    },
    headerTitle: {
        color: '#111827',
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -0.5,
        textAlign: 'center',
    },
    languageToggleContainer: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    lastSection: {
        marginBottom: 0,
    },
    resetButton: {
        alignItems: 'center',
        backgroundColor: '#991B1B',
        borderRadius: 8,
        paddingVertical: 12,
    },
    resetButtonDisabled: {
        opacity: 0.5,
    },
    resetButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    safeArea: {
        backgroundColor: '#FFFFFF',
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    section: {
        marginBottom: 40,
    },
    sectionHeader: {
        marginBottom: 16,
    },
    sectionSubtitle: {
        color: '#6B7280',
        fontSize: 14,
        letterSpacing: -0.1,
    },
    sectionTitle: {
        color: '#111827',
        fontSize: 20,
        fontWeight: '600',
        letterSpacing: -0.3,
        marginBottom: 4,
    },
    settingLabel: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '500',
    },
    settingRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});
