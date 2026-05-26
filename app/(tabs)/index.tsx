import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { translations } from '@/constants/translations';
import { Colors } from '@/constants/colors';
import { TASKS } from '@/constants/tasks';
import TaskCard from '@/components/TaskCard';
import EcoCoin from '@/components/EcoCoin';

export default function HomeScreen() {
  const { language, setLanguage, totalPoints, streak } = useApp();
  const t = translations[language];

  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(cardsAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const totalTasks = TASKS.length;

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
              transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
            },
          ]}
        >
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{t.greeting}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => setLanguage(language === 'en' ? 'tr' : 'en')}
              style={styles.langToggle}
              activeOpacity={0.8}
            >
              <Text style={styles.langText}>{language === 'en' ? 'TR' : 'EN'}</Text>
            </TouchableOpacity>
            <View style={styles.pointsBadge}>
              <EcoCoin size={18} fontSize={10} />
              <Text style={styles.pointsBadgeText}>{totalPoints}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Streak Banner */}
        <Animated.View
          style={[
            styles.streakCard,
            {
              opacity: headerAnim,
              transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
            },
          ]}
        >
          <LinearGradient
            colors={['#243d24', '#1a2e1a']}
            style={styles.streakGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.streakLeft}>
              <Flame color="#FF6B35" size={24} />
              <Text style={styles.streakNumber}>{streak}</Text>
              <Text style={styles.streakLabel}>{t.streak}</Text>
            </View>
            <View style={styles.streakRight}>
              <Text style={styles.progressText}>
                {totalTasks} tasks
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Missions Header */}
        <Animated.View
          style={[
            {
              opacity: cardsAnim,
              transform: [{ translateY: cardsAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.todaysMissions}</Text>
          </View>

          {TASKS.map((task) => (
            <TaskCard
              key={task.id}
              taskId={task.id}
              icon={task.icon}
              name={t[task.nameKey] as string}
              description={t[task.descKey] as string}
              points={task.points}
              verifyLabel={t.verify}
            />
          ))}
        </Animated.View>

        {/* Bottom spacing */}
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
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textWhite,
    letterSpacing: 0.3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langToggle: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  langText: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  pointsBadge: {
    backgroundColor: '#1a3a1a',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pointsBadgeText: {
    color: Colors.textGreen,
    fontSize: 13,
    fontWeight: '700',
  },
  streakCard: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  streakGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  streakNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.textWhite,
    marginLeft: 6,
    marginRight: 4,
  },
  streakLabel: {
    fontSize: 13,
    color: Colors.textGreen,
    fontWeight: '600',
  },
  streakRight: {
    flex: 1,
  },
  progressText: {
    color: Colors.textGreen,
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textWhite,
    flex: 1,
  },
});
