import { useEffect } from 'react';
import React from 'react';
import type { ViewStyle } from 'react-native';
import type { StyleProp } from 'react-native';
import {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

interface ArticleAnimationStyles {
    containerAnimatedStyle: StyleProp<ViewStyle>;
    contentAnimatedStyle: StyleProp<ViewStyle>;
    previewAnimatedStyle: StyleProp<ViewStyle>;
}

export function useArticleAnimation(isExpanded: boolean): ArticleAnimationStyles {
    const expandAnimation = useSharedValue(0);
    const isMounted = React.useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        if (!isMounted.current) return;
        
        expandAnimation.value = withSpring(isExpanded ? 1 : 0, {
            damping: isExpanded ? 15 : 20,
            mass: isExpanded ? 0.8 : 1,
            stiffness: isExpanded ? 100 : 120,
            velocity: isExpanded ? 0 : -1,
        });
    }, [isExpanded]);

    const containerAnimatedStyle = useAnimatedStyle(() => ({
        borderRadius: interpolate(expandAnimation.value, [0, 1], [12, 16]),
        borderWidth: 1,
    }));

    const contentAnimatedStyle = useAnimatedStyle(() => ({
        opacity: interpolate(expandAnimation.value, [0.3, 0.7], [0, 1], {
            extrapolateRight: Extrapolate.CLAMP,
        }),
        transform: [
            {
                translateY: interpolate(expandAnimation.value, [0, 1], [40, 0], {
                    extrapolateRight: Extrapolate.CLAMP,
                }),
            },
        ],
    }));

    const previewAnimatedStyle = useAnimatedStyle(() => ({
        opacity: interpolate(expandAnimation.value, [0, 0.3], [1, 0], {
            extrapolateRight: Extrapolate.CLAMP,
        }),
        transform: [
            {
                translateY: interpolate(expandAnimation.value, [0, 1], [0, -10], {
                    extrapolateRight: Extrapolate.CLAMP,
                }),
            },
        ],
    }));

    return {
        containerAnimatedStyle,
        contentAnimatedStyle,
        previewAnimatedStyle,
    };
}
