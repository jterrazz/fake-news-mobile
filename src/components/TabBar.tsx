import { StyleSheet, View } from "react-native";
import React from "react";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { TabBarComponent } from "./TabBarComponent";
import { BlurView } from "expo-blur";

export const TabBar = ({
  state,
  navigation,
  descriptors,
}: BottomTabBarProps) => {
  return (
    <BlurView 
      intensity={20} 
      tint="systemThickMaterialLight"
      style={styles.tabBarStyle}
    >
      <TabBarComponent
        state={state}
        navigation={navigation}
        descriptors={descriptors}
      />
    </BlurView>
  );
};

const styles = StyleSheet.create({
  tabBarStyle: {
    flexDirection: "row",
    position: "absolute",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    bottom: 48,
    left: 23,
    right: 23,
    height: 68,
    flex: 1,
    elevation: 0,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});
