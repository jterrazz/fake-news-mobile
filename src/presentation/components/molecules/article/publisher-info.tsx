import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { format } from 'date-fns';

// Import publisher icon
import QuestionMark from '../../../../../assets/images/question-mark.jpg';
import { SIZES } from '../../sizes.js';

interface PublisherInfoProps {
    headline: string;
}

export function PublisherInfo({ headline }: PublisherInfoProps) {
    const currentDate = new Date();

    return (
        <View style={styles.container}>
            <Image source={QuestionMark} style={styles.icon} />
            <View style={styles.info}>
                <Text style={styles.name}>AI BREAKING NEWS</Text>
                <Text style={styles.date}>{format(currentDate, 'MMMM d, yyyy')}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    date: {
        color: '#999999',
        fontSize: 11,
        fontWeight: '500',
    },
    icon: {
        borderRadius: 10,
        height: 28,
        width: 28,
    },
    info: {
        marginLeft: SIZES.md + SIZES['2xs'],
    },
    name: {
        color: '#454545',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.8,
        marginBottom: 1,
        textTransform: 'uppercase',
    },
});
