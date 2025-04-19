import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Animated,
    Easing,
    GestureResponderEvent,
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { NewsEntity } from '@/domain/news/news.entity';

import { IconButton } from '../../atoms/buttons/icon-button.jsx';
import { TextButton } from '../../atoms/buttons/text-button.jsx';

import { FakeReasonButton } from '@/presentation/components/molecules/article/fake-reason-button';
import { SIZES } from '@/presentation/components/sizes';

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
    article: NewsEntity;
}

function StampAnimation({
    isVisible,
    isFake,
    wasCorrect,
    justAnswered,
}: {
    isVisible: boolean;
    isFake: boolean;
    wasCorrect?: boolean;
    justAnswered: boolean;
}) {
    const { t } = useTranslation();
    const [stampAnim] = React.useState(() => ({
        color: new Animated.Value(2),
        opacity: new Animated.Value(isVisible ? 1 : 0),
        rotate: new Animated.Value(0),
        scale: new Animated.Value(1), // Start at final state (black)
    }));

    useEffect(() => {
        if (justAnswered) {
            // Reset animations for new answer
            stampAnim.opacity.setValue(0);
            stampAnim.scale.setValue(0.5);
            stampAnim.rotate.setValue(0);
            stampAnim.color.setValue(0);

            Animated.parallel([
                // Initial appearance animation
                Animated.timing(stampAnim.opacity, {
                    duration: 300,
                    easing: Easing.bezier(0.4, 0.0, 0.2, 1),
                    toValue: 1,
                    useNativeDriver: true,
                }),
                Animated.spring(stampAnim.scale, {
                    damping: 12,
                    mass: 0.8,
                    restDisplacementThreshold: 0.01,
                    restSpeedThreshold: 0.01,
                    stiffness: 150,
                    toValue: 1,
                    useNativeDriver: true,
                }),
                Animated.sequence([
                    Animated.timing(stampAnim.rotate, {
                        duration: 200,
                        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
                        toValue: -0.2,
                        useNativeDriver: true,
                    }),
                    Animated.spring(stampAnim.rotate, {
                        damping: 12,
                        mass: 0.8,
                        restDisplacementThreshold: 0.01,
                        restSpeedThreshold: 0.01,
                        stiffness: 150,
                        toValue: 0,
                        useNativeDriver: true,
                    }),
                ]),
                // Color transition animation
                Animated.sequence([
                    // Show success/error color
                    Animated.timing(stampAnim.color, {
                        duration: 300,
                        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
                        toValue: 1,
                        useNativeDriver: false,
                    }),
                    // Longer delay before transitioning to black
                    Animated.delay(1200),
                    // Slower transition to black
                    Animated.timing(stampAnim.color, {
                        duration: 800,
                        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
                        toValue: 2,
                        useNativeDriver: false,
                    }),
                ]),
            ]).start();
        } else if (!isVisible) {
            // Just hide the stamp when becoming invisible
            stampAnim.opacity.setValue(0);
        } else {
            // Show stamp in final state for already answered articles
            stampAnim.opacity.setValue(1);
            stampAnim.scale.setValue(1);
            stampAnim.rotate.setValue(0);
            stampAnim.color.setValue(2);
        }
    }, [justAnswered, isVisible]);

    const backgroundColor = stampAnim.color.interpolate({
        inputRange: [0, 1, 2],
        outputRange: ['transparent', wasCorrect ? '#22C55E' : '#EF4444', '#1A1A1A'],
    });

    if (!isVisible) return null;

    return (
        <Animated.View
            style={[
                styles.stampWrapper,
                {
                    opacity: stampAnim.opacity,
                    transform: [
                        { scale: stampAnim.scale },
                        {
                            rotate: stampAnim.rotate.interpolate({
                                inputRange: [-1, 0, 1],
                                outputRange: ['-20deg', '0deg', '20deg'],
                            }),
                        },
                    ],
                },
            ]}
        >
            <Animated.View style={[styles.stamp, { backgroundColor }]}>
                <Text style={styles.stampText}>
                    {isFake ? t('common:newsFeed.fake') : t('common:newsFeed.real')}
                </Text>
            </Animated.View>
        </Animated.View>
    );
}

export function AnswerButtons({
    isAnswered,
    selectedAnswer,
    wasCorrect,
    onAnswerClick,
    onNextArticle,
    showNextButton,
    currentArticleId,
    article,
}: AnswerButtonsProps) {
    const { t } = useTranslation();
    const [justAnswered, setJustAnswered] = React.useState(false);
    const previousIsAnswered = React.useRef(isAnswered);
    const wasAnsweredThisSession = React.useRef(false);

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

    useEffect(() => {
        // Only trigger animation when the answer changes from false to true in this session
        if (!previousIsAnswered.current && isAnswered && wasAnsweredThisSession.current) {
            setJustAnswered(true);
            // Reset after animation duration (2.5s)
            const timer = setTimeout(() => {
                setJustAnswered(false);
            }, 2500);
            return () => clearTimeout(timer);
        }
        previousIsAnswered.current = isAnswered;
    }, [isAnswered]);

    const animateSelection = (selectedFake: boolean) => {
        wasAnsweredThisSession.current = true;
        const centerX = 27.5;
        const leftStartX = 2;
        const rightStartX = 98 - 45;

        animations.slide.fake.setValue(selectedFake ? leftStartX : rightStartX);
        animations.slide.real.setValue(selectedFake ? rightStartX : leftStartX);
        animations.fade.fake.setValue(1);
        animations.fade.real.setValue(1);

        Animated.parallel([
            Animated.timing(animations.fade[selectedFake ? 'real' : 'fake'], {
                duration: 400,
                easing: Easing.bezier(0.4, 0.0, 0.2, 1),
                toValue: 0,
                useNativeDriver: true,
            }),

            Animated.spring(animations.slide[selectedFake ? 'fake' : 'real'], {
                damping: 28,
                mass: 1,
                restDisplacementThreshold: 0.01,
                restSpeedThreshold: 0.01,
                stiffness: 300,
                toValue: centerX,
                useNativeDriver: true,
            }),

            Animated.timing(animations.slide[selectedFake ? 'real' : 'fake'], {
                duration: 400,
                easing: Easing.bezier(0.4, 0.0, 0.2, 1),
                toValue: centerX,
                useNativeDriver: true,
            }),
        ]).start();

        Animated.sequence([
            Animated.timing(nextButtonAnim.scale, {
                duration: 300,
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
        ]).start();

        Animated.timing(nextButtonAnim.opacity, {
            delay: 200,
            duration: 500,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    const handleAnswerClick = (selectedFake: boolean, event: GestureResponderEvent | undefined) => {
        const position = event
            ? {
                  x: event.nativeEvent.pageX,
                  y: event.nativeEvent.pageY,
              }
            : { x: 0, y: 0 };
        animateSelection(selectedFake);
        onAnswerClick(selectedFake, position);
    };

    const getButtonVariant = (isSelected: boolean) => {
        if (isSelected && wasCorrect !== undefined) {
            return wasCorrect ? 'correct' : 'incorrect';
        }
        return 'primary';
    };

    useEffect(() => {
        // Reset animations and wasAnsweredThisSession when article changes
        wasAnsweredThisSession.current = false;
        animations.fade.fake.setValue(1);
        animations.fade.real.setValue(1);
        animations.slide.fake.setValue(0);
        animations.slide.real.setValue(0);

        if (!isAnswered) {
            nextButtonAnim.opacity.setValue(0);
            nextButtonAnim.scale.setValue(0.95);
        }
    }, [currentArticleId]);

    useEffect(() => {
        if (isAnswered && showNextButton) {
            nextButtonAnim.opacity.setValue(1);
            nextButtonAnim.scale.setValue(1);
        }
    }, [isAnswered, showNextButton]);

    return (
        <View style={styles.buttonContainer}>
            {isAnswered && (
                <View style={styles.hintContainer}>
                    <View style={styles.stampContainer}>
                        <StampAnimation
                            isVisible={isAnswered}
                            isFake={article.isFake}
                            wasCorrect={wasCorrect}
                            justAnswered={justAnswered}
                        />
                    </View>
                    <FakeReasonButton
                        fakeReason={article.fakeReason}
                        isAnswered={isAnswered}
                        isFake={article.isFake}
                    />
                    {selectedAnswer !== null && showNextButton && (
                        <View style={styles.nextButtonContainer}>
                            <IconButton
                                icon="arrow-down"
                                onPress={onNextArticle}
                                size="small"
                                variant="secondary"
                                style={styles.nextButton}
                            />
                        </View>
                    )}
                </View>
            )}

            {!isAnswered && (
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
                            variant={getButtonVariant(selectedAnswer === true)}
                            onPress={() => handleAnswerClick(true, undefined)}
                            disabled={isAnswered}
                            size="small"
                        >
                            {t('common:newsFeed.fake')}
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
                            variant={getButtonVariant(selectedAnswer === false)}
                            onPress={() => handleAnswerClick(false, undefined)}
                            disabled={isAnswered}
                            size="small"
                        >
                            {t('common:newsFeed.real')}
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
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SIZES.xs,
        justifyContent: 'center',
        paddingHorizontal: SIZES.md,
        position: 'relative',
        width: '100%',
    },
    nextButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: SIZES.lg,
        borderWidth: 1.5,
        height: 24,
        opacity: 0.9,
        width: 24,
    },
    nextButtonContainer: {
        position: 'absolute',
        right: SIZES.md,
        top: '50%',
        transform: [{ translateY: -12 }],
    },
    stamp: {
        alignItems: 'center',
        borderColor: '#FFFFFF',
        borderRadius: 6,
        borderWidth: 2,
        height: '100%',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        width: '100%',
    },
    stampContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    stampContent: {
        height: 24,
        width: 46,
    },
    stampText: {
        color: '#FFFFFF',
        fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: {
            height: 1,
            width: 0,
        },
        textShadowRadius: 2,
    },
    stampWrapper: {
        elevation: 3,
        height: 36,
        marginLeft: 8,
        shadowColor: '#000000',
        shadowOffset: {
            height: 2,
            width: 0,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        width: 80,
    },
});
