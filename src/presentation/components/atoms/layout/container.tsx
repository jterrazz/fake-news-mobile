import React from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ContainerProps {
    children: React.ReactNode;
    style?: ViewStyle;
    withHeaderOffset?: boolean;
}

export function Container({ children, style, withHeaderOffset = true }: ContainerProps) {
    const insets = useSafeAreaInsets();

    // Calculate dynamic header offset based on safe area insets
    // Base header height (without safe area) is 96
    const dynamicHeaderOffset = withHeaderOffset
        ? {
              paddingTop: Platform.select({
                  // For Android, smaller offset since status bar is handled separately
                  android: 96 + Math.max(0, insets.top - 20),

                  default: 96,
                  // For iOS, include top inset to account for notch/Dynamic Island
                  ios: 96 + insets.top,
              }),
          }
        : {};

    return <View style={[styles.container, dynamicHeaderOffset, style]}>{children}</View>;
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F8F9FA',
        flex: 1,
    },
});
