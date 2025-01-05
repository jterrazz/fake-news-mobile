import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT_SIZES } from '@/presentation/constants/sizes';

interface TextButtonProps {
    children: React.ReactNode;
    onPress: () => void;
    variant?: 'primary' | 'correct' | 'incorrect';
    disabled?: boolean;
    size?: 'small' | 'full';
    style?: any;
}

export function TextButton({
    children,
    onPress,
    variant = 'primary',
    disabled = false,
    size = 'full',
    style,
}: TextButtonProps) {
    return (
        <View style={[styles.buttonWrapper, size === 'small' && styles.smallWrapper, style]}>
            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    styles[variant],
                    size === 'small' && styles.smallButton,
                    pressed && styles.buttonPressed,
                    disabled && styles.buttonDisabled,
                ]}
                onPress={onPress}
                disabled={disabled}
            >
                <View style={styles.buttonInner}>
                    <Text
                        style={[
                            styles.buttonText,
                            size === 'small' && styles.smallButtonText,
                            variant !== 'primary' && styles.buttonTextLight,
                        ]}
                    >
                        {children}
                    </Text>
                </View>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 3,
        borderColor: '#000000',
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
        fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
        fontSize: FONT_SIZES.sm,
        fontWeight: '700',
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
    correct: {
        backgroundColor: '#22C55E',
        borderBottomColor: '#167C3D',
        borderColor: '#1B9D4D',
    },
    incorrect: {
        backgroundColor: '#EF4444',
        borderBottomColor: '#B91C1C',
        borderColor: '#DC2626',
    },
    primary: {
        backgroundColor: '#FFFFFF',
        borderBottomColor: '#000000',
        borderColor: '#000000',
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
