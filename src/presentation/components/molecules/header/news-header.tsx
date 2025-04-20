import React from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, View } from 'react-native';
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
        const opacity = interpolate(scrollY.value, [0, 50], [0, 1], 'clamp');

        return {
            opacity,
            transform: [{ translateX: -48 }],
        };
    });

    const titleAnimatedStyle2 = useAnimatedStyle(() => {
        const opacity = interpolate(scrollY.value, [0, 50], [1, 0], 'clamp');

        return {
            opacity,
        };
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
    logo: {
        height: 30,
        left: '50%',
        position: 'absolute',
        width: 96,
    },
    titleContainer: {
        alignItems: 'center',
        marginVertical: SIZES.sm,
        width: '100%',
    },
    titleOverlapContainer: {
        alignItems: 'center',
        height: 30,
        justifyContent: 'center',
        position: 'relative',
        width: '100%',
    },
    titleWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        width: '100%',
    },
});
