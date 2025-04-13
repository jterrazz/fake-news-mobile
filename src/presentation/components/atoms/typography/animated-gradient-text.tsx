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
    const regex = /\*\*(.*?)\*\*/g;
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
                duration: 8000,
                // Slower, smoother
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

    const pastel = ['#C7A0DD', '#D4B0EA', '#E6C0A0', '#EED1B0', '#F1DFA0'];
    const repeated = Array(repeatFactor).fill(pastel).flat();
    const gradientColors = [...repeated, repeated[0]]; // seamless wrap

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
                    <Text style={[style, { backgroundColor: 'transparent' }]}>
                        {parts.map((part, i) => (
                            <Text key={i} style={{ opacity: part.gradient ? 1 : 0 }}>
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
