import React from 'react';
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
    home: { icon: 'newspaper-variant', name: 'Home' },
    profile: { icon: 'account', name: 'Profile' },
    settings: { icon: 'tune', name: 'Settings' },
} as const;

const TAB_BAR_CONFIG = {
    borderRadius: 16,
    bottomOffset: 42,
    height: 60,
    width: 196,
} as const;

const SPRING_CONFIG = {
    damping: 20,
    mass: 0.5,
    stiffness: 120,
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
        const routeName = route.name.toLowerCase() as keyof typeof ROUTES;
        const icon = ROUTES[routeName]?.icon;

        const animatedStyle = useAnimatedStyle(() => ({
            opacity: withSpring(isFocused ? 1 : 0.7, ANIMATION_CONFIG),
            transform: [{ scale: withSpring(isFocused ? 1.1 : 1, ANIMATION_CONFIG) }],
        }));

        return (
            <Pressable
                onLayout={(event) => onLayout(index, event.nativeEvent.layout)}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={descriptors[route.key].options.tabBarAccessibilityLabel}
                testID={descriptors[route.key].options.tabBarTestID}
                onPress={() => onPress(route, isFocused)}
                style={[styles.item, { width }]}
            >
                <Animated.View style={animatedStyle}>
                    <MaterialCommunityIcons
                        name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
                        size={18}
                        color={isFocused ? '#FFFFFF' : '#64748B'}
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
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderColor: 'rgba(148, 163, 184, 0.08)',
        borderRadius: TAB_BAR_CONFIG.borderRadius,
        borderWidth: 1,
        bottom: TAB_BAR_CONFIG.bottomOffset,
        elevation: 8,
        height: TAB_BAR_CONFIG.height,
        left: '50%',
        overflow: 'hidden',
        position: 'absolute',
        shadowColor: '#000',
        shadowOffset: {
            height: 8,
            width: 0,
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
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
    indicator: {
        backgroundColor: 'black',
        borderRadius: 12,
        elevation: 2,
        height: 44,
        position: 'absolute',
        shadowColor: '#000',
        shadowOffset: { height: 2, width: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
    },
    item: {
        alignItems: 'center',
        height: '100%',
        justifyContent: 'center',
        zIndex: 1,
    },
});
