import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import TabNavigator from './src/navigation/TabNavigator';
import { MagnetometerProvider } from './src/context/MagnetometerContext';
import { SessionProvider } from './src/context/SessionContext';
import { COLORS } from './src/constants/colors';

const CALIBRATION_KEY = '@emf_calibration_shown_v1';

const EMFTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: COLORS.accent,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.textPrimary,
    border: COLORS.border,
    notification: COLORS.accent,
  },
};

export default function App() {
  const [showCalibration, setShowCalibration] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(CALIBRATION_KEY).then((val) => {
      if (!val) setShowCalibration(true);
    });
  }, []);

  const dismissCalibration = async () => {
    await AsyncStorage.setItem(CALIBRATION_KEY, '1');
    setShowCalibration(false);
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={EMFTheme}>
        <StatusBar style="light" backgroundColor={COLORS.background} />
        <MagnetometerProvider>
          <SessionProvider>
            <TabNavigator />
          </SessionProvider>
        </MagnetometerProvider>

        {/* First-launch calibration prompt */}
        <Modal visible={showCalibration} transparent animationType="fade">
          <View style={styles.overlay}>
            <View style={styles.modal}>
              <Text style={styles.modalIcon}>🧭</Text>
              <Text style={styles.modalTitle}>Calibrate Your Sensor</Text>
              <Text style={styles.modalBody}>
                For accurate readings, calibrate the magnetometer now:
              </Text>

              <View style={styles.steps}>
                {[
                  '1.  Hold the phone away from metal objects',
                  '2.  Slowly trace a figure-8 in the air',
                  '3.  Repeat 2–3 times in all orientations',
                  '4.  Sensor stabilises after ~5 seconds',
                ].map((s) => (
                  <Text key={s} style={styles.step}>{s}</Text>
                ))}
              </View>

              <Text style={styles.modalNote}>
                Calibration improves accuracy but is not required to start.
              </Text>

              <TouchableOpacity style={styles.btn} onPress={dismissCalibration}>
                <Text style={styles.btnText}>Got it — start measuring</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 28,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  modalIcon: { fontSize: 48, marginBottom: 12 },
  modalTitle: {
    fontFamily: 'monospace',
    fontSize: 18,
    color: COLORS.accent,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalBody: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  steps: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 14,
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  step: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  modalNote: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 16,
  },
  btn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  btnText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: COLORS.background,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
