import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { format } from 'date-fns';

import CheckMark from '../../../../../assets/images/check-mark.jpg';
import Cross from '../../../../../assets/images/cross.jpg';
import QuestionMark from '../../../../../assets/images/question-mark.jpg';
import { SIZES } from '../../sizes.jsx';

interface PublisherInfoProps {
    headline: string;
    isAnswered?: boolean;
    isFake?: boolean;
    date: Date;
}

export function PublisherInfo({ headline, isAnswered, isFake, date }: PublisherInfoProps) {
    const getStatusImage = () => {
        if (!isAnswered) return QuestionMark;
        return isFake ? CheckMark : Cross;
    };

    return (
        <View style={styles.container}>
            <Image source={getStatusImage()} style={styles.icon} />
            <View style={styles.info}>
                <Text style={styles.name}>AI BREAKING NEWS</Text>
                <Text style={styles.date}>{format(date, 'MMMM d, yyyy')}</Text>
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
        borderRadius: 14,
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
