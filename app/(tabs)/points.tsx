import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { translations } from '@/constants/translations';
import { Colors } from '@/constants/colors';
import EcoCoin from '@/components/EcoCoin';

function AnimatedRing({ points }: { points: number }) {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 8000, useNativeDriver: true })
    ).start();
  }, []);

  return (
    <View style={ringStyles.container}>
      <Animated.View style={[ringStyles.glowRing, { transform: [{ rotate: rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }]}>
        <LinearGradient
          colors={['#4CAF50', '#52b788', '#2d6a4f', '#4CAF50']}
          style={ringStyles.glowGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      <View style={ringStyles.innerCircle}>
        <View style={ringStyles.coinContainer}>
          <EcoCoin size={44} fontSize={22} />
        </View>
        <Text style={ringStyles.pointsNumber}>{points}</Text>
        <Text style={ringStyles.pointsLabel}>EcoPuan</Text>
      </View>
    </View>
  );
}

const ringStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 8,
  },
  glowRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  glowGradient: {
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.25,
  },
  innerCircle: {
    width: 164,
    height: 164,
    borderRadius: 82,
    backgroundColor: '#1a3a1a',
    borderWidth: 4,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  coinContainer: {
    marginBottom: 8,
  },
  pointsNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.textWhite,
    lineHeight: 40,
  },
  pointsLabel: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
  },
});

function HistoryItem({ item, language }: { item: any; language: string }) {
  const slideAnim = useRef(new Animated.Value(20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
  }, []);

  const date = new Date(item.date);
  const dateStr = date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Animated.View
      style={[
        styles.historyItem,
        { transform: [{ translateX: slideAnim }], opacity: opacityAnim },
      ]}
    >
      <View style={styles.historyIcon}>
        <EcoCoin size={18} fontSize={10} />
      </View>
      <View style={styles.historyInfo}>
        <Text style={styles.historyName}>{item.taskName}</Text>
        <Text style={styles.historyDate}>{dateStr}</Text>
      </View>
      <View style={styles.historyPoints}>
        <Text style={styles.historyPointsText}>+{item.points}</Text>
      </View>
    </Animated.View>
  );
}

export default function PointsScreen() {
  const { language, totalPoints, streak, taskHistory } = useApp();
  const t = translations[language];

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerAnim,
              transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) }],
            },
          ]}
        >
          <Text style={styles.headerTitle}>{t.myPointsTitle}</Text>
        </Animated.View>

        {/* Animated Ring */}
        <AnimatedRing points={totalPoints} />

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <LinearGradient colors={['#243d24', '#1a2e1a']} style={styles.statGradient}>
              <Flame color="#FF6B35" size={24} />
              <Text style={styles.statValue}>{streak}</Text>
              <Text style={styles.statLabel}>{t.streakLabel}</Text>
            </LinearGradient>
          </View>
          <View style={styles.statCard}>
            <LinearGradient colors={['#243d24', '#1a2e1a']} style={styles.statGradient}>
              <View style={styles.statEmoji}>
                <EcoCoin size={22} fontSize={11} />
              </View>
              <Text style={styles.statValue}>{totalPoints}</Text>
              <Text style={styles.statLabel}>{t.totalPoints}</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Task History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>{t.completedTasks}</Text>
          {taskHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyCoin}>
                <EcoCoin size={48} fontSize={24} />
              </View>
              <Text style={styles.emptyText}>{t.noHistory}</Text>
            </View>
          ) : (
            taskHistory.map((item) => (
              <HistoryItem key={item.id} item={item} language={language} />
            ))
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textWhite,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statGradient: {
    padding: 18,
    alignItems: 'center',
  },
  statEmoji: {
    marginBottom: 4,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.textWhite,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  historySection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textWhite,
    marginBottom: 12,
  },
  historyItem: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a3a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    color: Colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  historyDate: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  historyPoints: {
    backgroundColor: '#1a3a1a',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  historyPointsText: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyCoin: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
