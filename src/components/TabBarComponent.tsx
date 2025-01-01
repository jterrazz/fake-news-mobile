import { Dimensions, Pressable, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import Animated, {
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import {
  TabNavigationState,
  ParamListBase,
  NavigationHelpers,
} from "@react-navigation/native";
import { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';

export const routes = {
  home: { name: "Home", icon: "home" },
  feed: { name: "Feed", icon: "newspaper-variant" },
  profile: { name: "Profile", icon: "account" },
  settings: { name: "Settings", icon: "cog" },
};
type Props = {
  state: TabNavigationState<ParamListBase>;
  descriptors: any;
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
};

const { width } = Dimensions.get("window");

// 20 on each side for absolute positioning of the tab bar
// 20 on each side for the internal padding
const TAB_WIDTH = (width - 34 * 2) / 3;

const SPRING_CONFIG = {
  mass: 1,
  damping: 15,
  stiffness: 120,
  overshootClamping: false,
  restDisplacementThreshold: 0.001,
  restSpeedThreshold: 0.001,
};

const BEZIER_CURVE = [0.25, 0.1, 0.25, 1];

export const TabBarComponent = ({ state, navigation, descriptors }: Props) => {
  const translateX = useSharedValue(0);
  const focusedTab = state.index;

  const handleAnimate = (index: number) => {
    "worklet";
    translateX.value = withSpring(index * TAB_WIDTH, {
      damping: 20,
      stiffness: 90,
      mass: 0.5,
    });
  };

  useEffect(() => {
    runOnUI(handleAnimate)(focusedTab);
  }, [focusedTab]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handlePress = async (route: any, isFocused: boolean) => {
    // Trigger a light haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate({
        name: route.name,
        merge: true,
        params: {},
      });
    }
  };

  return (
    <>
      <Animated.View style={[styles.container, indicatorStyle]} />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;
        const routeName = route.name.toLowerCase() as keyof typeof routes;
        const icon = routes[routeName]?.icon;

        const animatedStyle = useAnimatedStyle(() => ({
          opacity: withSpring(isFocused ? 1 : 0.5, {
            damping: 20,
            stiffness: 90,
          }),
          transform: [
            {
              scale: withSpring(isFocused ? 1.1 : 1, {
                damping: 20,
                stiffness: 90,
              }),
            },
          ],
        }));

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate({
              name: route.name,
              merge: true,
              params: {},
            });
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <Pressable
            key={`route-${index}`}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={() => handlePress(route, isFocused)}
            onLongPress={onLongPress}
            style={styles.item}
          >
            <Animated.View style={animatedStyle}>
              <MaterialCommunityIcons
                name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
                size={24}
                color={isFocused ? "white" : "black"}
              />
            </Animated.View>
          </Pressable>
        );
      })}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: TAB_WIDTH,
    height: 40,
    backgroundColor: "black",
    zIndex: 0,
    position: "absolute",
    marginHorizontal: 10,
    borderRadius: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
