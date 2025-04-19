import React, { useCallback, useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

const LETTER_ANIMATION_INTERVAL = 3000;
const LETTER_ANIMATION_DURATION = 300;
const GLITCH_OFFSET = 2;
const GLITCH_DURATION = 50;

interface AnimatedTitleProps {
    text: string;
}

export function AnimatedTitle({ text }: AnimatedTitleProps) {
    const [letterAnimations] = useState(() =>
        Array.from({ length: text.length }, () => ({
            isAnimating: false,
            offset: new Animated.ValueXY({ x: 0, y: 0 }),
            value: new Animated.Value(1),
        })),
    );

    const animateLetter = useCallback(
        (index: number) => {
            if (letterAnimations[index].isAnimating) return;

            letterAnimations[index].isAnimating = true;

            const xOffset = (Math.random() - 0.5) * GLITCH_OFFSET * 2;
            const yOffset = (Math.random() - 0.5) * GLITCH_OFFSET * 2;

            Animated.sequence([
                Animated.parallel([
                    Animated.timing(letterAnimations[index].value, {
                        duration: LETTER_ANIMATION_DURATION / 2,
                        easing: Easing.out(Easing.ease),
                        toValue: 1.2,
                        useNativeDriver: true,
                    }),
                    Animated.sequence([
                        Animated.timing(letterAnimations[index].offset, {
                            duration: GLITCH_DURATION,
                            easing: Easing.linear,
                            toValue: { x: xOffset, y: yOffset },
                            useNativeDriver: true,
                        }),
                        Animated.timing(letterAnimations[index].offset, {
                            duration: GLITCH_DURATION,
                            easing: Easing.linear,
                            toValue: { x: -xOffset, y: -yOffset },
                            useNativeDriver: true,
                        }),
                        Animated.timing(letterAnimations[index].offset, {
                            duration: GLITCH_DURATION,
                            easing: Easing.linear,
                            toValue: { x: 0, y: 0 },
                            useNativeDriver: true,
                        }),
                    ]),
                ]),
                Animated.timing(letterAnimations[index].value, {
                    duration: LETTER_ANIMATION_DURATION / 2,
                    easing: Easing.out(Easing.ease),
                    toValue: 1,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                letterAnimations[index].isAnimating = false;
            });
        },
        [letterAnimations],
    );

    useEffect(() => {
        const interval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * text.length);
            animateLetter(randomIndex);
        }, LETTER_ANIMATION_INTERVAL);

        return () => clearInterval(interval);
    }, [animateLetter, text.length]);

    return (
        <View style={styles.container}>
            {text.split('').map((letter, index) => (
                <Animated.Text
                    key={`${letter}-${index}`}
                    style={[
                        styles.letter,
                        {
                            transform: [
                                { scale: letterAnimations[index].value },
                                { translateX: letterAnimations[index].offset.x },
                                { translateY: letterAnimations[index].offset.y },
                            ],
                        },
                    ]}
                >
                    {letter}
                </Animated.Text>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    letter: {
        color: '#000000',
        fontFamily: 'BebasNeue-Regular',
        fontSize: 34,
        fontWeight: '900',
        letterSpacing: 1,
        textAlign: 'center',
    },
});
