import React from 'react';
import { StyleSheet, View } from 'react-native';

import { GradientTextMask } from '../../atoms/typography/animated-gradient-text.js';

interface ArticleContentProps {
    contentWithAnnotations: string;
    showInlineAnnotations: boolean;
}

export function ArticleContent({
    contentWithAnnotations,
    showInlineAnnotations,
}: ArticleContentProps) {
    const text = showInlineAnnotations
        ? contentWithAnnotations
        : contentWithAnnotations.replace(/%%\[([^\]]+)\]\([^)]+\)/g, '$1');
    return (
        <View style={styles.container}>
            <GradientTextMask
                style={{ fontSize: 15, fontWeight: '500', lineHeight: 21 }}
                theme={'failed'}
            >
                {text}
            </GradientTextMask>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {},
});
