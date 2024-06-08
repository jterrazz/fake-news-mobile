import {TouchableOpacity,StyleSheet, Text} from "react-native";

export const BlackButton = ({ onPress, title }) => {
    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#000', // Pure black color
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10, // Adjust the border radius if you want rounded corners
        alignItems: 'center',
    },
    text: {
        color: '#fff', // White text for contrast
        fontSize: 16,
        fontWeight: 'bold',
    },
});