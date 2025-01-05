import React from 'react';
import { StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';

import { TabBarComponent } from './tab-bar-component.js';

const TAB_BAR_CONFIG = {
    borderRadius: 16,
    bottomOffset: 42,
    height: 60,
    width: 500,
} as const;

export const TabBar = ({ state, navigation, descriptors }: BottomTabBarProps) => (
    <BlurView intensity={30} tint="extraLight" style={styles.container}>
        <TabBarComponent
            state={state}
            navigation={navigation}
            descriptors={descriptors}
            config={TAB_BAR_CONFIG}
        />
    </BlurView>
);

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderColor: 'rgba(148, 163, 184, 0.08)',
        borderRadius: TAB_BAR_CONFIG.borderRadius,
        borderWidth: 1,
        bottom: TAB_BAR_CONFIG.bottomOffset,
        elevation: 8,
        height: TAB_BAR_CONFIG.height,
        left: '50%',
        overflow: 'hidden',
        position: 'absolute',
        shadowColor: '#000',
        shadowOffset: {
            height: 8,
            width: 0,
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        transform: [{ translateX: -TAB_BAR_CONFIG.width / 2 }],

        width: TAB_BAR_CONFIG.width,
    },
});
