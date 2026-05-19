import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useMagnetometer } from '../context/MagnetometerContext';
import { ALERT_COLORS, COLORS, getAlertLevel } from '../constants/colors';
import { HistoryPoint } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_POINTS = 60; // one point per second displayed
const BUCKET_INTERVAL_MS = 1000; // aggregate per 1s bucket

function bucketize(history: HistoryPoint[], now: number): number[] {
  const result: number[] = [];
  for (let i = CHART_POINTS - 1; i >= 0; i--) {
    const bucketEnd = now - i * BUCKET_INTERVAL_MS;
    const bucketStart = bucketEnd - BUCKET_INTERVAL_MS;
    const bucket = history.filter(
      (p) => p.timestamp >= bucketStart && p.timestamp < bucketEnd
    );
    if (bucket.length > 0) {
      const avg = bucket.reduce((s, p) => s + p.magnitude, 0) / bucket.length;
      result.push(parseFloat(avg.toFixed(2)));
    } else {
      result.push(result.length > 0 ? result[result.length - 1] : 0);
    }
  }
  return result;
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, color ? { color } : {}]}>
        {value.toFixed(1)}
      </Text>
      <Text style={styles.statUnit}>µT</Text>
    </View>
  );
}

export default function ChartScreen() {
  const { history, sessionMin, sessionMax, sessionAvg, reading } = useMagnetometer();
  const [paused, setPaused] = useState(false);
  const frozenHistory = useRef<HistoryPoint[]>([]);
  const nowRef = useRef(Date.now());

  useEffect(() => {
    if (!paused) {
      frozenHistory.current = history;
      nowRef.current = Date.now();
    }
  }, [history, paused]);

  const chartData = useMemo(() => {
    const source = paused ? frozenHistory.current : history;
    const now = paused ? nowRef.current : Date.now();
    const data = bucketize(source, now);
    // react-native-chart-kit needs at least 2 points
    if (data.length < 2) return [0, 0];
    return data;
  }, [history, paused]);

  const currentColor = ALERT_COLORS[getAlertLevel(reading.magnitude)];

  const chartLabels = useMemo(() => {
    const labels: string[] = [];
    for (let i = 0; i < CHART_POINTS; i++) {
      labels.push(i % 15 === 0 ? `-${CHART_POINTS - i}s` : '');
    }
    return labels;
  }, []);

  const maxYValue = Math.max(...chartData, 10);
  const yMax = Math.ceil(maxYValue / 10) * 10 + 10;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatBox label="MIN" value={sessionMin} />
        <StatBox
          label="MAX"
          value={sessionMax}
          color={ALERT_COLORS[getAlertLevel(sessionMax)]}
        />
        <StatBox label="AVG" value={sessionAvg} />
        <StatBox
          label="NOW"
          value={reading.magnitude}
          color={currentColor}
        />
      </View>

      {/* Pause / resume */}
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>
          {paused ? '⏸  PAUSED' : '● LIVE  — last 60 seconds'}
        </Text>
        <TouchableOpacity
          style={[styles.pauseBtn, paused && styles.pauseBtnActive]}
          onPress={() => setPaused((p) => !p)}
        >
          <Text style={[styles.pauseText, paused && { color: COLORS.accent }]}>
            {paused ? 'RESUME' : 'PAUSE'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        <LineChart
          data={{ labels: chartLabels, datasets: [{ data: chartData, color: () => currentColor }] }}
          width={SCREEN_WIDTH - 16}
          height={240}
          withDots={false}
          withInnerLines
          withOuterLines={false}
          withShadow={false}
          chartConfig={{
            backgroundColor: COLORS.card,
            backgroundGradientFrom: COLORS.card,
            backgroundGradientTo: COLORS.card,
            color: (opacity = 1) =>
              `rgba(${parseInt(currentColor.slice(1, 3), 16)}, ${parseInt(currentColor.slice(3, 5), 16)}, ${parseInt(currentColor.slice(5, 7), 16)}, ${opacity})`,
            labelColor: () => COLORS.textSecondary,
            strokeWidth: 2,
            propsForBackgroundLines: { stroke: COLORS.border, strokeDasharray: '4' },
            propsForLabels: { fontFamily: 'monospace', fontSize: 9 },
            decimalPlaces: 1,
          }}
          yAxisSuffix="µT"
          fromZero
          style={styles.chart}
          formatYLabel={(v) => `${parseFloat(v).toFixed(0)}`}
        />
      </View>

      {/* Threshold reference lines legend */}
      <View style={styles.legend}>
        {[
          { color: COLORS.normal, label: '0–20 µT  Normal' },
          { color: COLORS.elevated, label: '20–50 µT  Elevated' },
          { color: COLORS.high, label: '50–100 µT  High' },
          { color: COLORS.veryHigh, label: '100+ µT  Very High' },
        ].map((item) => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingVertical: 16, alignItems: 'center' },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 10,
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: 'monospace',
    fontSize: 18,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  statUnit: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  chartTitle: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  pauseBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pauseBtnActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentDim,
  },
  pauseText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  chartWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chart: { borderRadius: 12 },
  legend: {
    width: '100%',
    paddingHorizontal: 16,
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  legendText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});
