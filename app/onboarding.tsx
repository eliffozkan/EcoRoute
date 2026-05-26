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
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/context/AppContext';
import { translations } from '@/constants/translations';
import { Colors } from '@/constants/colors';
import { Leaf, ChevronLeft, ChevronRight } from 'lucide-react-native';
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
  const [showSlides, setShowSlides] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;
  const slidesOpacity = useRef(new Animated.Value(0)).current;

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
      setShowSlides(true);
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
    if (index >= 0 && index < SLIDES.length) {
      setCurrentSlide(index);
    }
  };

  const scrollToSlide = (index: number) => {
    if (index >= 0 && index < SLIDES.length) {
      scrollViewRef.current?.scrollTo({
        x: SCREEN_WIDTH * index,
        animated: true,
      });
      setCurrentSlide(index);
    }
  };

  const goToNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      scrollToSlide(currentSlide + 1);
    }
  };

  const goToPrev = () => {
    if (currentSlide > 0) {
      scrollToSlide(currentSlide - 1);
    }
  };

  const handleGetStarted = async () => {
    try {
      await setIsOnboarded(true);
      router.replace('/(tabs)');
    } catch (e) {
      // Fallback navigation
      router.replace('/(tabs)');
    }
  };

  const handleSkip = () => {
    handleGetStarted();
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
      <Animated.View style={[styles.slidesContainer, { opacity: slidesOpacity, zIndex: showSlides ? 10 : 0 }]}>
        {/* Left Arrow */}
        {showSlides && (
          <TouchableOpacity
            style={[styles.navArrow, styles.navArrowLeft]}
            onPress={goToPrev}
            activeOpacity={0.7}
            disabled={currentSlide === 0}
          >
            <ChevronLeft
              color={currentSlide === 0 ? Colors.textMuted : Colors.primary}
              size={28}
            />
          </TouchableOpacity>
        )}

        {/* Right Arrow */}
        {showSlides && (
          <TouchableOpacity
            style={[styles.navArrow, styles.navArrowRight]}
            onPress={goToNext}
            activeOpacity={0.7}
            disabled={currentSlide === SLIDES.length - 1}
          >
            <ChevronRight
              color={currentSlide === SLIDES.length - 1 ? Colors.textMuted : Colors.primary}
              size={28}
            />
          </TouchableOpacity>
        )}

        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
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
            <TouchableOpacity
              key={index}
              onPress={() => scrollToSlide(index)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.dot,
                  currentSlide === index && styles.dotActive,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom buttons container */}
        <View style={styles.buttonsContainer}>
          {/* Skip button - visible on slides 1 and 2 */}
          {currentSlide < SLIDES.length - 1 && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              activeOpacity={0.7}
            >
              <Text style={styles.skipText}>
                {language === 'en' ? 'Skip' : 'Geç'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Get Started button - visible on ALL slides */}
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
        </View>
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
    zIndex: 5,
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
  navArrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(36,61,36,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    zIndex: 20,
  },
  navArrowLeft: {
    left: 16,
  },
  navArrowRight: {
    right: 16,
  },
  scrollContent: {
    alignItems: 'center',
  },
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
    paddingTop: 60,
  },
  slideIcon: {
    fontSize: 56,
    marginBottom: 28,
  },
  slideBigText: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  slideSubtitle: {
    fontSize: 15,
    color: Colors.textGreen,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  pagination: {
    position: 'absolute',
    bottom: 140,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2a4a2a',
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 28,
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 30,
  },
  skipButton: {
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
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
