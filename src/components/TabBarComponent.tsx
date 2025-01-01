import { Pressable, StyleSheet, View, LayoutRectangle } from "react-native";
import React from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import {
  TabNavigationState,
  ParamListBase,
  NavigationHelpers,
} from "@react-navigation/native";
import { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';

type TabRoute = {
  name: string;
  icon: string;
};

const ROUTES: Record<string, TabRoute> = {
  home: { name: "Home", icon: "newspaper-variant" },
  feed: { name: "Feed", icon: "newspaper-variant" },
  profile: { name: "Profile", icon: "account" },
  settings: { name: "Settings", icon: "tune" },
} as const;

type TabBarConfig = {
  width: number;
  height: number;
  bottomOffset: number;
  borderRadius: number;
};

type Props = {
  state: TabNavigationState<ParamListBase>;
  descriptors: Record<string, any>;
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
  config: TabBarConfig;
};

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 90,
  mass: 0.5,
} as const;

const ANIMATION_CONFIG = {
  mass: 1,
  damping: 18,
  stiffness: 180,
  overshootClamping: false,
  restDisplacementThreshold: 0.001,
  restSpeedThreshold: 0.001,
} as const;

type TabLayout = {
  x: number;
  width: number;
  centerX: number;
};

export const TabBarComponent = ({ state, navigation, descriptors, config }: Props) => {
  const numTabs = Object.keys(ROUTES).length;
  const TAB_WIDTH = config.width / numTabs;
  const INDICATOR_WIDTH = 44;
  
  const [tabLayouts, setTabLayouts] = React.useState<TabLayout[]>([]);
  const translateX = useSharedValue(0);

  React.useEffect(() => {
    if (tabLayouts.length > 0 && state.index < tabLayouts.length) {
      const currentTab = tabLayouts[state.index];
      translateX.value = withSpring(
        currentTab.centerX - INDICATOR_WIDTH / 2,
        SPRING_CONFIG
      );
    }
  }, [state.index, tabLayouts]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleLayout = (index: number, layout: LayoutRectangle) => {
    setTabLayouts(prev => {
      const newLayouts = [...prev];
      newLayouts[index] = {
        x: layout.x,
        width: layout.width,
        centerX: layout.x,
      };
      return newLayouts;
    });
  };

  const handlePress = React.useCallback(async (route: any, isFocused: boolean) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate({ name: route.name, merge: true, params: {} });
    }
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.indicator, 
          { width: INDICATOR_WIDTH }, 
          indicatorStyle
        ]} 
      />
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

type TabItemProps = {
  route: any;
  index: number;
  isFocused: boolean;
  descriptors: Record<string, any>;
  onPress: (route: any, isFocused: boolean) => void;
  width: number;
  onLayout: (index: number, layout: LayoutRectangle) => void;
};

const TabItem = React.memo(({ 
  route, 
  index,
  isFocused, 
  descriptors, 
  onPress, 
  width,
  onLayout 
}: TabItemProps) => {
  const routeName = route.name.toLowerCase() as keyof typeof ROUTES;
  const icon = ROUTES[routeName]?.icon;

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withSpring(isFocused ? 1 : 0.7, ANIMATION_CONFIG),
    transform: [{ scale: withSpring(isFocused ? 1.15 : 1, ANIMATION_CONFIG) }],
  }));

  return (
    <Pressable
      onLayout={(event) => {
        onLayout(index, event.nativeEvent.layout);
      }}
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
          color={isFocused ? "white" : "black"}
        />
      </Animated.View>
    </Pressable>
  );
});

TabItem.displayName = 'TabItem';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  indicator: {
    height: 44,
    backgroundColor: "black",
    position: "absolute",
    borderRadius: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
    height: '100%',
    zIndex: 1,
  },
});
