import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

interface EcoCoinProps {
  size?: number;
  fontSize?: number;
}

export default function EcoCoin({ size = 20, fontSize }: EcoCoinProps) {
  const actualFontSize = fontSize || Math.round(size * 0.55);

  return (
    <View style={[styles.coin, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.letter, { fontSize: actualFontSize }]}>E</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  coin: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    color: Colors.textWhite,
    fontWeight: '900',
    letterSpacing: 0,
  },
});
