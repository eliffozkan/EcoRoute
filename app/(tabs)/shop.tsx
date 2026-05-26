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
import { Lock } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { translations } from '@/constants/translations';
import { Colors } from '@/constants/colors';
import EcoCoin from '@/components/EcoCoin';

interface ShopCardProps {
  emoji: string;
  title: string;
  description: string;
  comingSoonLabel: string;
  delay: number;
}

function ShopCard({ emoji, title, description, comingSoonLabel, delay }: ShopCardProps) {
  const slideAnim = useRef(new Animated.Value(30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.card,
        { transform: [{ translateX: slideAnim }], opacity: opacityAnim },
      ]}
    >
      <LinearGradient
        colors={['#243d24', '#1a3a1a']}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardEmoji}>{emoji}</Text>
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>{comingSoonLabel}</Text>
          </View>
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc}>{description}</Text>
        <View style={styles.lockOverlay}>
          <Lock color={Colors.textMuted} size={20} />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

export default function ShopScreen() {
  const { language } = useApp();
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
          <View style={styles.headerRow}>
            <View style={styles.titleRow}>
              <EcoCoin size={32} fontSize={16} />
              <Text style={styles.headerTitle}>{t.ecoShopTitle}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t.comingSoon}</Text>
            </View>
          </View>
          <Text style={styles.headerDesc}>{t.ecoShopDesc}</Text>
        </Animated.View>

        {/* Shop Cards */}
        <View style={styles.cardsContainer}>
          <ShopCard
            emoji="🏪"
            title={t.ecoShopCard1Title}
            description={t.ecoShopCard1Desc}
            comingSoonLabel={t.comingSoon}
            delay={100}
          />
          <ShopCard
            emoji="🛍️"
            title={t.ecoShopCard2Title}
            description={t.ecoShopCard2Desc}
            comingSoonLabel={t.comingSoon}
            delay={200}
          />
          <ShopCard
            emoji="🌱"
            title={t.ecoShopCard3Title}
            description={t.ecoShopCard3Desc}
            comingSoonLabel={t.comingSoon}
            delay={300}
          />
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Text style={styles.infoEmoji}>💡</Text>
            <Text style={styles.infoText}>
              {language === 'en'
                ? 'Start earning EcoPuan today by completing eco-friendly tasks around campus. Rewards are coming soon!'
                : 'Bugun cevreci gorevleri tamamlayarak EcoPuan kazanmaya basla. Oduller yakinda!'}
            </Text>
          </View>
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
    marginBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.textWhite,
    letterSpacing: 0.5,
  },
  badge: {
    backgroundColor: '#1a3a1a',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  badgeText: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  headerDesc: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    opacity: 0.85,
  },
  cardGradient: {
    padding: 20,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardEmoji: {
    fontSize: 32,
  },
  comingSoonBadge: {
    backgroundColor: '#1a3a1a',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  comingSoonText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textWhite,
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 19,
  },
  lockOverlay: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a3a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSection: {
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: '#243d24',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoEmoji: {
    fontSize: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 19,
  },
});
