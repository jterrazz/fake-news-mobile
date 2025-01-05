import React, { useEffect } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';

import { IconButton } from '../../atoms/buttons/icon-button.jsx';
import { TextButton } from '../../atoms/buttons/text-button.jsx';

import { SIZES } from '@/presentation/components/sizes.js';

interface ButtonPosition {
    x: number;
    y: number;
}

interface AnswerButtonsProps {
    isAnswered: boolean;
    selectedAnswer: boolean | null;
    wasCorrect?: boolean;
    onAnswerClick: (selectedFake: boolean, position: ButtonPosition) => void;
    onNextArticle?: () => void;
    showNextButton?: boolean;
    currentArticleId: string;
}

export function AnswerButtons({
    isAnswered,
    selectedAnswer,
    wasCorrect,
    onAnswerClick,
    onNextArticle,
    showNextButton,
    currentArticleId,
}: AnswerButtonsProps) {
    // Move animation state management into the component
    const [animations] = React.useState(() => ({
        fade: {
            fake: new Animated.Value(1),
            real: new Animated.Value(1),
        },
        slide: {
            fake: new Animated.Value(0),
            real: new Animated.Value(0),
        },
    }));

    const [nextButtonAnim] = React.useState(() => ({
        opacity: new Animated.Value(0),
        scale: new Animated.Value(0.95),
    }));

    const animateSelection = (selectedFake: boolean) => {
        // Calculate positions for merging animation
        const centerX = 27.5; // Center position
        const leftStartX = 2; // Left button starting position
        const rightStartX = 98 - 45; // Right button starting position

        // Reset animation values
        animations.slide.fake.setValue(selectedFake ? leftStartX : rightStartX);
        animations.slide.real.setValue(selectedFake ? rightStartX : leftStartX);
        animations.fade.fake.setValue(1);
        animations.fade.real.setValue(1);

        Animated.parallel([
            // Fade out unselected button
            Animated.timing(animations.fade[selectedFake ? 'real' : 'fake'], {
                duration: 400,
                easing: Easing.bezier(0.4, 0.0, 0.2, 1),
                toValue: 0,
                useNativeDriver: true,
            }),

            // Move selected button to center
            Animated.spring(animations.slide[selectedFake ? 'fake' : 'real'], {
                damping: 28,
                mass: 1,
                restDisplacementThreshold: 0.01,
                restSpeedThreshold: 0.01,
                stiffness: 300,
                toValue: centerX,
                useNativeDriver: true,
            }),

            // Move unselected button
            Animated.timing(animations.slide[selectedFake ? 'real' : 'fake'], {
                duration: 400,
                easing: Easing.bezier(0.4, 0.0, 0.2, 1),
                toValue: centerX,
                useNativeDriver: true,
            }),

            // Scale animation for selected button
            Animated.sequence([
                Animated.timing(nextButtonAnim.scale, {
                    duration: 200,
                    easing: Easing.bezier(0.4, 0.0, 0.2, 1),
                    toValue: 1.05,
                    useNativeDriver: true,
                }),
                Animated.spring(nextButtonAnim.scale, {
                    damping: 15,
                    mass: 0.8,
                    restDisplacementThreshold: 0.01,
                    restSpeedThreshold: 0.01,
                    stiffness: 250,
                    toValue: 1,
                    useNativeDriver: true,
                }),
            ]),

            // Fade in next button
            Animated.timing(nextButtonAnim.opacity, {
                delay: 200,
                duration: 300,
                easing: Easing.bezier(0.4, 0.0, 0.2, 1),
                toValue: 1,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleAnswerClick = (
        selectedFake: boolean,
        event: React.MouseEvent | React.TouchEvent,
    ) => {
        const position = {
            x: 'pageX' in event ? event.pageX : event.nativeEvent.pageX,
            y: 'pageY' in event ? event.pageY : event.nativeEvent.pageY,
        };
        animateSelection(selectedFake);
        onAnswerClick(selectedFake, position);
    };

    // Reset animations when currentArticleId changes
    useEffect(() => {
        animations.fade.fake.setValue(1);
        animations.fade.real.setValue(1);
        animations.slide.fake.setValue(0);
        animations.slide.real.setValue(0);
        nextButtonAnim.opacity.setValue(0);
        nextButtonAnim.scale.setValue(0.95);
    }, [currentArticleId]);

    return (
        <View style={styles.buttonContainer}>
            <View style={styles.hintContainer}>
                <Text
                    style={[styles.hintText, { textTransform: isAnswered ? 'uppercase' : 'none' }]}
                >
                    {isAnswered ? 'This article was FAKE' : 'Is this article fake or real?'}
                </Text>
            </View>

            {isAnswered ? (
                <View style={styles.buttonRow}>
                    <TextButton
                        variant={wasCorrect ? 'correct' : 'incorrect'}
                        onPress={() => {}}
                        disabled
                        size="small"
                    >
                        {selectedAnswer === true ? 'FAKE' : 'REAL'}
                    </TextButton>

                    {selectedAnswer !== null && showNextButton && (
                        <Animated.View
                            style={[
                                styles.nextButtonContainer,
                                {
                                    transform: [{ scale: nextButtonAnim.scale }],
                                },
                            ]}
                        >
                            <IconButton
                                icon="arrow-down"
                                onPress={onNextArticle}
                                size="medium"
                                variant="primary"
                            />
                        </Animated.View>
                    )}
                </View>
            ) : (
                <View style={styles.buttonRow}>
                    <Animated.View
                        style={[
                            styles.buttonWrapperLeft,
                            {
                                opacity: animations.fade.fake,
                                transform: [
                                    { translateX: animations.slide.fake },
                                    {
                                        scale: selectedAnswer === true ? nextButtonAnim.scale : 1,
                                    },
                                ],
                                zIndex: selectedAnswer === true ? 2 : 1,
                            },
                        ]}
                    >
                        <TextButton
                            variant={
                                selectedAnswer === true && wasCorrect !== undefined
                                    ? wasCorrect
                                        ? 'correct'
                                        : 'incorrect'
                                    : 'primary'
                            }
                            onPress={(event) => handleAnswerClick(true, event)}
                            disabled={isAnswered}
                            size="small"
                        >
                            FAKE
                        </TextButton>
                    </Animated.View>

                    <Animated.View
                        style={[
                            styles.buttonWrapperRight,
                            {
                                opacity: animations.fade.real,
                                transform: [
                                    { translateX: animations.slide.real },
                                    {
                                        scale: selectedAnswer === false ? nextButtonAnim.scale : 1,
                                    },
                                ],
                                zIndex: selectedAnswer === false ? 2 : 1,
                            },
                        ]}
                    >
                        <TextButton
                            variant={
                                selectedAnswer === false && wasCorrect !== undefined
                                    ? wasCorrect
                                        ? 'correct'
                                        : 'incorrect'
                                    : 'primary'
                            }
                            onPress={(event) => handleAnswerClick(false, event)}
                            disabled={isAnswered}
                            size="small"
                        >
                            REAL
                        </TextButton>
                    </Animated.View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        alignItems: 'center',
        flexDirection: 'column',
        gap: SIZES.md,
        justifyContent: 'center',
        position: 'relative',
        width: '100%',
    },
    buttonRow: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: SIZES.md,
        justifyContent: 'center',
        minHeight: 48,
        position: 'relative',
        width: '100%',
    },
    buttonWrapperLeft: {
        position: 'relative',
        width: 'auto',
    },
    buttonWrapperRight: {
        position: 'relative',
        width: 'auto',
    },
    hintContainer: {
        alignItems: 'center',
        position: 'relative',
        width: '100%',
    },
    hintText: {
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
        color: '#666666',
        elevation: 1,
        fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
        fontSize: 13,
        fontWeight: '500',
        letterSpacing: 0.3,
        opacity: 0.8,
        overflow: 'hidden',
        paddingHorizontal: 8,
        paddingVertical: 4,
        shadowColor: '#000',
        shadowOffset: {
            height: 1,
            width: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    nextButtonContainer: {
        position: 'relative',
    },
});
