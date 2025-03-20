import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Animated,
    Dimensions,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

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
    const scrollY = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();

    const headerOpacity = scrollY.interpolate({
        extrapolate: 'clamp',
        inputRange: [0, 40],
        outputRange: [1, 0],
    });

    const headerScale = scrollY.interpolate({
        extrapolate: 'clamp',
        inputRange: [0, 40],
        outputRange: [1, 0.8],
    });

    const headerStyle = {
        ...styles.header,
        paddingBottom: 8,
        paddingTop: Math.max(insets.top, 16),
    };

    const contentStyle = {
        ...styles.content,
        paddingTop: Platform.select({
            android: 24,
            ios: 24 + Math.max(insets.top - 20, 0),
        }),
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Animated.View
                style={[
                    headerStyle,
                    { opacity: headerOpacity, transform: [{ scale: headerScale }] },
                ]}
            >
                <Text style={styles.headerTitle}>{t('common:settings.title')}</Text>
                <LinearGradient
                    colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.8)']}
                    style={styles.headerGradient}
                />
            </Animated.View>

            <Animated.ScrollView
                style={styles.scrollView}
                contentContainerStyle={contentStyle}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
                    useNativeDriver: true,
                })}
                scrollEventThrottle={16}
            >
                {/* Preferences Group */}
                <View style={styles.group}>
                    <Text style={styles.groupTitle}>{t('common:settings.groups.preferences')}</Text>

                    <TouchableOpacity
                        style={styles.card}
                        activeOpacity={0.7}
                        onPress={onLanguageToggle}
                    >
                        <View style={styles.settingRow}>
                            <View>
                                <Text style={styles.settingLabel}>
                                    {t('common:settings.currentLanguage')}
                                </Text>
                                <Text style={styles.settingSubLabel}>
                                    {selectedLanguage === 'en' ? 'English (US)' : 'Français'}
                                </Text>
                            </View>

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
                                    <View style={styles.customToggleOption}>
                                        <Text
                                            style={[
                                                styles.customToggleText,
                                                selectedLanguage === 'fr' &&
                                                    styles.customToggleTextActive,
                                            ]}
                                        >
                                            FR
                                        </Text>
                                    </View>
                                    <View style={styles.customToggleOption}>
                                        <Text
                                            style={[
                                                styles.customToggleText,
                                                selectedLanguage === 'en' &&
                                                    styles.customToggleTextActive,
                                            ]}
                                        >
                                            US
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Information Group */}
                <View style={styles.group}>
                    <Text style={styles.groupTitle}>{t('common:settings.groups.information')}</Text>

                    <View style={styles.card}>
                        <Text style={styles.devNotesText}>
                            {t('common:settings.devNotes.content')}
                        </Text>
                    </View>
                </View>

                {/* Danger Zone Group */}
                <View style={[styles.group, styles.lastGroup]}>
                    <Text style={[styles.groupTitle, styles.dangerTitle]}>
                        {t('common:settings.dangerZone')}
                    </Text>

                    <TouchableOpacity
                        style={[styles.dangerCard, isResetting && styles.resetButtonDisabled]}
                        activeOpacity={0.7}
                        onPress={onReset}
                        disabled={isResetting}
                    >
                        <LinearGradient
                            colors={['#991B1B', '#7F1D1D']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.dangerGradient}
                        >
                            <Text style={styles.resetButtonText}>
                                {isResetting
                                    ? t('common:settings.reset.resetting')
                                    : t('common:settings.reset.title')}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </Animated.ScrollView>
        </SafeAreaView>
    );
}

function useSliderAnimation(isEn: boolean) {
    const slideAnim = useRef(new Animated.Value(isEn ? 1 : 0)).current;

    useEffect(() => {
        Animated.spring(slideAnim, {
            friction: 10,
            tension: 100,
            toValue: isEn ? 1 : 0,
            useNativeDriver: true,
        }).start();
    }, [isEn]);

    return slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 66],
    });
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        elevation: 2,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { height: 2, width: 0 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
    },
    content: {
        paddingBottom: 32,
        paddingHorizontal: 24,
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
        elevation: 3,
        height: 30,
        left: 3,
        position: 'absolute',
        shadowColor: '#000',
        shadowOffset: { height: 2, width: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        top: 3,
        width: 67,
    },
    customToggleText: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    customToggleTextActive: {
        color: '#FFFFFF',
    },
    dangerCard: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    dangerGradient: {
        alignItems: 'center',
        padding: 20,
    },
    dangerSection: {
        marginTop: 48,
    },
    dangerTitle: {
        color: '#991B1B',
    },
    devNotesText: {
        color: '#4B5563',
        fontSize: 15,
        letterSpacing: -0.3,
        lineHeight: 24,
    },
    group: {
        marginBottom: 24,
    },
    groupTitle: {
        color: '#6B7280',
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.8,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    header: {
        backgroundColor: 'white',
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 10,
    },
    headerGradient: {
        bottom: -12,
        height: 12,
        left: 0,
        position: 'absolute',
        right: 0,
    },
    headerTitle: {
        color: '#111827',
        fontSize: 32,
        fontWeight: '700',
        letterSpacing: -1,
        lineHeight: 38,
        textAlign: 'center',
    },
    languageToggleContainer: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    lastGroup: {
        marginBottom: 0,
    },
    lastSection: {
        marginBottom: 0,
    },
    resetButtonDisabled: {
        opacity: 0.5,
    },
    resetButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    safeArea: {
        backgroundColor: '#FFFFFF',
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    section: undefined,
    sectionHeader: undefined,
    sectionSubtitle: undefined,
    sectionTitle: undefined,
    settingLabel: {
        color: '#111827',
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 4,
    },
    settingRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    settingSubLabel: {
        color: '#6B7280',
        fontSize: 14,
    },
});
