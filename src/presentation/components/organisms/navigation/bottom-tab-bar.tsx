import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutRectangle, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

type TabRoute = {
    name: string;
    icon: string;
};

const ROUTES: Record<string, TabRoute> = {
    feed: { icon: 'newspaper-variant', name: 'Feed' },
    home: { icon: 'home', name: 'Home' },
    profile: { icon: 'account', name: 'Profile' },
    settings: { icon: 'cog', name: 'Settings' },
} as const;

const TAB_BAR_CONFIG = {
    borderRadius: 28,
    bottomOffset: 34,
    height: 72,
    width: 280,
} as const;

const SPRING_CONFIG = {
    damping: 15,
    mass: 0.6,
    stiffness: 180,
} as const;

const COLORS = {
    active: '#000000',
    background: 'rgba(255, 255, 255, 0.85)',
    border: 'rgba(0, 0, 0, 0.06)',
    inactive: '#94A3B8',
    indicator: 'rgba(0, 0, 0, 0.04)',
} as const;

const ANIMATION_CONFIG = {
    damping: 18,
    mass: 1,
    overshootClamping: false,
    restDisplacementThreshold: 0.001,
    restSpeedThreshold: 0.001,
    stiffness: 180,
} as const;

type TabLayout = {
    x: number;
    width: number;
    centerX: number;
};

type TabItemProps = {
    route: any;
    index: number;
    isFocused: boolean;
    descriptors: Record<string, any>;
    onPress: (route: any, isFocused: boolean) => void;
    width: number;
    onLayout: (index: number, layout: LayoutRectangle) => void;
};

const TabItem = React.memo(
    ({ route, index, isFocused, descriptors, onPress, width, onLayout }: TabItemProps) => {
        const { t } = useTranslation();
        const routeName = route.name.toLowerCase() as keyof typeof ROUTES;
        const icon = ROUTES[routeName]?.icon;

        const animatedStyle = useAnimatedStyle(() => {
            'worklet';
            const scale = withSpring(isFocused ? 1.15 : 1, ANIMATION_CONFIG);
            const opacity = withSpring(isFocused ? 1 : 0.65, ANIMATION_CONFIG);

            return {
                opacity,
                transform: [{ scale }] as any, // Type assertion needed due to React Native Reanimated typing limitations
            };
        });

        return (
            <Pressable
                onLayout={(event) => onLayout(index, event.nativeEvent.layout)}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={t('common:navigation:' + routeName)}
                testID={descriptors[route.key].options.tabBarTestID}
                onPress={() => onPress(route, isFocused)}
                style={[styles.item, { width }]}
            >
                <Animated.View style={[styles.iconContainer, animatedStyle]}>
                    <MaterialCommunityIcons
                        name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
                        size={22}
                        color={isFocused ? COLORS.active : COLORS.inactive}
                    />
                </Animated.View>
            </Pressable>
        );
    },
);

TabItem.displayName = 'TabItem';

const TabBarContent = ({ state, navigation, descriptors }: BottomTabBarProps) => {
    const numTabs = Object.keys(ROUTES).length;
    const TAB_WIDTH = TAB_BAR_CONFIG.width / numTabs;
    const INDICATOR_WIDTH = 80;

    const [tabLayouts, setTabLayouts] = React.useState<TabLayout[]>([]);
    const translateX = useSharedValue(0);

    React.useEffect(() => {
        if (tabLayouts.length > 0 && state.index < tabLayouts.length) {
            const currentTab = tabLayouts[state.index];
            translateX.value = withSpring(currentTab.centerX - INDICATOR_WIDTH / 2, SPRING_CONFIG);
        }
    }, [state.index, tabLayouts]);

    const indicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const handleLayout = (index: number, layout: LayoutRectangle) => {
        setTabLayouts((prev) => {
            const newLayouts = [...prev];
            newLayouts[index] = {
                centerX: layout.x,
                width: layout.width,
                x: layout.x,
            };
            return newLayouts;
        });
    };

    const handlePress = React.useCallback(
        async (route: any, isFocused: boolean) => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            const event = navigation.emit({
                canPreventDefault: true,
                target: route.key,
                type: 'tabPress',
            });

            if (!isFocused && !event.defaultPrevented) {
                navigation.navigate({ merge: true, name: route.name, params: {} });
            }
        },
        [navigation],
    );

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.indicator, { width: INDICATOR_WIDTH }, indicatorStyle]} />
            {state.routes.map((route, index) => (
                <TabItem
                    key={route.key}
                    route={route}
                    index={index}
                    isFocused={state.index === index}
                    descriptors={descriptors}
                    onPress={handlePress}
                    width={TAB_WIDTH}
                    onLayout={handleLayout}
                />
            ))}
        </View>
    );
};

export const BottomTabBar = (props: BottomTabBarProps) => (
    <BlurView intensity={30} tint="extraLight" style={styles.blurContainer}>
        <TabBarContent {...props} />
    </BlurView>
);

const styles = StyleSheet.create({
    blurContainer: {
        backgroundColor: COLORS.background,
        borderColor: COLORS.border,
        borderRadius: TAB_BAR_CONFIG.borderRadius,
        borderWidth: 1,
        bottom: TAB_BAR_CONFIG.bottomOffset,
        elevation: 0,
        height: TAB_BAR_CONFIG.height,
        left: '50%',
        overflow: 'hidden',
        position: 'absolute',
        shadowColor: '#000',
        shadowOffset: {
            height: 16,
            width: 0,
        },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        transform: [{ translateX: -TAB_BAR_CONFIG.width / 2 }],
        width: TAB_BAR_CONFIG.width,
    },
    container: {
        alignItems: 'center',
        flexDirection: 'row',
        height: '100%',
        justifyContent: 'space-around',
        position: 'relative',
        width: '100%',
    },
    iconContainer: {
        alignItems: 'center',
        borderRadius: 16,
        height: 48,
        justifyContent: 'center',
        width: 48,
    },
    indicator: {
        backgroundColor: COLORS.indicator,
        borderRadius: 20,
        height: 48,
        position: 'absolute',
        shadowColor: '#000',
        shadowOffset: { height: 2, width: 0 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
    },
    item: {
        alignItems: 'center',
        height: '100%',
        justifyContent: 'center',
        zIndex: 1,
    },
});
