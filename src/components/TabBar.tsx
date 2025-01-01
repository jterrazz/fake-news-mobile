import { StyleSheet } from "react-native";
import React from "react";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { TabBarComponent } from "./TabBarComponent";
import { BlurView } from "expo-blur";

const TAB_BAR_CONFIG = {
  width: 114,
  height: 54,
  bottomOffset: 42,
  borderRadius: 27,
} as const;

export const TabBar = ({ state, navigation, descriptors }: BottomTabBarProps) => (
  <BlurView 
    intensity={35} 
    tint="extraLight"
    style={styles.container}
  >
    <TabBarComponent
      state={state}
      navigation={navigation}
      descriptors={descriptors}
      config={TAB_BAR_CONFIG}
    />
  </BlurView>
);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: TAB_BAR_CONFIG.bottomOffset,
    left: '50%',
    width: TAB_BAR_CONFIG.width,
    height: TAB_BAR_CONFIG.height,
    transform: [{ translateX: -TAB_BAR_CONFIG.width / 2 }],
    borderRadius: TAB_BAR_CONFIG.borderRadius,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
});
