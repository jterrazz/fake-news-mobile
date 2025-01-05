import React, { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

interface CelebrationParticleProps {
    isVisible: boolean;
    position: {
        x: number;
        y: number;
    };
}

const ENHANCED_COLORS = [
    'rgba(34, 197, 94, 0.95)', // Green-500
    'rgba(34, 197, 94, 0.85)',
    'rgba(22, 163, 74, 0.75)', // Green-600
    'rgba(255, 255, 255, 0.9)', // White
    'rgba(255, 255, 255, 0.8)', // White
];

const BURST_PARTICLE_COUNT = 32;

interface BurstParticle {
    animation: Animated.Value;
    angle: number;
    color: string;
    delay: number;
    distance: number;
    rotation: Animated.Value;
    scale: number;
    size: number;
}

const createParticles = (): BurstParticle[] => {
    return Array.from({ length: BURST_PARTICLE_COUNT }, (_, i) => {
        const sizeVariation = Math.random();
        const distanceVariation = Math.random();

        return {
            angle: (i * 2 * Math.PI) / BURST_PARTICLE_COUNT,
            animation: new Animated.Value(0),
            color: ENHANCED_COLORS[Math.floor(Math.random() * ENHANCED_COLORS.length)],
            delay: Math.random() * 30,
            distance: (20 + Math.random() * 40) * (1 + distanceVariation),
            rotation: new Animated.Value(0),
            scale: 0.2 + Math.random() * 0.8,
            size: 2 + sizeVariation * 6,
        };
    });
};

export function CelebrationParticle({ isVisible, position }: CelebrationParticleProps) {
    const [particles] = useState(() => createParticles());

    useEffect(() => {
        if (isVisible && position.x !== 0) {
            particles.forEach((particle) => {
                particle.animation.setValue(0);
                particle.rotation.setValue(0);

                Animated.parallel([
                    Animated.timing(particle.animation, {
                        duration: 400,
                        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                        toValue: 1,
                        useNativeDriver: true,
                    }),
                    Animated.timing(particle.rotation, {
                        duration: 400,
                        easing: Easing.bezier(0.33, 0, 0.67, 1),
                        toValue: 2,
                        useNativeDriver: true,
                    }),
                ]).start();
            });
        }
    }, [isVisible, position, particles]);

    if (!isVisible || position.x === 0) return null;

    return (
        <View
            style={[
                styles.container,
                {
                    height: 200,
                    left: position.x - 100,
                    top: position.y - 100,
                    width: 200,
                },
            ]}
        >
            {particles.map((particle, index) => {
                const translateX = particle.animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, Math.cos(particle.angle) * particle.distance],
                });

                const translateY = particle.animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, Math.sin(particle.angle) * particle.distance],
                });

                const scale = particle.animation.interpolate({
                    inputRange: [0, 0.3, 1],
                    outputRange: [0, particle.scale, 0],
                });

                const rotate = particle.rotation.interpolate({
                    inputRange: [0, 2],
                    outputRange: ['0deg', '720deg'],
                });

                const backgroundColor = particle.animation.interpolate({
                    inputRange: [0, 0.3, 0.8, 1],
                    outputRange: [
                        particle.color,
                        particle.color,
                        'rgba(255, 255, 255, 0.9)',
                        'rgba(255, 255, 255, 0)',
                    ],
                });

                return (
                    <Animated.View
                        key={`burst-${index}`}
                        style={[
                            styles.particle,
                            {
                                backgroundColor,
                                borderRadius: particle.size / 2,
                                height: particle.size,
                                transform: [{ translateX }, { translateY }, { scale }, { rotate }],
                                width: particle.size,
                            },
                        ]}
                    />
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        position: 'absolute',
        zIndex: 99,
    },
    particle: {
        position: 'absolute',
    },
});
