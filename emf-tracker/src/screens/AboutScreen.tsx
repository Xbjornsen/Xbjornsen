import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/colors';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Item({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.item}>
      <Text style={styles.itemIcon}>{icon}</Text>
      <Text style={styles.itemText}>{text}</Text>
    </View>
  );
}

export default function AboutScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.hero}>
        <Text style={styles.heroIcon}>🧲</Text>
        <Text style={styles.heroTitle}>EMF Tracker</Text>
        <Text style={styles.heroVersion}>v1.0.0 — Expo SDK 51</Text>
      </View>

      <Section title="What It Measures">
        <Text style={styles.body}>
          EMF Tracker uses your device's built-in <Text style={styles.highlight}>magnetometer</Text> (Hall-effect sensor) to measure the ambient static magnetic field in <Text style={styles.highlight}>microteslas (µT)</Text> along three axes (X, Y, Z). The total field magnitude is calculated as:
        </Text>
        <View style={styles.formula}>
          <Text style={styles.formulaText}>magnitude = √(X² + Y² + Z²)</Text>
        </View>
        <Text style={styles.body}>
          Readings update at ~10 samples per second. Earth's natural magnetic field typically ranges from 25–65 µT.
        </Text>
      </Section>

      <Section title="Suggested Use Cases">
        <Item icon="🔌" text="Detecting AC electrical wiring inside walls" />
        <Item icon="🏠" text="Locating electrical panels and transformers" />
        <Item icon="📺" text="Checking fields around appliances and motors" />
        <Item icon="💡" text="Mapping EMF hotspots in a room" />
        <Item icon="🔧" text="Identifying stray magnetic fields in equipment" />
        <Item icon="🔬" text="Educational science experiments" />
      </Section>

      <Section title="Alert Levels">
        {[
          { color: COLORS.normal, range: '0–20 µT', label: 'Normal Background' },
          { color: COLORS.elevated, range: '20–50 µT', label: 'Elevated Field' },
          { color: COLORS.high, range: '50–100 µT', label: 'Strong Source Nearby' },
          { color: COLORS.veryHigh, range: '100+ µT', label: 'Very Strong Field' },
        ].map((row) => (
          <View key={row.range} style={styles.alertRow}>
            <View style={[styles.alertDot, { backgroundColor: row.color }]} />
            <Text style={[styles.alertRange, { color: row.color }]}>{row.range}</Text>
            <Text style={styles.alertDesc}>{row.label}</Text>
          </View>
        ))}
      </Section>

      <Section title="Important Limitations">
        <Item
          icon="📡"
          text="This app measures STATIC magnetic fields only — it does NOT measure RF (radio frequency), microwave, or high-frequency EMF radiation."
        />
        <Item
          icon="📱"
          text="The magnetometer is affected by the phone's own electronics. Values near the device's speaker, charging coil, or screen may be elevated."
        />
        <Item
          icon="⚠️"
          text="This is NOT a calibrated scientific instrument. Readings should be treated as indicative, not precise. Do not use for health assessments."
        />
        <Item
          icon="🔄"
          text="Calibrate by rotating the device in a figure-8 pattern when prompted, or whenever readings seem unstable."
        />
      </Section>

      <Section title="Calibration">
        <Text style={styles.body}>
          For best accuracy, calibrate your magnetometer before each session:
        </Text>
        <View style={styles.steps}>
          <Text style={styles.step}>1. Hold the phone flat, away from metal surfaces</Text>
          <Text style={styles.step}>2. Slowly trace a figure-8 pattern in the air</Text>
          <Text style={styles.step}>3. Repeat 2–3 times in all orientations</Text>
          <Text style={styles.step}>4. The sensor will stabilise after ~5 seconds</Text>
        </View>
      </Section>

      <Section title="Privacy">
        <Text style={styles.body}>
          All data is stored locally on your device using AsyncStorage. Nothing is transmitted to any server. Sessions are yours alone.
        </Text>
      </Section>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Built with Expo & React Native</Text>
        <Text style={styles.footerText}>© 2024 Xbjornsen</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 48 },
  hero: { alignItems: 'center', marginBottom: 32, paddingVertical: 16 },
  heroIcon: { fontSize: 52, marginBottom: 12 },
  heroTitle: {
    fontFamily: 'monospace',
    fontSize: 24,
    color: COLORS.accent,
    fontWeight: '900',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  heroVersion: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
    letterSpacing: 1,
  },
  section: {
    marginBottom: 28,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  body: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  highlight: { color: COLORS.accent },
  formula: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formulaText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: COLORS.normal,
    letterSpacing: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  itemIcon: { fontSize: 16, lineHeight: 20 },
  itemText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    flex: 1,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  alertDot: { width: 10, height: 10, borderRadius: 5 },
  alertRange: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
    width: 90,
  },
  alertDesc: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
  steps: { gap: 6, marginTop: 8 },
  step: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    paddingLeft: 8,
  },
  footer: { alignItems: 'center', marginTop: 8, gap: 4 },
  footerText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
});
