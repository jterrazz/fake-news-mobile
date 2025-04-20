import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { format } from 'date-fns';

import { CategoryLabel } from '../../atoms/typography/category-label.jsx';
import { Headline } from '../../atoms/typography/headline.jsx';
import { SIZES } from '../../sizes.jsx';

interface ArticleHeaderProps {
    category: string;
    headline: string;
    isAnswered: boolean;
    isFake: boolean;
    date: Date;
}

export function ArticleHeader({
    category,
    headline,
    isAnswered,
    isFake,
    date,
}: ArticleHeaderProps) {
    return (
        <View style={styles.header}>
            <View style={styles.metadataRow}>
                <CategoryLabel>{category}</CategoryLabel>
                <Text style={styles.date}>{format(date, 'MMMM d, yyyy')}</Text>
            </View>
            <Headline style={styles.headline}>{headline}</Headline>
        </View>
    );
}

const styles = StyleSheet.create({
    date: {
        color: '#999999',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: SIZES.sm,
    },
    header: {},
    headline: {},
    metadataRow: {
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: SIZES.md,
    },
});
