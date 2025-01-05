import type { StyleProp, ViewStyle } from 'react-native';
import {
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';
import { Extrapolate, interpolate } from 'react-native-reanimated';

interface HeaderAnimationStyles {
    headerAnimatedStyle: StyleProp<ViewStyle>;
    titleAnimatedStyle: StyleProp<ViewStyle>;
    scrollHandler: (event: { nativeEvent: { contentOffset: { y: number } } }) => void;
}

export function useHeaderAnimation(): HeaderAnimationStyles {
    const scrollY = useSharedValue(0);
    const lastScrollY = useSharedValue(0);
    const headerHeight = useSharedValue(180);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            if (event.contentOffset.y < 0) {
                headerHeight.value = 180;
                lastScrollY.value = 0;
                scrollY.value = 0;
                return;
            }

            const delta = event.contentOffset.y - lastScrollY.value;
            headerHeight.value = Math.max(70, Math.min(180, headerHeight.value - delta));
            lastScrollY.value = event.contentOffset.y;
            scrollY.value = event.contentOffset.y;
        },
    });

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
        scrollHandler,
        titleAnimatedStyle,
    };
}
