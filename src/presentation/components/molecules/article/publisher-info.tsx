import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { format } from 'date-fns';

// Import icons
import IconDefault from '../../../../../assets/icon.png';
import IconBrown from '../../../../../assets/icon-brown.png';
import IconDark from '../../../../../assets/icon-dark.png';
import IconGreen from '../../../../../assets/icon-green.png';
import { SIZES } from '../../sizes.js';

type IconVariant = 'default' | 'dark' | 'green' | 'brown';

const ICON_SOURCES = {
    brown: IconBrown,
    dark: IconDark,
    default: IconDefault,
    green: IconGreen,
};

const getIconVariantFromHeadline = (headline: string): IconVariant => {
    if (!headline) return 'default';

    // Get the first letter and convert to lowercase
    const firstLetter = headline.trim().toLowerCase().charAt(0);

    // Distribute letters across the variants
    if ('abcdefgh'.includes(firstLetter)) return 'default';
    if ('ijklmnop'.includes(firstLetter)) return 'dark';
    if ('qrstuv'.includes(firstLetter)) return 'green';
    return 'brown'; // wxyz and any other characters
};

interface PublisherInfoProps {
    headline: string;
}

export function PublisherInfo({ headline }: PublisherInfoProps) {
    const currentDate = new Date();
    const iconVariant = getIconVariantFromHeadline(headline);

    return (
        <View style={styles.container}>
            <Image source={ICON_SOURCES[iconVariant]} style={styles.icon} />
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
