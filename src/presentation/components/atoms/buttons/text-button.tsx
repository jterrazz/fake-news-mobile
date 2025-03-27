import React from 'react';
import { Animated, Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { FONT_SIZES } from '@/presentation/components/sizes';
import { FONT_FAMILY } from '@/presentation/theme/typography';

interface TextButtonProps {
    children: React.ReactNode;
    onPress: () => void;
    variant?: 'primary' | 'correct' | 'incorrect';
    disabled?: boolean;
    size?: 'small' | 'full';
    style?: ViewStyle;
}

export function TextButton({
    children,
    onPress,
    variant = 'primary',
    disabled = false,
    size = 'full',
    style,
}: TextButtonProps) {
    // Create animated values for background color and border color
    const [animation] = React.useState(() => new Animated.Value(0));

    React.useEffect(() => {
        Animated.timing(animation, {
            duration: 400,
            toValue: variant === 'primary' ? 0 : 1,
            useNativeDriver: false,
        }).start();
    }, [variant]);

    const backgroundColor = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [
            '#FFFFFF',
            variant === 'correct' ? '#22C55E' : variant === 'incorrect' ? '#EF4444' : '#FFFFFF',
        ],
    });

    const borderColor = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [
            '#000000',
            variant === 'correct' ? '#1B9D4D' : variant === 'incorrect' ? '#DC2626' : '#000000',
        ],
    });

    const borderBottomColor = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [
            '#000000',
            variant === 'correct' ? '#167C3D' : variant === 'incorrect' ? '#B91C1C' : '#000000',
        ],
    });

    return (
        <View style={[styles.buttonWrapper, size === 'small' && styles.smallWrapper, style]}>
            <Pressable
                onPress={onPress}
                disabled={disabled}
                style={({ pressed }) => [
                    size === 'small' && styles.smallButton,
                    pressed && styles.buttonPressed,
                    disabled && styles.buttonDisabled,
                ]}
            >
                <Animated.View
                    style={[
                        styles.button,
                        {
                            backgroundColor,
                            borderBottomColor,
                            borderColor,
                        },
                    ]}
                >
                    <View style={styles.buttonInner}>
                        <Animated.Text
                            style={[
                                styles.buttonText,
                                size === 'small' && styles.smallButtonText,
                                {
                                    color: animation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['#000000', '#FFFFFF'],
                                    }),
                                },
                            ]}
                        >
                            {children}
                        </Animated.Text>
                    </View>
                </Animated.View>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        borderBottomWidth: 3,
        borderRadius: 10,
        borderWidth: 1.5,
        elevation: 3,
        height: 48,
        overflow: 'hidden',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: {
            height: 2,
            width: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        width: '100%',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonInner: {
        alignItems: 'center',
        flexDirection: 'row',
        height: '100%',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    buttonPressed: {
        transform: [{ scale: 0.98 }],
    },
    buttonText: {
        color: '#000000',
        fontFamily: FONT_FAMILY.bold,
        fontSize: FONT_SIZES.sm,
        letterSpacing: 2,
        lineHeight: 48,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.05)',
        textShadowOffset: { height: 1, width: 0 },
        textShadowRadius: 1,
    },
    buttonTextLight: {
        color: '#FFFFFF',
    },
    buttonWrapper: {
        position: 'relative',
        width: '100%',
    },
    smallButton: {
        minWidth: 120,
        width: 'auto',
    },
    smallButtonText: {
        fontSize: FONT_SIZES.sm - 1,
        letterSpacing: 1.5,
        lineHeight: 46,
    },
    smallWrapper: {
        width: 'auto',
    },
});
