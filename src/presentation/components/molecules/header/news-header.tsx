import React from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, View } from 'react-native';
import ReAnimated, { AnimatedStyleProp } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

import { SafeArea } from '../../atoms/layout/safe-area.jsx';
import { AnimatedTitle } from '../../atoms/typography/animated-title.jsx';

import { HeaderTabs } from './header-tabs.jsx';
import { ScoreDisplay } from './score-display.jsx';
import { SIZES } from '@/presentation/components/sizes.js';

interface NewsHeaderProps {
    activeTab: 'latest' | 'to-read';
    onTabChange: (tab: 'latest' | 'to-read') => void;
    score: { score: number; streak: number };
    headerAnimatedStyle: AnimatedStyleProp<any>;
    titleAnimatedStyle: AnimatedStyleProp<any>;
}

export function NewsHeader({
    activeTab,
    onTabChange,
    score,
    headerAnimatedStyle,
    titleAnimatedStyle,
}: NewsHeaderProps) {
    const { t } = useTranslation();

    return (
        <BlurView intensity={95} tint="extraLight" style={[styles.headerBlur, headerAnimatedStyle]}>
            <SafeArea style={styles.headerContent}>
                <ReAnimated.View style={[styles.titleContainer, titleAnimatedStyle]}>
                    <AnimatedTitle text={t('common:newsFeed.title')} />
                </ReAnimated.View>
                <View style={styles.headerContentInner}>
                    <HeaderTabs activeTab={activeTab} onTabChange={onTabChange} />
                    <ScoreDisplay score={score.score} streak={score.streak} />
                </View>
            </SafeArea>
        </BlurView>
    );
}

const styles = StyleSheet.create({
    headerBlur: {
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
        borderBottomWidth: 1,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 10,
    },
    headerContent: {
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 44 : 28,
    },
    headerContentInner: {
        alignItems: 'center',
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: SIZES.xs,
        paddingHorizontal: SIZES.xl + SIZES['2xs'],
    },
    titleContainer: {
        marginBottom: 16,
        width: '100%',
    },
});
