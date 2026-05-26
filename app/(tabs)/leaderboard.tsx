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
import { Crown } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { translations } from '@/constants/translations';
import { Colors } from '@/constants/colors';
import EcoCoin from '@/components/EcoCoin';

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  isCurrentUser?: boolean;
}

const LEADERBOARD_DATA: LeaderboardEntry[] = [
  { rank: 1, name: 'eco_elif', points: 340 },
  { rank: 2, name: 'green_ahmet', points: 290 },
  { rank: 3, name: 'campus_hero', points: 250 },
  { rank: 4, name: 'leaf_kemal', points: 210 },
  { rank: 5, name: 'solar_selin', points: 190 },
  { rank: 6, name: 'recycle_cem', points: 170 },
  { rank: 7, name: 'You', points: 0, isCurrentUser: true },
  { rank: 8, name: 'eco_deniz', points: 130 },
  { rank: 9, name: 'green_buse', points: 110 },
  { rank: 10, name: 'earth_mert', points: 90 },
];

function TopThreeCard({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 150,
      useNativeDriver: true,
      tension: 60,
      friction: 8,
    }).start();
  }, []);

  const medals = [
    { color: Colors.gold, label: '1st', gradient: ['#3a4a2a', '#4a5a3a'] as const },
    { color: Colors.silver, label: '2nd', gradient: ['#2a3a2a', '#3a4a3a'] as const },
    { color: Colors.bronze, label: '3rd', gradient: ['#2a3a2a', '#3a4a2a'] as const },
  ];

  const medal = medals[index];
  const isFirst = index === 0;

  return (
    <Animated.View
      style={[
        styles.topCard,
        isFirst && styles.topCardFirst,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <LinearGradient colors={medal.gradient} style={styles.topCardGradient}>
        {index === 0 && (
          <Crown color={Colors.gold} size={20} style={{ marginBottom: 4 }} />
        )}
        <View style={styles.topAvatar}>
          <EcoCoin size={28} fontSize={14} />
        </View>
        <Text style={[styles.topMedal, { color: medal.color }]}>{medal.label}</Text>
        <Text style={styles.topName}>{entry.name}</Text>
        <View style={styles.topPointsRow}>
          <EcoCoin size={14} fontSize={8} />
          <Text style={styles.topPoints}>{entry.points}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

function RankRow({ entry, rank, youLabel }: { entry: LeaderboardEntry; rank: number; youLabel: string }) {
  const slideAnim = useRef(new Animated.Value(30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: rank * 60, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, delay: rank * 60, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.rankRow,
        entry.isCurrentUser && styles.rankRowHighlight,
        { transform: [{ translateX: slideAnim }], opacity: opacityAnim },
      ]}
    >
      <Text style={[styles.rankNum, entry.rank <= 3 && styles.rankNumTop]}>
        {entry.rank}
      </Text>
      <View style={styles.rankAvatar}>
        <EcoCoin size={22} fontSize={11} />
      </View>
      <Text style={[styles.rankName, entry.isCurrentUser && styles.rankNameYou]}>
        {entry.isCurrentUser ? youLabel : entry.name}
      </Text>
      <View style={styles.rankPointsContainer}>
        <EcoCoin size={14} fontSize={8} />
        <Text style={[styles.rankPoints, entry.isCurrentUser && styles.rankPointsYou]}>
          {entry.points}
        </Text>
      </View>
    </Animated.View>
  );
}

export default function LeaderboardScreen() {
  const { language, totalPoints } = useApp();
  const t = translations[language];

  const data = LEADERBOARD_DATA.map((entry) =>
    entry.isCurrentUser ? { ...entry, points: totalPoints } : entry
  ).sort((a, b) => b.points - a.points);

  const rankedData = data.map((entry, i) => ({ ...entry, rank: i + 1 }));
  const currentUserEntry = rankedData.find((e) => e.isCurrentUser);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={['#243d24', Colors.background]}
          style={styles.header}
        >
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>{t.leaderboardTitle}</Text>
            <View style={styles.headerBadge}>
              <EcoCoin size={16} fontSize={9} />
            </View>
          </View>
          <Text style={styles.headerSub}>METU Campus Rankings</Text>
        </LinearGradient>

        {/* Top 3 */}
        <View style={styles.topThree}>
          <TopThreeCard entry={rankedData[1]} index={1} />
          <TopThreeCard entry={rankedData[0]} index={0} />
          <TopThreeCard entry={rankedData[2]} index={2} />
        </View>

        {/* Current user summary */}
        {currentUserEntry && (
          <View style={styles.myRankCard}>
            <LinearGradient colors={['#243d24', '#1a2e1a']} style={styles.myRankGradient}>
              <Text style={styles.myRankLabel}>{t.you}</Text>
              <Text style={styles.myRankPos}>#{currentUserEntry.rank}</Text>
              <View style={styles.myRankPoints}>
                <EcoCoin size={16} fontSize={9} />
                <Text style={styles.myRankPointsText}>{currentUserEntry.points}</Text>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Full list */}
        <View style={styles.listContainer}>
          {rankedData.map((entry) => (
            <RankRow
              key={entry.name}
              entry={entry}
              rank={entry.rank}
              youLabel={t.you}
            />
          ))}
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
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textWhite,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  headerBadge: {
    opacity: 0.8,
  },
  headerSub: {
    fontSize: 13,
    color: Colors.textGreen,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  topThree: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  topCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    maxWidth: 110,
  },
  topCardFirst: {
    borderColor: Colors.gold,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  topCardGradient: {
    padding: 12,
    alignItems: 'center',
    paddingVertical: 16,
  },
  topAvatar: {
    marginBottom: 6,
  },
  topMedal: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  topName: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    color: Colors.textWhite,
    marginBottom: 4,
  },
  topPointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topPoints: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  myRankCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  myRankGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  myRankLabel: {
    color: Colors.textGreen,
    fontSize: 14,
    fontWeight: '700',
  },
  myRankPos: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: '900',
  },
  myRankPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  myRankPointsText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  rankRow: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rankRowHighlight: {
    borderColor: Colors.primary,
    backgroundColor: '#1a3a1a',
  },
  rankNum: {
    width: 28,
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  rankNumTop: {
    color: Colors.accent,
  },
  rankAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a3a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankName: {
    flex: 1,
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '600',
  },
  rankNameYou: {
    color: Colors.primary,
    fontWeight: '800',
  },
  rankPointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rankPoints: {
    color: Colors.textGreen,
    fontSize: 14,
    fontWeight: '700',
  },
  rankPointsYou: {
    color: Colors.primary,
  },
});
