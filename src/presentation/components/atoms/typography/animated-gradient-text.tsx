import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    LayoutChangeEvent,
    StyleSheet,
    Text,
    TextStyle,
    View,
} from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
    children: string;
    style?: TextStyle;
}

const extractParts = (text: string) => {
    const regex = /%%\[([^\]]+)\]\([^)]+\)/g;
    const parts: { text: string; gradient: boolean }[] = [];

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text))) {
        if (match.index > lastIndex) {
            parts.push({ gradient: false, text: text.substring(lastIndex, match.index) });
        }
        parts.push({ gradient: true, text: match[1] });
        lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
        parts.push({ gradient: false, text: text.substring(lastIndex) });
    }

    return parts;
};

export function GradientTextMask({ children, style }: Props) {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const [textHeight, setTextHeight] = useState(style?.fontSize ?? 16);

    const gradientWidth = 800; // Visible width
    const repeatFactor = 3; // How many times to repeat the color cycle
    const totalWidth = gradientWidth * repeatFactor;

    useEffect(() => {
        Animated.loop(
            Animated.timing(animatedValue, {
                duration: 7000,
                easing: Easing.linear,
                toValue: 1,
                useNativeDriver: true,
            }),
        ).start();
    }, []);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -gradientWidth], // Only animate by visible area
    });

    // Smooth multi-color AI gradient with perfect loop
    const baseColors = ['#6366F1', '#8B5CF6', '#A78BFA', '#EC4899', '#6366F1'] as const;
    const repeated = Array(repeatFactor)
        .fill([...baseColors])
        .flat();
    const gradientColors: [string, string, ...string[]] = [
        '#6366F1',
        '#8B5CF6',
        ...repeated.slice(2),
        '#6366F1',
    ];

    const parts = extractParts(children);

    const onLayout = (e: LayoutChangeEvent) => {
        const height = e.nativeEvent.layout.height;
        if (height > 0) {
            setTextHeight(height);
        }
    };

    return (
        <View style={{ position: 'relative' }}>
            {/* Base text layer */}
            <Text style={style} onLayout={onLayout}>
                {parts.map((part, i) => (
                    <Text key={i} style={style}>
                        {part.text}
                    </Text>
                ))}
            </Text>

            {/* Masked gradient layer */}
            <MaskedView
                style={StyleSheet.absoluteFill}
                maskElement={
                    <Text
                        style={[
                            style,
                            {
                                backgroundColor: 'transparent',
                                textShadowColor: 'white',
                                // Very subtle blur
                                textShadowOffset: { height: 0, width: 0 },
                                textShadowRadius: 0.3,
                            },
                        ]}
                    >
                        {parts.map((part, i) => (
                            <Text
                                key={i}
                                style={{
                                    color: part.gradient ? 'white' : 'transparent',
                                    textShadowColor: 'white',
                                    // Very subtle blur
                                    textShadowOffset: { height: 0, width: 0 },
                                    textShadowRadius: 0.3,
                                }}
                            >
                                {part.text}
                            </Text>
                        ))}
                    </Text>
                }
            >
                <Animated.View style={{ transform: [{ translateX }] }}>
                    <LinearGradient
                        colors={gradientColors}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={{
                            height: textHeight,
                            width: totalWidth,
                        }}
                    />
                </Animated.View>
            </MaskedView>
        </View>
    );
}
