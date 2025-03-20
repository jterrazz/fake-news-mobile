import React from 'react';
import { StyleSheet, View } from 'react-native';

import { CategoryLabel } from '../../atoms/typography/category-label.jsx';
import { Headline } from '../../atoms/typography/headline.jsx';
import { SIZES } from '../../sizes.jsx';

import { PublisherInfo } from './publisher-info.jsx';

interface ArticleHeaderProps {
    category: string;
    headline: string;
}

export function ArticleHeader({ category, headline }: ArticleHeaderProps) {
    return (
        <View style={styles.header}>
            <View style={styles.topRow}>
                <CategoryLabel>{category}</CategoryLabel>
            </View>
            <Headline style={styles.headline}>{headline}</Headline>
            <PublisherInfo />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#FFFFFF',
        borderBottomColor: 'rgba(0, 0, 0, 0.06)',
        borderBottomWidth: 1,
        elevation: 4,
        paddingBottom: SIZES.lg,
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.lg,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: {
            height: 2,
            width: 0,
        },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        zIndex: 3,
    },
    headline: {
        marginBottom: 12,
    },
    topRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
});
