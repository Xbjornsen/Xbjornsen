import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';

interface Props {
  axis: string;
  value: number;
  color?: string;
}

export default function AxisReading({ axis, value, color = COLORS.accent }: Props) {
  return (
    <View style={styles.container}>
      <Text style={[styles.axis, { color: COLORS.textSecondary }]}>{axis}</Text>
      <Text style={[styles.value, { color }]}>{value.toFixed(1)}</Text>
      <Text style={styles.unit}>µT</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    minWidth: 80,
  },
  axis: {
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  value: {
    fontFamily: 'monospace',
    fontSize: 20,
    fontWeight: '700',
  },
  unit: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
});
