import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import ReAnimated, {
    AnimatedStyleProp,
    interpolate,
    SharedValue,
    useAnimatedStyle,
} from 'react-native-reanimated';
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
    headerAnimatedStyle: AnimatedStyleProp<{ transform: { translateY: number }[] }>;
    titleAnimatedStyle: AnimatedStyleProp<{ transform: { translateY: number }[] }>;
    scrollY: SharedValue<number>;
}

import CheckMark from '../../../../../assets/icons/app-transparent-dark.png';

export function NewsHeader({
    activeTab,
    onTabChange,
    score,
    headerAnimatedStyle,
    titleAnimatedStyle,
    scrollY,
}: NewsHeaderProps) {
    const { t } = useTranslation();

    const logoAnimatedStyle = useAnimatedStyle(() => {
        const progress = interpolate(scrollY.value, [0, 50], [0, 1], 'clamp');

        const translateY = interpolate(progress, [0, 1], [5, 0], 'clamp');

        const scale = interpolate(progress, [0, 1], [0.9, 1], 'clamp');

        return {
            opacity: progress,
            transform: [{ translateX: -48 }, { scale }, { translateY }],
        } as const;
    });

    const titleAnimatedStyle2 = useAnimatedStyle(() => {
        const progress = interpolate(scrollY.value, [0, 50], [1, 0], 'clamp');

        const translateY = interpolate(progress, [0, 1], [0, -5], 'clamp');

        const scale = interpolate(progress, [0, 1], [1, 0.9], 'clamp');

        return {
            opacity: progress,
            transform: [{ scale }, { translateY }],
        } as const;
    });

    return (
        <BlurView intensity={95} tint="extraLight" style={[styles.headerBlur, headerAnimatedStyle]}>
            <SafeArea style={styles.headerContent}>
                <View style={styles.titleContainer}>
                    <View style={styles.titleOverlapContainer}>
                        <ReAnimated.View style={[styles.titleWrapper, titleAnimatedStyle2]}>
                            <AnimatedTitle text={t('common:newsFeed.title')} />
                        </ReAnimated.View>
                        <ReAnimated.Image
                            source={CheckMark}
                            style={[styles.logo, logoAnimatedStyle]}
                        />
                    </View>
                </View>
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
    headerContent: {},
    headerContentInner: {
        alignItems: 'center',
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: SIZES.xs,
        paddingHorizontal: SIZES.xl + SIZES['2xs'],
    },
    logo: {
        height: 30,
        left: '50%',
        position: 'absolute',
        top: '50%',
        width: 96,
    },
    titleContainer: {
        alignItems: 'center',
        marginVertical: SIZES.sm,
        width: '100%',
    },
    titleOverlapContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SIZES.md,
        position: 'relative',
        width: '100%',
    },
    titleWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: '50%',

        width: '100%',
    },
});
