import React from 'react';
import { StyleSheet, View } from 'react-native';

import { GradientTextMask } from '../../atoms/typography/animated-gradient-text.js';
import { SIZES } from '../../sizes.jsx';

interface ArticleContentProps {
    contentWithAnnotations: string;
    wasCorrect?: boolean | null;
}

export function ArticleContent({ contentWithAnnotations, wasCorrect }: ArticleContentProps) {
    return (
        <View style={styles.container}>
            <GradientTextMask
                style={{ fontSize: 15, fontWeight: '500', lineHeight: 24 }}
                theme={'failed'}
            >
                {contentWithAnnotations}
            </GradientTextMask>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.md,
        position: 'relative',
        zIndex: 1,
    },
});
