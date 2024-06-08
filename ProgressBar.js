import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const ProgressBar = ({ progress }) => {
    const animatedValue = new Animated.Value(0);

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: progress, // Target value (e.g., 70%)
            duration: 1000, // Animation duration (in milliseconds)
            useNativeDriver: false, // Disable native driver for width animation
        }).start();
    }, [progress]);

    const widthInterpolated = animatedValue.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'], // Map the progress to the width
    });

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Progress: {progress}%</Text>
            <View style={styles.progressBackground}>
                <Animated.View style={[styles.progressBar, { width: widthInterpolated }]}>
                    <LinearGradient
                        colors={['#ff6b6b', '#f06595', '#845ec2']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradient}
                    />
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
        color: '#464646',
        textAlign: 'right'
    },
    progressBackground: {
        height: 8,
        width: '100%',
        backgroundColor: '#eee',
        borderRadius: 10,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 10,
    },
    gradient: {
        height: '100%',
        borderRadius: 10,
    },
});
