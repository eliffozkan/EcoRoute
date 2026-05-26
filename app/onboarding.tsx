import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/context/AppContext';
import { translations } from '@/constants/translations';
import { Colors } from '@/constants/colors';
import { Leaf } from 'lucide-react-native';
import { Language } from '@/constants/translations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  bigText: string;
  subtitle: { en: string; tr: string };
  icon: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    bigText: '3 Haftada',
    subtitle: {
      tr: "ODTÜ'de oluşan çöp miktarı Devrim Stadyumu'nu tamamen dolduruyor",
      en: "In 3 weeks, waste generated at METU fills Devrim Stadium completely",
    },
    icon: '🏟️',
  },
  {
    bigText: '%28,6',
    subtitle: {
      tr: "ODTÜ'de düzenli sürdürülebilir davranışlarda bulunan öğrenci oranı",
      en: 'Percentage of METU students who regularly practice sustainable behaviors',
    },
    icon: '📊',
  },
  {
    bigText: '%92,9',
    subtitle: {
      tr: 'Öğrenciler kampüsteki sürdürülebilirlik verilerini görmek istiyor',
      en: 'Students want to see campus sustainability data',
    },
    icon: '🌱',
  },
];

export default function OnboardingScreen() {
  const { language, setIsOnboarded } = useApp();
  const t = translations[language];

  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;
  const slidesOpacity = useRef(new Animated.Value(0)).current;
  const showLogo = useRef(true);

  useEffect(() => {
    // Logo entrance animation
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, tension: 50, friction: 7 }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(logoFloat, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();

    // Floating animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, { toValue: 1.3, duration: 2000, useNativeDriver: true }),
        Animated.timing(logoFloat, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    // After 2.5 seconds, fade out logo and show slides
    const timer = setTimeout(() => {
      showLogo.current = false;
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(slidesOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]).start();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const floatTranslateY = logoFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / SCREEN_WIDTH);
    setCurrentSlide(index);
  };

  const handleGetStarted = async () => {
    await setIsOnboarded(true);
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      {/* Logo Phase */}
      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: logoOpacity, transform: [{ scale: logoScale }, { translateY: floatTranslateY }] },
        ]}
      >
        <View style={styles.logoShadow}>
          <LinearGradient
            colors={['#2d6a4f', '#4CAF50', '#52b788']}
            style={styles.logoCircle}
          >
            <Leaf color={Colors.textWhite} size={48} strokeWidth={2.5} />
          </LinearGradient>
        </View>
        <View style={styles.brandContainer}>
          <Text style={styles.brandEco}>Eco</Text>
          <Text style={styles.brandRoute}>Route</Text>
        </View>
        <Text style={styles.appSubtitle}>METU</Text>
      </Animated.View>

      {/* Slides Phase */}
      <Animated.View style={[styles.slidesContainer, { opacity: slidesOpacity }]}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
        >
          {SLIDES.map((slide, index) => (
            <View key={index} style={styles.slide}>
              <Text style={styles.slideIcon}>{slide.icon}</Text>
              <Text style={styles.slideBigText}>{slide.bigText}</Text>
              <Text style={styles.slideSubtitle}>
                {slide.subtitle[language as Language]}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Pagination dots */}
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentSlide === index && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Get Started button - only show on last slide */}
        {currentSlide === SLIDES.length - 1 && (
          <TouchableOpacity onPress={handleGetStarted} activeOpacity={0.85}>
            <LinearGradient
              colors={['#4CAF50', '#2d6a4f']}
              style={styles.button}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.buttonText}>{t.getStarted}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  logoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoShadow: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 20,
  },
  brandEco: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1,
  },
  brandRoute: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.textWhite,
    letterSpacing: 1,
  },
  appSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 4,
    marginTop: 4,
  },
  slidesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    alignItems: 'center',
  },
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  slideIcon: {
    fontSize: 64,
    marginBottom: 32,
  },
  slideBigText: {
    fontSize: 52,
    fontWeight: '900',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  slideSubtitle: {
    fontSize: 16,
    color: Colors.textGreen,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  pagination: {
    position: 'absolute',
    bottom: 120,
    flexDirection: 'row',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3a5a3a',
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 28,
  },
  button: {
    position: 'absolute',
    bottom: 48,
    paddingVertical: 16,
    paddingHorizontal: 56,
    borderRadius: 50,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: Colors.textWhite,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
