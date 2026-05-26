import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { router } from 'expo-router';
import EcoCoin from './EcoCoin';

interface TaskCardProps {
  taskId: string;
  icon: string;
  name: string;
  description: string;
  points: number;
  verifyLabel: string;
}

export default function TaskCard({
  taskId,
  icon,
  name,
  description,
  points,
  verifyLabel,
}: TaskCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    router.push({ pathname: '/(tabs)/camera', params: { taskId } });
  };

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.desc}>{description}</Text>
        <View style={styles.pointsBadge}>
          <EcoCoin size={14} fontSize={9} />
          <Text style={styles.pointsText}>+{points}</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={handlePress}
        style={styles.verifyBtn}
        activeOpacity={0.8}
      >
        <Text style={styles.verifyText}>{verifyLabel}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a3a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 22,
  },
  info: {
    flex: 1,
  },
  name: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  desc: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 6,
  },
  pointsBadge: {
    backgroundColor: '#1a3a1a',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointsText: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  verifyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginLeft: 8,
    minWidth: 72,
    alignItems: 'center',
  },
  verifyText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
});
