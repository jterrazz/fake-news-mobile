import React from 'react';
import { StyleSheet, View } from 'react-native';

import { SIZES } from '../../../constants/sizes.js';
import { Body } from '../../atoms/typography/body.jsx';

interface ArticleContentProps {
    content: string;
}

export function ArticleContent({ content }: ArticleContentProps) {
    return (
        <View style={styles.container}>
            <Body size="medium">{content}</Body>
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