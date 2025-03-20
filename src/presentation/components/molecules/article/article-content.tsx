import React from 'react';
import { StyleSheet, View } from 'react-native';
import Markdown from 'react-native-markdown-display';

import { SIZES } from '../../sizes.jsx';

interface ArticleContentProps {
    content: string;
}

export function ArticleContent({ content }: ArticleContentProps) {
    return (
        <View style={styles.container}>
            <Markdown style={markdownStyles}>{content}</Markdown>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.sm,
        position: 'relative',
        zIndex: 1,
    },
});

const markdownStyles = StyleSheet.create({
    blockquote: {
        borderLeftColor: '#E0E0E0',
        borderLeftWidth: 4,
        marginLeft: SIZES.sm,
        marginVertical: SIZES.sm,
        paddingLeft: SIZES.sm,
    },
    body: {
        color: '#000000',
        fontSize: 16,
        lineHeight: 24,
    },
    heading1: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: SIZES.sm,
    },
    heading2: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: SIZES.sm,
    },
    link: {
        color: '#007AFF',
    },
    list_item: {
        marginBottom: SIZES.xs,
    },
    paragraph: {
        marginBottom: SIZES.sm,
    },
});
