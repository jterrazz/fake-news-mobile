import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ScoreDisplayProps {
  score: number;
  streak: number;
}

export function ScoreDisplay({ score, streak }: ScoreDisplayProps) {
  return (
    <View style={styles.container}>
      <View style={styles.scoreItem}>
        <MaterialCommunityIcons
          name="check-circle"
          size={18}
          color="#22C55E"
          style={{ marginVertical: 1 }}
        />
        <Text style={styles.scoreText}>{score}</Text>
      </View>
      <View style={styles.scoreItem}>
        <MaterialCommunityIcons name="fire" size={20} color="#FF4500" />
        <Text style={styles.scoreText}>×{streak}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  scoreItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  scoreText: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '600',
  },
}); 