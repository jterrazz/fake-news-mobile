import type { ViewStyle } from 'react-native';
import type { AnimatedStyleProp } from 'react-native-reanimated';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Extrapolate, interpolate } from 'react-native-reanimated';

interface HeaderAnimationStyles {
    headerAnimatedStyle: AnimatedStyleProp<ViewStyle>;
    titleAnimatedStyle: AnimatedStyleProp<ViewStyle>;
    scrollHandler: (event: { nativeEvent: { contentOffset: { y: number } } }) => void;
    resetAnimation: () => void;
}

export function useHeaderAnimation(): HeaderAnimationStyles {
    const scrollY = useSharedValue(0);
    const lastScrollY = useSharedValue(0);
    const headerHeight = useSharedValue(180);

    const updateHeaderHeight = (y: number) => {
        'worklet';

        if (y < 0) {
            headerHeight.value = withTiming(180);
            lastScrollY.value = 0;
            scrollY.value = 0;
            return;
        }

        const delta = y - lastScrollY.value;
        headerHeight.value = Math.max(70, Math.min(180, headerHeight.value - delta));
        lastScrollY.value = y;
        scrollY.value = y;
    };

    const resetAnimation = () => {
        // Use immediate timing for a hard reset to avoid transition artifacts
        headerHeight.value = 180;
        lastScrollY.value = 0;
        scrollY.value = 0;
    };

    const scrollHandler = (event: { nativeEvent: { contentOffset: { y: number } } }) => {
        'worklet';
        updateHeaderHeight(event.nativeEvent.contentOffset.y);
    };

    const headerAnimatedStyle = useAnimatedStyle(() => ({
        paddingBottom: 0,
        paddingTop: interpolate(headerHeight.value, [70, 180], [12, 64], Extrapolate.CLAMP),
    }));

    const titleAnimatedStyle = useAnimatedStyle(() => ({
        fontSize: interpolate(headerHeight.value, [70, 180], [32, 42], Extrapolate.CLAMP),
        marginBottom: interpolate(headerHeight.value, [70, 180], [16, 40], Extrapolate.CLAMP),
        marginTop: interpolate(headerHeight.value, [70, 180], [8, 24], Extrapolate.CLAMP),
        transform: [
            {
                scale: interpolate(headerHeight.value, [70, 180], [0.8, 1], Extrapolate.CLAMP),
            },
        ],
    }));

    return {
        headerAnimatedStyle,
        resetAnimation,
        scrollHandler,
        titleAnimatedStyle,
    };
}
