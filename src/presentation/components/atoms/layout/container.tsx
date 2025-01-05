import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface ContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  withHeaderOffset?: boolean;
}

export function Container({ children, style, withHeaderOffset = true }: ContainerProps) {
  return (
    <View 
      style={[
        styles.container, 
        withHeaderOffset && styles.withHeaderOffset,
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
    flex: 1,
  },
  withHeaderOffset: {
    paddingTop: 128,
  },
}); 