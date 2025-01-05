import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SIZES } from '../../sizes.js';

interface HeaderTabsProps {
    activeTab: 'latest' | 'to-read';
    onTabChange: (tab: 'latest' | 'to-read') => void;
}

export function HeaderTabs({ activeTab, onTabChange }: HeaderTabsProps) {
    return (
        <View style={styles.container}>
            <Pressable style={styles.tab} onPress={() => onTabChange('latest')}>
                <Text style={[styles.tabText, activeTab === 'latest' && styles.tabTextActive]}>
                    Latest
                </Text>
                {activeTab === 'latest' && <View style={styles.activeIndicator} />}
            </Pressable>
            <Pressable style={styles.tab} onPress={() => onTabChange('to-read')}>
                <Text style={[styles.tabText, activeTab === 'to-read' && styles.tabTextActive]}>
                    To Read
                </Text>
                {activeTab === 'to-read' && <View style={styles.activeIndicator} />}
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    activeIndicator: {
        backgroundColor: '#000000',
        borderRadius: 1,
        bottom: -9,
        height: 2,
        left: 0,
        position: 'absolute',
        right: 0,
    },
    container: {
        flexDirection: 'row',
        gap: SIZES.lg,
    },
    tab: {
        paddingVertical: 5,
        position: 'relative',
    },
    tabText: {
        color: '#666666',
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    tabTextActive: {
        color: '#000000',
    },
});
