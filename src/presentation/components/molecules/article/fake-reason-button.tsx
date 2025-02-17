import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { SIZES } from '@/presentation/components/sizes';

interface FakeReasonButtonProps {
    fakeReason: string | null;
    isAnswered: boolean;
    isFake: boolean;
}

export function FakeReasonButton({ fakeReason, isAnswered, isFake }: FakeReasonButtonProps) {
    const { t } = useTranslation();
    const [isModalVisible, setIsModalVisible] = useState(false);

    if (!isAnswered || !isFake || !fakeReason) return null;

    return (
        <>
            <Pressable
                style={styles.button}
                onPress={() => setIsModalVisible(true)}
                hitSlop={SIZES.md}
            >
                <Text style={styles.buttonText}>?</Text>
            </Pressable>

            <Modal
                animationType="fade"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setIsModalVisible(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t('common:newsFeed.whyFake')}</Text>
                        <Text style={styles.modalText}>{fakeReason}</Text>
                        <Pressable
                            style={styles.closeButton}
                            onPress={() => setIsModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>{t('common:newsFeed.close')}</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        backgroundColor: 'black',
        borderRadius: SIZES.lg,
        height: 32,
        justifyContent: 'center',
        marginLeft: SIZES.md,
        width: 32,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    closeButton: {
        alignSelf: 'flex-end',
        marginTop: SIZES.lg,
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
    },
    closeButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: '600',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        margin: SIZES.xl,
        maxHeight: '80%',
        padding: SIZES.lg,
        shadowColor: '#000',
        shadowOffset: {
            height: 2,
            width: 0,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalOverlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        flex: 1,
        justifyContent: 'center',
    },
    modalText: {
        color: '#000000',
        fontSize: 16,
        lineHeight: 24,
        marginTop: SIZES.md,
    },
    modalTitle: {
        color: '#000000',
        fontSize: 20,
        fontWeight: '600',
    },
});
