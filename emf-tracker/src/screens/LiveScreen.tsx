import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useMagnetometer } from '../context/MagnetometerContext';
import { ALERT_COLORS, ALERT_DIM_COLORS, ALERT_LABELS, COLORS } from '../constants/colors';
import RadialGauge from '../components/RadialGauge';
import AxisReading from '../components/AxisReading';

const HAPTIC_THRESHOLDS = [20, 50, 100];

function getHapticStyle(magnitude: number) {
  if (magnitude >= 100) return Haptics.ImpactFeedbackStyle.Heavy;
  if (magnitude >= 50) return Haptics.ImpactFeedbackStyle.Medium;
  if (magnitude >= 20) return Haptics.ImpactFeedbackStyle.Light;
  return null;
}

export default function LiveScreen() {
  const { reading, alertLevel, isAvailable } = useMagnetometer();
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const captureRef_ = useRef<View>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const hapticIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  // Haptic feedback scaled to field strength
  useEffect(() => {
    if (!hapticsEnabled) return;
    const style = getHapticStyle(reading.magnitude);
    if (style !== null) {
      Haptics.impactAsync(style).catch(() => {});
    }
  }, [reading.magnitude, hapticsEnabled]);

  // Audio-style pulsing haptics (simulates beeping) when audioEnabled
  useEffect(() => {
    if (hapticIntervalRef.current) {
      clearInterval(hapticIntervalRef.current);
      hapticIntervalRef.current = null;
    }

    if (!audioEnabled || reading.magnitude < 5) return;

    const interval = Math.max(100, 2000 - reading.magnitude * 15);
    hapticIntervalRef.current = setInterval(() => {
      Haptics.selectionAsync().catch(() => {});
    }, interval);

    return () => {
      if (hapticIntervalRef.current) clearInterval(hapticIntervalRef.current);
    };
  }, [audioEnabled, reading.magnitude]);

  const handleShare = useCallback(async () => {
    try {
      const sharingAvailable = await Sharing.isAvailableAsync();
      if (!sharingAvailable) {
        // Fallback to React Native Share sheet
        await Share.share({
          message: `EMF Reading:\nTotal: ${reading.magnitude.toFixed(2)} µT\nX: ${reading.x.toFixed(2)} µT\nY: ${reading.y.toFixed(2)} µT\nZ: ${reading.z.toFixed(2)} µT\nStatus: ${ALERT_LABELS[alertLevel]}\n\nMeasured with EMF Tracker`,
        });
        return;
      }
      const uri = await captureRef(captureRef_, { format: 'png', quality: 0.95 });
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share EMF Reading',
      });
    } catch {
      // user dismissed
    }
  }, [reading, alertLevel]);

  const color = ALERT_COLORS[alertLevel];
  const dimColor = ALERT_DIM_COLORS[alertLevel];

  if (isAvailable === false) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.unavailableIcon}>🚫</Text>
        <Text style={styles.unavailableTitle}>Magnetometer Unavailable</Text>
        <Text style={styles.unavailableText}>
          This device does not have a magnetometer sensor. EMF Tracker requires
          a hardware magnetometer to function.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        ref={captureRef_}
        style={[styles.captureArea, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
      >
        {/* Alert level banner */}
        <View style={[styles.alertBanner, { backgroundColor: dimColor, borderColor: color }]}>
          <View style={[styles.alertDot, { backgroundColor: color }]} />
          <Text style={[styles.alertLabel, { color }]}>{ALERT_LABELS[alertLevel]}</Text>
        </View>

        {/* Gauge */}
        <View style={styles.gaugeContainer}>
          <RadialGauge magnitude={reading.magnitude} alertLevel={alertLevel} />
          <View style={styles.magnitudeOverlay}>
            <Text style={[styles.magnitudeValue, { color }]}>
              {reading.magnitude.toFixed(1)}
            </Text>
            <Text style={styles.magnitudeUnit}>µT</Text>
          </View>
        </View>

        {/* Alert bar */}
        <View style={styles.barContainer}>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${Math.min((reading.magnitude / 150) * 100, 100)}%`,
                  backgroundColor: color,
                },
              ]}
            />
          </View>
          <View style={styles.barLabels}>
            {['0', '20', '50', '100', '150+'].map((l) => (
              <Text key={l} style={styles.barLabel}>
                {l}
              </Text>
            ))}
          </View>
        </View>

        {/* Axis readings */}
        <View style={styles.axisRow}>
          <AxisReading axis="X" value={reading.x} color={color} />
          <View style={styles.axisDivider} />
          <AxisReading axis="Y" value={reading.y} color={color} />
          <View style={styles.axisDivider} />
          <AxisReading axis="Z" value={reading.z} color={color} />
        </View>

        {/* Timestamp */}
        <Text style={styles.timestamp}>
          {new Date(reading.timestamp).toLocaleTimeString()}
        </Text>
      </Animated.View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlBtn, hapticsEnabled && styles.controlBtnActive]}
          onPress={() => setHapticsEnabled(!hapticsEnabled)}
        >
          <Text style={styles.controlIcon}>📳</Text>
          <Text style={[styles.controlLabel, hapticsEnabled && { color: COLORS.accent }]}>
            {hapticsEnabled ? 'HAPTIC ON' : 'HAPTIC OFF'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlBtn, audioEnabled && styles.controlBtnActive]}
          onPress={() => setAudioEnabled(!audioEnabled)}
        >
          <Text style={styles.controlIcon}>🔔</Text>
          <Text style={[styles.controlLabel, audioEnabled && { color: COLORS.accent }]}>
            {audioEnabled ? 'BEEP ON' : 'BEEP OFF'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlBtn} onPress={handleShare}>
          <Text style={styles.controlIcon}>📤</Text>
          <Text style={styles.controlLabel}>SHARE</Text>
        </TouchableOpacity>
      </View>

      {isAvailable === null && (
        <Text style={styles.initText}>Initializing sensor…</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: 32,
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  captureArea: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.background,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 24,
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  alertLabel: {
    fontFamily: 'monospace',
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  gaugeContainer: {
    position: 'relative',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  magnitudeOverlay: {
    position: 'absolute',
    alignItems: 'center',
  },
  magnitudeValue: {
    fontFamily: 'monospace',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
  },
  magnitudeUnit: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: COLORS.textSecondary,
    letterSpacing: 2,
  },
  barContainer: {
    width: '100%',
    marginBottom: 24,
  },
  barTrack: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: COLORS.textMuted,
  },
  axisRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  axisDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  timestamp: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  controlBtn: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  controlBtnActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentDim,
  },
  controlIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  controlLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  initText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  unavailableIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  unavailableTitle: {
    fontFamily: 'monospace',
    fontSize: 18,
    color: COLORS.textPrimary,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  unavailableText: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
