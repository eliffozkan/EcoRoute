import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { translations } from '@/constants/translations';
import { Colors } from '@/constants/colors';
import { TASKS } from '@/constants/tasks';
import { useLocalSearchParams, router } from 'expo-router';
import EcoCoin from '@/components/EcoCoin';

const { width } = Dimensions.get('window');

function CornerBracket({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const size = 32;
  const thickness = 3;
  const borderColor = Colors.primary;

  const style: any = {
    position: 'absolute',
    width: size,
    height: size,
  };

  if (position === 'tl') {
    style.top = 0; style.left = 0;
    style.borderTopWidth = thickness; style.borderLeftWidth = thickness;
    style.borderTopLeftRadius = 4;
  } else if (position === 'tr') {
    style.top = 0; style.right = 0;
    style.borderTopWidth = thickness; style.borderRightWidth = thickness;
    style.borderTopRightRadius = 4;
  } else if (position === 'bl') {
    style.bottom = 0; style.left = 0;
    style.borderBottomWidth = thickness; style.borderLeftWidth = thickness;
    style.borderBottomLeftRadius = 4;
  } else {
    style.bottom = 0; style.right = 0;
    style.borderBottomWidth = thickness; style.borderRightWidth = thickness;
    style.borderBottomRightRadius = 4;
  }

  return <View style={[style, { borderColor }]} />;
}

function SuccessModal({
  visible,
  onContinue,
  pointsText,
  continueLabel,
}: {
  visible: boolean;
  onContinue: () => void;
  pointsText: string;
  continueLabel: string;
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 8,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={modalStyles.overlay}>
        <Animated.View style={[modalStyles.card, { transform: [{ scale: scaleAnim }] }]}>
          <View style={modalStyles.coinContainer}>
            <EcoCoin size={72} fontSize={36} />
          </View>
          <Text style={modalStyles.title}>{pointsText}</Text>
          <TouchableOpacity onPress={onContinue} style={modalStyles.continueBtn} activeOpacity={0.85}>
            <LinearGradient
              colors={['#4CAF50', '#2d6a4f']}
              style={modalStyles.continueGradient}
            >
              <Text style={modalStyles.continueText}>{continueLabel}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default function CameraScreen() {
  const { language, addPoints } = useApp();
  const t = translations[language];
  const params = useLocalSearchParams<{ taskId?: string }>();

  const [permission, requestPermission] = useCameraPermissions();
  const [selectedTaskId, setSelectedTaskId] = useState(params.taskId || TASKS[0].id);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [facing] = useState<'back' | 'front'>('back');

  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (params.taskId) setSelectedTaskId(params.taskId);
  }, [params.taskId]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const selectedTask = TASKS.find((task) => task.id === selectedTaskId) || TASKS[0];

  const handleCapture = async () => {
    if (isVerifying) return;
    setIsVerifying(true);

    await new Promise((r) => setTimeout(r, 2000));
    setIsVerifying(false);
    setShowSuccess(true);
  };

  const handleContinue = async () => {
    await addPoints(selectedTaskId, t[selectedTask.nameKey] as string, selectedTask.points);
    setShowSuccess(false);
    router.replace('/(tabs)');
  };

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safePermission}>
        <View style={styles.permissionContainer}>
          <View style={styles.permissionIcon}>
            <EcoCoin size={64} fontSize={32} />
          </View>
          <Text style={styles.permissionTitle}>{t.cameraPermission}</Text>
          <TouchableOpacity onPress={requestPermission} style={styles.permissionBtn}>
            <LinearGradient colors={['#4CAF50', '#2d6a4f']} style={styles.permissionBtnGradient}>
              <Text style={styles.permissionBtnText}>{t.grantPermission}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFill} facing={facing} />
      <View style={styles.overlay} />
      <View style={styles.scannerArea}>
        <CornerBracket position="tl" />
        <CornerBracket position="tr" />
        <CornerBracket position="bl" />
        <CornerBracket position="br" />
        <Animated.View
          style={[styles.scanLine, { transform: [{ translateY: scanLineTranslateY }] }]}
        />
      </View>
      <SafeAreaView style={styles.topPanel} edges={['top']}>
        <Text style={styles.topLabel}>{t.selectTask}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {TASKS.map((task) => {
            const active = task.id === selectedTaskId;
            return (
              <TouchableOpacity
                key={task.id}
                onPress={() => setSelectedTaskId(task.id)}
                style={[styles.chip, active && styles.chipActive]}
                activeOpacity={0.8}
              >
                <Text style={styles.chipIcon}>{task.icon}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
      <View style={styles.bottomPanel}>
        <LinearGradient
          colors={['rgba(26,46,26,0.95)', Colors.background]}
          style={styles.bottomGradient}
        >
          <Text style={styles.taskName}>
            {selectedTask.icon} {t[selectedTask.nameKey] as string}
          </Text>
          {isVerifying ? (
            <View style={styles.verifyingContainer}>
              <Zap color={Colors.accent} size={20} />
              <Text style={styles.verifyingText}>{t.aiVerifying}</Text>
              <View style={styles.verifyingDots}>
                {[0, 1, 2].map((i) => (
                  <VerifyingDot key={i} delay={i * 200} />
                ))}
              </View>
            </View>
          ) : (
            <TouchableOpacity onPress={handleCapture} activeOpacity={0.85}>
              <LinearGradient
                colors={['#4CAF50', '#2d6a4f']}
                style={styles.captureBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.captureBtnContent}>
                  <EcoCoin size={18} fontSize={10} />
                  <Text style={styles.captureBtnText}>{t.captureVerify}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </View>
      <SuccessModal
        visible={showSuccess}
        onContinue={handleContinue}
        pointsText={t.pointsEarned}
        continueLabel={t.continueBtn}
      />
    </View>
  );
}

function VerifyingDot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return <Animated.View style={[styles.dot, { opacity: anim }]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safePermission: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  permissionIcon: {
    marginBottom: 20,
    opacity: 0.6,
  },
  permissionTitle: {
    color: Colors.textWhite,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 32,
  },
  permissionBtn: {
    borderRadius: 50,
    overflow: 'hidden',
  },
  permissionBtnGradient: {
    paddingHorizontal: 40,
    paddingVertical: 16,
  },
  permissionBtnText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  scannerArea: {
    position: 'absolute',
    top: '28%',
    left: '12%',
    right: '12%',
    height: 240,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.primary,
    opacity: 0.8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  topPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  topLabel: {
    color: Colors.textGreen,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 20,
  },
  chip: {
    backgroundColor: 'rgba(36,61,36,0.9)',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(76,175,80,0.25)',
  },
  chipIcon: {
    fontSize: 18,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomGradient: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  taskName: {
    color: Colors.textWhite,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  captureBtn: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 50,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  captureBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  captureBtnText: {
    color: Colors.textWhite,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  verifyingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  verifyingText: {
    color: Colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  verifyingDots: {
    flexDirection: 'row',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    width: width * 0.85,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  coinContainer: {
    marginBottom: 16,
    opacity: 0.3,
  },
  title: {
    color: Colors.textWhite,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 28,
  },
  continueBtn: {
    borderRadius: 50,
    overflow: 'hidden',
    width: '100%',
  },
  continueGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  continueText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },
});
