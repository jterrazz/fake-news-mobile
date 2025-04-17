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

interface TextPart {
    text: string;
    gradient: boolean;
    bold: boolean;
}

const processNextMarker = (
    text: string,
    currentIndex: number,
    gradientMatch: RegExpMatchArray | null,
    boldMatch: RegExpMatchArray | null,
): { parts: TextPart[]; newIndex: number } => {
    const parts: TextPart[] = [];
    const gradientIndex = gradientMatch ? gradientMatch.index! + currentIndex : Infinity;
    const boldIndex = boldMatch ? boldMatch.index! + currentIndex : Infinity;

    // Process the closest marker
    if (gradientIndex < boldIndex) {
        // Add text before gradient if any
        if (gradientIndex > currentIndex) {
            parts.push({
                bold: false,
                gradient: false,
                text: text.slice(currentIndex, gradientIndex),
            });
        }
        // Add gradient text
        parts.push({
            bold: false,
            gradient: true,
            text: gradientMatch![1],
        });
        return { newIndex: gradientIndex + gradientMatch![0].length, parts };
    } else {
        // Add text before bold if any
        if (boldIndex > currentIndex) {
            parts.push({
                bold: false,
                gradient: false,
                text: text.slice(currentIndex, boldIndex),
            });
        }
        // Add bold text
        parts.push({
            bold: true,
            gradient: false,
            text: boldMatch![1],
        });
        return { newIndex: boldIndex + boldMatch![0].length, parts };
    }
};

const extractParts = (text: string): TextPart[] => {
    const parts: TextPart[] = [];
    let currentIndex = 0;

    while (currentIndex < text.length) {
        // Look for the next special marker
        const gradientMatch = text.slice(currentIndex).match(/%%\[([^\]]+)\]\([^)]+\)/);
        const boldMatch = text.slice(currentIndex).match(/\*\*([^*]+)\*\*/);

        // No more special markers found
        if (!gradientMatch && !boldMatch) {
            parts.push({ bold: false, gradient: false, text: text.slice(currentIndex) });
            break;
        }

        const { parts: newParts, newIndex } = processNextMarker(
            text,
            currentIndex,
            gradientMatch,
            boldMatch,
        );
        parts.push(...newParts);
        currentIndex = newIndex;
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

    const renderText = (part: TextPart, baseStyle: TextStyle | undefined) => (
        <Text style={[baseStyle, part.bold && { fontWeight: '700' }]}>{part.text}</Text>
    );

    return (
        <View style={{ position: 'relative' }}>
            {/* Base text layer */}
            <Text style={style} onLayout={onLayout}>
                {parts.map((part, i) => (
                    <Text key={i}>{renderText(part, style)}</Text>
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
                                    textShadowOffset: { height: 0, width: 0 },
                                    textShadowRadius: 0.3,
                                }}
                            >
                                {renderText(part, style)}
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
