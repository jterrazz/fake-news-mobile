import React from 'react';
import { StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';

import { TabBarComponent } from './TabBarComponent.jsx';

const TAB_BAR_CONFIG = {
    borderRadius: 27,
    bottomOffset: 42,
    height: 54,
    width: 114,
} as const;

export const TabBar = ({ state, navigation, descriptors }: BottomTabBarProps) => (
    <BlurView intensity={35} tint="extraLight" style={styles.container}>
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
        borderColor: 'rgba(0, 0, 0, 0.06)',
        borderRadius: TAB_BAR_CONFIG.borderRadius,
        borderWidth: 1,
        bottom: TAB_BAR_CONFIG.bottomOffset,
        height: TAB_BAR_CONFIG.height,
        left: '50%',
        overflow: 'hidden',
        position: 'absolute',
        shadowColor: '#000',
        shadowOffset: { height: 8, width: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        transform: [{ translateX: -TAB_BAR_CONFIG.width / 2 }],
        width: TAB_BAR_CONFIG.width,
    },
});
