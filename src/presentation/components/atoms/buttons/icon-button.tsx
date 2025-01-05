import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface IconButtonProps {
    icon: keyof typeof Feather.glyphMap;
    onPress: () => void;
    size?: 'small' | 'medium' | 'large';
    variant?: 'primary' | 'secondary';
    disabled?: boolean;
    style?: ViewStyle;
}

export function IconButton({
    icon,
    onPress,
    size = 'medium',
    variant = 'primary',
    disabled = false,
    style,
}: IconButtonProps) {
    const iconSize = {
        large: 24,
        medium: 18,
        small: 16,
    }[size];

    const buttonSize = {
        large: 48,
        medium: 36,
        small: 32,
    }[size];

    return (
        <Pressable
            style={({ pressed }) => [
                styles.button,
                styles[variant],
                {
                    height: buttonSize,
                    width: buttonSize,
                },
                pressed && styles.buttonPressed,
                disabled && styles.buttonDisabled,
                style,
            ]}
            onPress={onPress}
            disabled={disabled}
        >
            <Feather
                name={icon}
                size={iconSize}
                color={variant === 'primary' ? '#FFFFFF' : '#000000'}
            />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        borderRadius: 8,
        elevation: 2,
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: {
            height: 1,
            width: 0,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    primary: {
        backgroundColor: '#000000',
    },
    secondary: {
        backgroundColor: '#FFFFFF',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
    },
}); 