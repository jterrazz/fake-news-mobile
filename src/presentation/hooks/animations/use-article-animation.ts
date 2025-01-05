import { useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import type { AnimatedStyleProp } from 'react-native-reanimated';
import { Extrapolate,interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface ArticleAnimationStyles {
  containerAnimatedStyle: AnimatedStyleProp<ViewStyle>;
  contentAnimatedStyle: AnimatedStyleProp<ViewStyle>;
  previewAnimatedStyle: AnimatedStyleProp<ViewStyle>;
}

export function useArticleAnimation(isExpanded: boolean): ArticleAnimationStyles {
  const expandAnimation = useSharedValue(0);

  useEffect(() => {
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
    transform: [{
      translateY: interpolate(expandAnimation.value, [0, 1], [40, 0], {
        extrapolateRight: Extrapolate.CLAMP,
      }),
    }],
  }));

  const previewAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expandAnimation.value, [0, 0.3], [1, 0], {
      extrapolateRight: Extrapolate.CLAMP,
    }),
    transform: [{
      translateY: interpolate(expandAnimation.value, [0, 1], [0, -10], {
        extrapolateRight: Extrapolate.CLAMP,
      }),
    }],
  }));

  return {
    containerAnimatedStyle,
    contentAnimatedStyle,
    previewAnimatedStyle,
  };
} 