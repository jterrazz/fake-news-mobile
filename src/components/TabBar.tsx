import { StyleSheet, View } from "react-native";
import React from "react";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { TabBarComponent } from "./TabBarComponent";

export const TabBar = ({
  state,
  navigation,
  descriptors,
}: BottomTabBarProps) => {
  return (
    <View style={styles.tabBarStyle}>
      <TabBarComponent
        state={state}
        navigation={navigation}
        descriptors={descriptors}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarStyle: {
    backgroundColor: "rgba(240, 240, 240, 0.97)",
    flexDirection: "row",
    position: "absolute",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    bottom: 48, // here you can use the bottom inset for more flexbility
    left: 24,
    right: 24,
    height: 60,
    flex: 1,
    elevation: 0,
    borderRadius: 32,
  },
});
